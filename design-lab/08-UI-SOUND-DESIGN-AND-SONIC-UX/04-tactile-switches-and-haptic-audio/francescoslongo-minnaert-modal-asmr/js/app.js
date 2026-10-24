/* Hush: Transport, sleep timer, recording, room, scenes, installable app. Loaded as a classic script; see index.html for the order. */

/* ---------------- transport ---------------- */
const playBtn=document.getElementById('play');
const masterIn=document.getElementById('master');
function toast(msg){
  const t=document.getElementById('toast'); t.textContent=msg; t.hidden=false;
  clearTimeout(toast.id); toast.id=setTimeout(()=>t.hidden=true,3500);
}
// A silent looping <audio> element: gives lock-screen controls a media element to attach to,
// and on iPhone lets Web Audio play even when the ring/silent switch is on silent.
function silentWav(secs=10,sr=8000){
  const n=secs*sr, b=new ArrayBuffer(44+n), d=new DataView(b), w=(o,str)=>[...str].forEach((c,i)=>d.setUint8(o+i,c.charCodeAt(0)));
  w(0,'RIFF'); d.setUint32(4,36+n,true); w(8,'WAVE'); w(12,'fmt '); d.setUint32(16,16,true); d.setUint16(20,1,true); d.setUint16(22,1,true);
  d.setUint32(24,sr,true); d.setUint32(28,sr,true); d.setUint16(32,1,true); d.setUint16(34,8,true); w(36,'data'); d.setUint32(40,n,true);
  new Uint8Array(b,44).fill(128);
  return b;
}
const keepAlive=new Audio(URL.createObjectURL(new Blob([silentWav()],{type:'audio/wav'})));
keepAlive.loop=true; keepAlive.setAttribute('playsinline','');
let sceneTitle='Hush';
function setMeta(title){
  sceneTitle=title||'Hush';
  if(!('mediaSession' in navigator)) return;
  try{navigator.mediaSession.metadata=new MediaMetadata({title:sceneTitle,artist:'Hush',album:'Procedural ASMR',
    artwork:[{src:'icons/icon-192.png',sizes:'192x192',type:'image/png'},{src:'icons/icon-512.png',sizes:'512x512',type:'image/png'}]})}catch(e){}
}
async function startPlayback(){
  if(!ctx){playBtn.disabled=true; await initAudio(); playBtn.disabled=false}
  await ctx.resume(); clock.run(true); playing=true; requestDraw();
  playBtn.textContent='Pause'; playBtn.setAttribute('aria-pressed','true');
  keepAlive.play().catch(()=>{});
  if('mediaSession' in navigator){navigator.mediaSession.playbackState='playing'; if(!navigator.mediaSession.metadata) setMeta(sceneTitle)}
  if(recorder?.state==='paused') recorder.resume();
  if(sleepPending) setSleep(sleepPending);
}
async function pausePlayback(){
  if(!ctx||!playing) return;
  playing=false; clock.run(false); await ctx.suspend();
  playBtn.textContent='Resume'; playBtn.setAttribute('aria-pressed','false');
  keepAlive.pause();
  if('mediaSession' in navigator) navigator.mediaSession.playbackState='paused';
  if(recorder?.state==='recording') recorder.pause();
}
playBtn.addEventListener('click',()=>playing?pausePlayback():startPlayback());
if('mediaSession' in navigator){
  for(const [a,f] of [['play',startPlayback],['pause',pausePlayback],['stop',pausePlayback]]){
    try{navigator.mediaSession.setActionHandler(a,()=>f())}catch(e){}
  }
}

/* ---------------- sleep timer ----------------
   Counts listening time on the audio clock (pausing pauses it). Over the last
   stretch (a third of the time, at most 5 minutes) the level falls exponentially,
   60 dB in all, which sounds like an even fade; then playback pauses. */
const sleepSel=document.getElementById('sleep'), sleepLeft=document.getElementById('sleepLeft');
let sleepEnd=0, sleepPending=0;
function setSleep(m){
  sleepPending=0; sleepEnd=0;
  if(FADE){const now=ctx.currentTime; FADE.gain.cancelScheduledValues(now); FADE.gain.setValueAtTime(FADE.gain.value,now); FADE.gain.linearRampToValueAtTime(1,now+0.3)}
  if(m&&(!ctx||!playing)) sleepPending=m;
  else if(m){
    const now=ctx.currentTime, dur=m*60, fade=Math.min(300,dur/3);
    sleepEnd=now+dur;
    FADE.gain.setValueAtTime(1,sleepEnd-fade);
    FADE.gain.exponentialRampToValueAtTime(0.001,sleepEnd);
  }
  updateTimers();
}
function sleepFinished(){
  sleepEnd=0; sleepSel.value='0';
  pausePlayback().then(()=>{FADE.gain.cancelScheduledValues(0); FADE.gain.value=1; updateTimers()});
}
sleepSel.addEventListener('change',()=>setSleep(+sleepSel.value));

/* ---------------- recording ----------------
   Records the final mix (after the compressor) with MediaRecorder, as Opus in
   WebM or Ogg, or AAC in MP4 on Safari, and downloads it when stopped. */
const recBtn=document.getElementById('recBtn');
let recorder=null, recChunks=[], recStartAudio=0;
const REC_TYPES=[['audio/webm;codecs=opus','webm'],['audio/ogg;codecs=opus','ogg'],['audio/mp4','m4a'],['audio/webm','webm']];
recBtn.addEventListener('click',async()=>{
  if(recorder){recorder.stop(); return}
  if(!window.MediaRecorder){toast("This browser can't record audio."); return}
  if(!playing) await startPlayback();
  const t=REC_TYPES.find(([m])=>MediaRecorder.isTypeSupported(m));
  try{recorder=new MediaRecorder(RECDEST.stream,t?{mimeType:t[0],audioBitsPerSecond:192000}:{})}
  catch(e){toast("Recording couldn't start in this browser."); recorder=null; return}
  recChunks=[]; recStartAudio=ctx.currentTime;
  recorder.ondataavailable=e=>{if(e.data.size) recChunks.push(e.data)};
  recorder.onstop=()=>{
    const type=recorder.mimeType||t?.[0]||'audio/webm', ext=(REC_TYPES.find(([m])=>type.startsWith(m.split(';')[0]))||[,'webm'])[1];
    const blob=new Blob(recChunks,{type}), a=el('a',{href:URL.createObjectURL(blob)});
    const d=new Date(), pad=x=>String(x).padStart(2,'0');
    a.download=`hush-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.${ext}`;
    document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),20000);
    recorder=null; recBtn.classList.remove('recording'); recBtn.textContent='Record';
    toast('Recording saved as '+a.download);
  };
  recorder.start(1000); recBtn.classList.add('recording');
  updateTimers();
});
const mmss=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
function updateTimers(){
  if(recorder) recBtn.textContent='Stop recording '+mmss(ctx.currentTime-recStartAudio);
  if(sleepEnd&&ctx){const left=Math.max(0,sleepEnd-ctx.currentTime); sleepLeft.textContent=left<60?'less than a minute left':Math.ceil(left/60)+' min left'}
  else sleepLeft.textContent=sleepPending?'starts when you press play':'';
}
setInterval(updateTimers,500);

/* ---------------- room selector ---------------- */
const roomSel=document.getElementById('room');
Object.entries(ROOMS).forEach(([k,R])=>roomSel.append(new Option(R.label,k,false,k===ROOM)));
roomSel.addEventListener('change',()=>setRoom(roomSel.value));

/* ---------------- scenes ----------------
   A scene stores the whole mix except Your sounds (their files can't be kept):
   master volume, room, key and scale, which sounds are on, every setting that
   differs from its default, and the patterns with their links. */
function setCtrl(q,val){
  if(q.input){if(Math.abs(+q.input.value-(+val))<1e-9) return; q.input.value=val; q.input.dispatchEvent(new Event('input'))}
  else{if(q.s.value===String(val)) return; q.s.value=val; q.s.dispatchEvent(new Event('change'))}
}
const inScene=v=>!v.def.custom;
function currentScene(name){
  const S={v:1,name,master:+masterIn.value,room:ROOM,key:MUSIC.root,scale:MUSIC.scale,on:[],set:{},links:[],pats:[]};
  for(const v of voices){
    if(!inScene(v)) continue;
    if(v.p.on) S.on.push(v.def.id);
    const d={};
    for(const q of PARAMS) if(q.v===v&&Math.abs(v.p[q.key]-q.init)>1e-9) d[q.key]=+(+v.p[q.key]).toFixed(4);
    for(const q of SELECTS) if(q.v===v&&v.p[q.key]!==q.init) d[q.key]=v.p[q.key];
    if(Object.keys(d).length) S.set[v.def.id]=d;
  }
  const idx=new Map();
  for(const L of LINKS.values()){
    if(!inScene(L.param.v)) continue;
    if(!idx.has(L.pat)){idx.set(L.pat,S.pats.length); S.pats.push({n:L.pat.name,v:L.pat.values})}
    S.links.push({s:L.param.v.def.id,k:L.param.key,sp:+L.speed.toFixed(3),p:idx.get(L.pat)});
  }
  return S;
}
function patternValues(P){
  if(P.v) return P.v;
  if(P.q){                                               // from a link: bytes, resampled to the stored length
    const b=b64u.dec(P.q), n=P.d||b.length, out=new Array(n);
    for(let i=0;i<n;i++){const x=i*(b.length-1)/Math.max(1,n-1), a=Math.floor(x), f=x-a; out[i]=(b[a]+(b[Math.min(b.length-1,a+1)]-b[a])*f)/255}
    return out;
  }
  const n=Math.round(P.len/PDT), G=GENS[P.gen], lo=P.lo??0, hi=P.hi??1;   // generated on the spot
  return G.make(n,Math.round((P.rate??1)*P.len),P.len).map(v=>lo+(hi-lo)*v);
}
async function applyScene(S,{play=false}={}){
  PATTERN_API.unlinkWhere(L=>inScene(L.param.v));
  for(const v of voices) if(inScene(v)&&v.p.on){v.ui.sw.checked=false; v.ui.sw.dispatchEvent(new Event('change'))}
  for(const q of PARAMS) if(inScene(q.v)) setCtrl(q,S.set?.[q.v.def.id]?.[q.key]??q.init);
  for(const q of SELECTS) if(inScene(q.v)) setCtrl(q,S.set?.[q.v.def.id]?.[q.key]??q.init);
  if(S.key!=null&&MUSIC_SEL){MUSIC_SEL.key.value=S.key; MUSIC_SEL.sc.value=S.scale??MUSIC.scale; MUSIC_SEL.onKey()}
  if(S.master!=null){masterIn.value=S.master; masterIn.dispatchEvent(new Event('input'))}
  if(S.room&&ROOMS[S.room]&&S.room!==ROOM){roomSel.value=S.room; setRoom(S.room)}
  for(const id of S.on||[]){const v=voices.find(x=>x.def.id===id); if(v&&inScene(v)){v.ui.sw.checked=true; v.ui.sw.dispatchEvent(new Event('change'))}}
  const pats=(S.pats||[]).map(P=>PATTERN_API.importPattern(P.n||'Scene pattern',patternValues(P)));
  for(const l of S.links||[]){
    const param=PARAMS.find(q=>q.v.def.id===l.s&&q.key===l.k);
    if(param&&pats[l.p]) PATTERN_API.link(pats[l.p],param,l.sp||1);
  }
  setMeta(S.name);
  if(play&&!playing) await startPlayback();
  renderNow?.();
}
// share links: JSON, compressed with deflate when the browser can, in base64url
const b64u={
  enc(bytes){let s=''; for(let i=0;i<bytes.length;i+=8192) s+=String.fromCharCode(...bytes.subarray(i,i+8192)); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')},
  dec(str){return Uint8Array.from(atob(str.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))}
};
async function packScene(S){
  const T={...S,pats:S.pats.map(P=>{                     // patterns: at most 400 points, one byte each
    const v=patternValues(P), m=Math.min(400,v.length), b=new Uint8Array(m);
    for(let i=0;i<m;i++){const x=i*(v.length-1)/Math.max(1,m-1), a=Math.floor(x), f=x-a; b[i]=Math.round(255*clamp(v[a]+((v[Math.min(v.length-1,a+1)])-v[a])*f,0,1))}
    return {n:P.n,d:v.length,q:b64u.enc(b)};
  })};
  const json=new TextEncoder().encode(JSON.stringify(T));
  if(window.CompressionStream){
    try{const z=new Uint8Array(await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()); return 'z'+b64u.enc(z)}catch(e){}
  }
  return 'j'+b64u.enc(json);
}
async function unpackScene(str){
  const bytes=b64u.dec(str.slice(1));
  const json=str[0]==='z'?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text():new TextDecoder().decode(bytes);
  return JSON.parse(json);
}
async function shareScene(S){
  const url=location.href.split('#')[0]+'#s='+await packScene(S);
  try{await navigator.clipboard.writeText(url); toast('Link copied. Anyone who opens it hears this mix.')}
  catch(e){window.prompt('Copy this link:',url)}
}

const BUILTIN_SCENES=[
  {name:'Rainy cabin',room:'room',on:['noise','rain','fire'],
   set:{noise:{color:'brown',vol:0.22},rain:{vol:0.55,dist:1.8,angle:-25},fire:{vol:0.45,angle:140,dist:1.1}}},
  {name:'Spa',room:'bath',key:2,scale:'majPent',on:['noise','bowl','drops','pad'],
   set:{noise:{color:'pink',vol:0.12,tone:0.6},bowl:{style:'sing',size:'large',vol:0.35},drops:{vol:0.5,rate:0.6,angle:-60,dist:1},pad:{vol:0.22,bright:0.25,change:2}}},
  {name:'Night by the pond',room:'outdoors',on:['noise','frogs','crickets','drops'],
   set:{noise:{color:'brown',vol:0.14},crickets:{temp:18,count:3,vol:0.3},frogs:{rate:0.5,vol:0.45},drops:{rate:0.3,vol:0.3,dist:1.6,angle:-120}}},
  {name:'Forest morning',room:'outdoors',key:7,scale:'majPent',on:['noise','birds','chimes'],
   set:{noise:{color:'pink',vol:0.12,tone:0.5},birds:{vol:0.4,rate:1.2},chimes:{wind:0.25,vol:0.25,angle:60}}},
  {name:'Close attention',room:'room',on:['noise','whisper','mouth','brush'],
   set:{noise:{color:'pink',vol:0.1},whisper:{vol:0.5,mode:'static',dist:0.25},mouth:{vol:0.4},brush:{vol:0.5,angle:-90,dist:0.2}},
   pats:[{n:'Ear to ear (scene)',gen:'sine',len:10,lo:0.25,hi:0.75}],links:[{s:'whisper',k:'angle',sp:1,p:0}]},
  {name:'Crinkle workshop',room:'room',on:['noise','tap','crack','squish'],
   set:{noise:{color:'grey',vol:0.1},tap:{material:'wood',vol:0.55},crack:{material:'plastic',vol:0.5,angle:50},squish:{vol:0.5,angle:-40}}},
  {name:'Meditation',room:'hall',key:9,scale:'minPent',on:['noise','bowl','chimes','pad'],
   set:{noise:{color:'brown',vol:0.12},bowl:{style:'strike',size:'medium',rate:3,vol:0.45},chimes:{wind:0.2,vol:0.25,tubes:'low'},pad:{vol:0.2,bright:0.2,change:1.5}}}
];

// Surprise me: one or two background layers, two or three foreground sounds spread around you
const BEDS=['noise','rain','fire','pad','crickets'];
const FORE=['tap','brush','squish','crack','drops','mouth','whisper','purr','kalimba','bowl','chimes','birds','frogs','harp'];
const CLOSE=new Set(['mouth','whisper','brush','squish','purr','tap','crack']);
function surpriseScene(){
  const shuffle=a=>a.map(x=>[rand(),x]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
  const beds=shuffle(BEDS).slice(0,rand()<0.35?2:1), fore=shuffle(FORE).slice(0,rand()<0.4?3:2);
  const S={name:'Surprise mix',on:[...beds,...fore],set:{}};
  const base=rand()*360-180;
  fore.forEach((id,i)=>{
    const a=((base+i*360/fore.length+(rand()-0.5)*30+540)%360)-180;
    S.set[id]={angle:Math.round(a),dist:+(CLOSE.has(id)?0.18+rand()*0.3:0.5+rand()*1.2).toFixed(2),vol:+(0.45+rand()*0.2).toFixed(2),
      mode:pick(['static','static','wander','sweep','orbit']),speed:Math.round(8+rand()*20)};
  });
  beds.forEach(id=>{
    S.set[id]={vol:+(0.25+rand()*0.2).toFixed(2),dist:+(1.4+rand()).toFixed(2),angle:Math.round(rand()*360-180)};
    if(id==='noise') Object.assign(S.set[id],{color:pick(['pink','brown','grey']),vol:0.18});
    if(id==='pad') S.set[id].vol=0.22;
  });
  const has=list=>S.on.some(id=>list.includes(id));
  const animals=has(['birds','frogs','crickets']), music=has(['kalimba','bowl','chimes','harp','pad']);
  S.room=animals&&!music?'outdoors':music&&rand()<0.5?'hall':pick(['room','room','bath']);
  S.key=rint(12); S.scale=pick(['majPent','majPent','minPent','dorian','major','minor']);
  return S;
}
document.getElementById('surprise').addEventListener('click',()=>applyScene(surpriseScene(),{play:true}));

/* Chaos mode: a new Surprise mix at a fixed interval of listening time (audio clock,
   so pausing pauses it). Each change dips the master level, swaps the mix while it
   is quiet and brings the level back, so changes don't cut in abruptly. */
const chaosSel=document.getElementById('chaos');
async function chaosStep(){
  if(chaosBusy) return;
  chaosBusy=true;
  const fade=Math.min(1.2,chaosEvery/5), now=ctx.currentTime, lvl=+masterIn.value;
  chaosNext=now+chaosEvery;
  master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value,now);
  master.gain.linearRampToValueAtTime(0.0001,now+fade);
  await new Promise(r=>setTimeout(r,fade*1000));
  if(chaosEvery){
    await applyScene(surpriseScene());
    setMeta('Chaos mode');
  }
  const t=ctx.currentTime;
  master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(0.0001,t);
  master.gain.linearRampToValueAtTime(+masterIn.value||lvl,t+fade*1.3);
  chaosBusy=false;
}
const chaosBtn=document.getElementById('chaosBtn');
chaosBtn.addEventListener('click',async()=>{
  const on=chaosBtn.getAttribute('aria-pressed')!=='true';
  chaosBtn.setAttribute('aria-pressed',String(on));
  chaosEvery=on?+chaosSel.value:0;
  if(!on) return;                              // off: keep the current mix
  if(!playing){await applyScene(surpriseScene(),{play:true}); setMeta('Chaos mode'); chaosNext=ctx.currentTime+chaosEvery}
  else chaosNext=ctx.currentTime;             // change right away
});
chaosSel.addEventListener('change',()=>{
  if(!chaosEvery) return;
  chaosEvery=+chaosSel.value; chaosNext=ctx.currentTime+chaosEvery;
});

const SCENES=(()=>{try{return JSON.parse(localStorage.getItem('hush.scenes')||'[]')}catch(e){return []}})();
const saveScenes=()=>{try{localStorage.setItem('hush.scenes',JSON.stringify(SCENES))}catch(e){toast("Couldn't save: this browser's storage is full or blocked.")}};
function buildScenesPanel(){
  const sec=sectionOf.scenes;
  const soundNames=S=>(S.on||[]).map(id=>voices.find(v=>v.def.id===id)?.def.name).filter(Boolean).join(', ');
  const row=(S,...acts)=>el('div',{className:'scene'},el('div',{className:'scene-meta'},el('b',{textContent:S.name}),el('span',{textContent:soundNames(S)||'Nothing on'})),el('div',{className:'acts'},...acts));
  const btn=(label,f)=>{const b=el('button',{className:'btn',type:'button',textContent:label}); b.addEventListener('click',f); return b};
  const ready=el('div',{className:'scenes'},...BUILTIN_SCENES.map(S=>row(S,btn('Play',()=>applyScene(S,{play:true})))));
  const nameIn=el('input',{type:'text',placeholder:'Name this mix',maxLength:40});
  nameIn.setAttribute('aria-label','Name for the current mix');
  const mine=el('div',{className:'scenes'}), none=el('p',{className:'empty',textContent:'No saved mixes yet.'});
  function render(){
    mine.replaceChildren(); none.hidden=SCENES.length>0;
    SCENES.forEach((S,i)=>mine.append(row(S,
      btn('Play',()=>applyScene(S,{play:true})),
      btn('Copy link',()=>shareScene(S)),
      btn('Delete',()=>{SCENES.splice(i,1); saveScenes(); render()}))));
  }
  const save=btn('Save current mix',()=>{
    const name=nameIn.value.trim()||'Mix '+(SCENES.length+1);
    const S=currentScene(name), old=SCENES.findIndex(x=>x.name===name);
    if(old>=0) SCENES[old]=S; else SCENES.push(S);
    saveScenes(); render(); nameIn.value=''; setMeta(name); toast(`Saved "${name}".`);
  });
  const share=btn('Copy link to current mix',()=>shareScene(currentScene(nameIn.value.trim()||'Shared mix')));
  sec.append(el('h3',{className:'scenes-h',textContent:'Ready-made'}),ready,
    el('h3',{className:'scenes-h',textContent:'Your mixes'}),el('div',{className:'save-row'},nameIn,save,share),none,mine);
  render();
}
buildScenesPanel();
// a mix opened from a shared link
if(location.hash.startsWith('#s=')){
  unpackScene(location.hash.slice(3)).then(S=>{
    applyScene(S);
    history.replaceState(null,'',location.href.split('#')[0]);
    toast(`Loaded "${S.name}". Press Start listening.`);
  }).catch(()=>toast("This link's mix couldn't be read."));
}

/* ---------------- installable app ---------------- */
if('serviceWorker' in navigator&&location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(()=>{});
const installBtn=document.getElementById('installBtn');
let installPrompt=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault(); installPrompt=e; installBtn.hidden=false});
installBtn.addEventListener('click',async()=>{if(!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice.catch(()=>{}); installPrompt=null; installBtn.hidden=true});
addEventListener('appinstalled',()=>{installBtn.hidden=true});
document.getElementById('master').addEventListener('input',e=>{if(master) master.gain.setTargetAtTime(+e.target.value,ctx.currentTime,0.05)});
