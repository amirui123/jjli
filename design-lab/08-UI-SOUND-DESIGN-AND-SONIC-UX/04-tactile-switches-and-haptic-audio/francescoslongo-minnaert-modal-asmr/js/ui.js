/* Hush: Controls, sections, sound cards, Your sounds panel. Loaded as a classic script; see index.html for the order. */

/* ---------------- UI ---------------- */
const MODES=[['static','Still'],['orbit','Circle around me'],['sweep','Ear to ear'],['wander','Drift']];
function rangeCtrl(v,key,label,min,max,step,fmt){
  const el=document.createElement('label'); el.className='ctrl';
  const out=document.createElement('b'); out.textContent=fmt(v.p[key]);
  const sp=document.createElement('span'); sp.append(label,out);
  const r=Object.assign(document.createElement('input'),{type:'range',min,max,step,value:v.p[key]});
  PARAMS.push({v,key,label,min,max,input:r,el,init:v.p[key]});
  r.addEventListener('input',()=>{
    if(key==='speed') {v.p.speed=+r.value; v.retime()}
    v.p[key]=+r.value; out.textContent=fmt(v.p[key]); v.posDirty=true; requestDraw();
    if(key==='vol'&&v.active) v.inp.gain.setTargetAtTime(v.p.vol,ctx.currentTime,0.05);
    if(key==='rev'&&v.active) v.send.gain.setTargetAtTime(v.p.rev,ctx.currentTime,0.05);
    if(key==='vol'&&v.ui?.nowVol) v.ui.nowVol.value=r.value;
    if(FILTER_KEYS.has(key)) filterChanged(v);
    else if(v.active) GEN[v.def.id].update?.(v,key);
  });
  el.append(sp,r); return el;
}
function selectCtrl(v,key,label,opts){
  const el=document.createElement('label'); el.className='ctrl'; el.append(label);
  const s=document.createElement('select');
  SELECTS.push({v,key,s,init:v.p[key]});
  opts.forEach(o=>{const [val,txt]=Array.isArray(o)?o:[o,o[0].toUpperCase()+o.slice(1)]; s.append(new Option(txt,val,false,v.p[key]===val))});
  s.addEventListener('change',()=>{
    v.p[key]=s.value; v.posDirty=true; requestDraw();
    if(FILTER_KEYS.has(key)) filterChanged(v);
    else if(v.active) GEN[v.def.id].update?.(v,key);
  });
  el.append(s); return el;
}
// Frequency-response plot, computed on a tiny offline context so it works before audio starts
const AN=new OfflineAudioContext(1,1,48000);
const AN_F=['highpass','highpass','lowpass','lowpass'].map(type=>new BiquadFilterNode(AN,{type}));
const NF=256, FREQS=Float32Array.from({length:NF},(_,i)=>20*Math.pow(1000,i/(NF-1)));
const MAG=new Float32Array(NF), PH=new Float32Array(NF), TOT=new Float32Array(NF);
function drawBode(v){
  const cvs=v.ui.plot, k=window.devicePixelRatio||1, W=Math.round(cvs.clientWidth*k), H=Math.round(cvs.clientHeight*k);
  if(!W||!H) return;
  if(cvs.width!==W||cvs.height!==H){cvs.width=W; cvs.height=H}
  const S=filterSettings(v.p,AN.sampleRate/2);
  TOT.fill(1);
  AN_F.forEach((f,i)=>{f.frequency.value=S[i].f; f.Q.value=S[i].q; f.getFrequencyResponse(FREQS,MAG,PH); for(let j=0;j<NF;j++) TOT[j]*=MAG[j]});
  const top=24, bot=-48, X=f=>Math.log10(f/20)/3*W, Y=d=>(top-clamp(d,bot,top))/(top-bot)*H;
  const g=cvs.getContext('2d');
  g.clearRect(0,0,W,H);
  g.lineWidth=k; g.strokeStyle='rgba(138,155,165,.25)'; g.fillStyle='rgba(138,155,165,.8)'; g.font=`${10*k}px system-ui,sans-serif`;
  [100,1000,10000].forEach(f=>{g.beginPath(); g.moveTo(X(f),0); g.lineTo(X(f),H); g.stroke(); g.fillText(fmtHz(f),X(f)+3*k,H-4*k)});
  [0,-24].forEach(d=>{g.beginPath(); g.moveTo(0,Y(d)); g.lineTo(W,Y(d)); g.stroke(); g.fillText(d+' dB',3*k,Y(d)-3*k)});
  g.strokeStyle=v.def.color; g.lineWidth=2*k; g.beginPath();
  for(let j=0;j<NF;j++){const x=X(FREQS[j]), y=Y(20*Math.log10(TOT[j]+1e-9)); j?g.lineTo(x,y):g.moveTo(x,y)}
  g.stroke();
}
function refreshFilterUI(v){
  v.ui.sum.innerHTML='Filter: <b>'+filterSummary(v.p)+'</b>';
  if(v.ui.det.open) drawBode(v);
}
function filterChanged(v){
  if(v.active) applyFilter(v);
  refreshFilterUI(v);
}
const root=document.getElementById('sources');
// Section menu: a custom dropdown so active sections can carry a coloured dot
const menuBtn=el('button',{className:'menu-btn',type:'button',id:'menuBtn'});
menuBtn.innerHTML='<span class="mdot"></span><span class="mlabel"></span><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
menuBtn.setAttribute('aria-haspopup','listbox'); menuBtn.setAttribute('aria-expanded','false');
const menuList=el('ul',{className:'menu-list',id:'menuList',hidden:true});
menuList.setAttribute('role','listbox'); menuList.setAttribute('aria-labelledby','menuLbl');
const jump=el('nav',{className:'jump'},el('span',{className:'lbl',id:'menuLbl',textContent:'Section'}),el('div',{className:'menu'},menuBtn,menuList));
jump.setAttribute('aria-label','Sections');
root.append(jump);
let MUSIC_SEL=null;
const SECTIONS=[['now','Now playing'],['scenes','Scenes'],...GROUPS,['patterns','Patterns']];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentSection='now';
const menuItems={};
// Only the chosen section is shown
function showSection(id){
  currentSection=id;
  for(const [sid] of SECTIONS){
    sectionOf[sid].hidden=sid!==id;
    menuItems[sid].setAttribute('aria-selected',String(sid===id));
  }
  menuBtn.querySelector('.mlabel').textContent=menuItems[id].dataset.name;
  updateCounts();
  // canvases in a section that was hidden have no size yet: redraw them now
  if(id==='now') renderNow?.();
  voices.forEach(v=>{if(v.def.group===id){refreshFilterUI(v); v.ui.redraw?.()}});
  const top=root.getBoundingClientRect().top;          // if the list start is scrolled away, bring it back
  if(top<0) scrollBy(0,top);
}
const menuOpen=()=>!menuList.hidden;
function openMenu(){
  menuList.hidden=false; menuBtn.setAttribute('aria-expanded','true');
  menuItems[currentSection].focus();
}
function closeMenu(refocus){
  menuList.hidden=true; menuBtn.setAttribute('aria-expanded','false');
  if(refocus) menuBtn.focus();
}
menuBtn.addEventListener('click',()=>menuOpen()?closeMenu(false):openMenu());
menuBtn.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault(); openMenu()}});
menuList.addEventListener('keydown',e=>{
  const list=SECTIONS.map(([id])=>menuItems[id]), i=list.indexOf(document.activeElement);
  const go=k=>{e.preventDefault(); list[(k+list.length)%list.length].focus()};
  if(e.key==='ArrowDown') go(i+1);
  else if(e.key==='ArrowUp') go(i-1);
  else if(e.key==='Home') go(0);
  else if(e.key==='End') go(list.length-1);
  else if(e.key==='Enter'||e.key===' '){e.preventDefault(); if(i>=0){showSection(list[i].dataset.id); closeMenu(true)}}
  else if(e.key==='Escape'){e.preventDefault(); closeMenu(true)}
  else if(e.key==='Tab') closeMenu(false);
});
document.addEventListener('pointerdown',e=>{if(menuOpen()&&!jump.contains(e.target)) closeMenu(false)});
const sectionOf={}, counts={};
for(const [id,name] of SECTIONS){
  const sec=el('section',{className:'group',id:'g-'+id},el('h2',{className:'group-title',textContent:name}));
  root.append(sec); sectionOf[id]=sec;
  if(id==='music'){
    const key=el('select'), sc=el('select');
    NOTE_NAMES.forEach((n,i)=>key.append(new Option(n,i,false,i===MUSIC.root)));
    Object.entries(SCALES).forEach(([k,[n]])=>sc.append(new Option(n,k,false,k===MUSIC.scale)));
    const onKey=()=>{
      MUSIC.root=+key.value; MUSIC.scale=sc.value;
      voices.forEach(v=>{if(v.active&&v.def.group==='music') GEN[v.def.id].retune?.(v)});
    };
    key.addEventListener('change',onKey); sc.addEventListener('change',onKey);
    MUSIC_SEL={key,sc,onKey};
    sec.append(
      el('div',{className:'ctrls',style:'margin:4px 0'},el('label',{className:'ctrl'},'Key',key),el('label',{className:'ctrl'},'Scale',sc)));
  }
  const dot=el('span',{className:'mdot'}), item=el('li',{tabIndex:-1},dot,name);
  item.setAttribute('role','option'); item.dataset.id=id; item.dataset.name=name;
  item.addEventListener('click',()=>{showSection(id); closeMenu(true)});
  menuList.append(item); menuItems[id]=item; counts[id]=dot;
}
// green dot = something is playing in that section
function updateCounts(){
  const active={now:voices.some(v=>v.p.on),patterns:LINKS.size>0};
  for(const [id] of GROUPS) active[id]=voices.some(v=>v.def.group===id&&v.p.on);
  for(const [id] of SECTIONS) counts[id].classList.toggle('on',!!active[id]);
  menuBtn.querySelector('.mdot').classList.toggle('on',!!active[currentSection]);
}
/* ---------------- Your sounds: loader and report ---------------- */
const fmtTime=t=>t<60?t.toFixed(1)+' s':Math.floor(t/60)+':'+String(Math.round(t%60)).padStart(2,'0');
function drawEnvelope(cvs,an,color){
  const k=window.devicePixelRatio||1, W=Math.round(cvs.clientWidth*k), H=Math.round(cvs.clientHeight*k);
  if(!W||!H) return;
  if(cvs.width!==W||cvs.height!==H){cvs.width=W; cvs.height=H}
  const g=cvs.getContext('2d'); g.clearRect(0,0,W,H);
  if(!an) return;
  const E=an.envelope, n=E.length;
  g.fillStyle=color+'99';
  for(let x=0;x<W;x++){                                  // max of each pixel column
    const a=Math.floor(x/W*n), b=Math.max(a+1,Math.floor((x+1)/W*n)); let m=0;
    for(let i=a;i<b&&i<n;i++) m=Math.max(m,E[i]);
    const h=m*(H-6); g.fillRect(x,(H-h)/2,1,Math.max(1,h));
  }
  if(an.kind==='events'){
    g.fillStyle='#E6E1D3';
    const dur=n*an.hop;
    for(const t of an.onsetTimes) g.fillRect(Math.round(t/dur*W),0,Math.max(1,k),4*k);
  }
}
function describeRhythm(an){
  if(an.kind!=='events') return 'continuous';
  const c=an.cv, what=c<0.35?'steady':c<0.8?'loosely regular':c<1.3?'random':'in clusters';
  return `${an.rate.toFixed(an.rate<10?1:0)} per second, ${what}`;
}
function buildUserUI(v){
  const d=v.def;
  const input=el('input',{type:'file',accept:'audio/*,video/*',id:'file-'+d.id});
  const pickBtn=el('label',{className:'btn',htmlFor:'file-'+d.id,textContent:'Load audio or video…',tabIndex:0});
  pickBtn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault(); input.click()}});
  const fname=el('span',{className:'fname',textContent:'No file yet. It stays on this device and is gone after a reload.'});
  const env=el('canvas',{className:'env',hidden:true}); env.setAttribute('aria-label','Loudness over time, with detected sounds marked');
  const report=el('dl',{hidden:true});
  const redraw=()=>{if(v.user) drawEnvelope(env,v.user.an,d.color)};
  v.ui.redraw=redraw;
  input.addEventListener('change',async()=>{
    const f=input.files[0]; if(!f) return;
    fname.textContent='Analysing '+f.name+'…';
    try{
      const U=await loadUserSound(f);
      v.user=U;
      const an=U.an;
      fname.replaceChildren(el('b',{textContent:f.name}),' · '+fmtTime(an.dur)+(an.dur>=AN_MAX_SECS?' analysed':''));
      const row=(k,val)=>[el('dt',{textContent:k}),el('dd',{textContent:val})];
      const res=an.res.length?an.res.map(r=>fmtHz(r.f)).join(', '):'none clear';
      report.replaceChildren(
        ...row('Found',an.kind==='events'?`${an.count} separate sounds, ${U.rec.events.length} kept`:'a continuous texture'),
        ...row('Rhythm',describeRhythm(an)),
        ...(an.kind==='events'?row('Decay',`${Math.round(an.decay*1000)} ms to fade by 20 dB`):[]),
        ...row('Brightness',fmtHz(an.centroid)+' centre of the spectrum'),
        ...row('Resonances',res),
        ...row('Character',an.flatness>0.7?'noisy, like hiss or rustle':an.flatness>0.2?'mixed, noise with some ringing':'tonal, rings at clear pitches'));
      report.hidden=false; env.hidden=false; redraw();
      const kindSel=SELECTS.find(x=>x.v===v&&x.key==='kind');
      kindSel.s.value=an.kind; v.p.kind=an.kind;
      if(v.active){v.stop(); v.start()}
      if(!v.p.on){v.ui.sw.checked=true; v.ui.sw.dispatchEvent(new Event('change'))}
      v.ui.settings.open=true;
    }catch(e){
      fname.textContent=e.message||'Something went wrong while reading this file.';
    }
    input.value='';
  });
  return el('div',{className:'yours'},el('div',{className:'row'},input,pickBtn,fname),env,report);
}

voices.forEach(v=>{
  const d=v.def, box=document.createElement('article'); box.className='src'; box.dataset.on=v.p.on;
  box.innerHTML=`<div class="src-head"><span class="dot" style="background:${d.color}"></span><h2 title="${d.desc}">${d.name}</h2></div>`;
  const sw=Object.assign(document.createElement('input'),{type:'checkbox',className:'switch',checked:v.p.on});
  sw.setAttribute('aria-label',`${d.name} on or off`);
  sw.addEventListener('change',()=>{
    v.p.on=sw.checked; box.dataset.on=sw.checked; updateCounts(); renderNow?.();
    if(ready){sw.checked?v.start():v.stop()}
    requestDraw();
  });
  box.querySelector('.src-head').append(sw);
  const c=document.createElement('div'); c.className='ctrls';
  c.append(
    rangeCtrl(v,'vol','Volume',0,1,0.01,x=>Math.round(x*100)+'%'),
    selectCtrl(v,'mode','Movement',MODES),
    rangeCtrl(v,'angle','Direction',-180,180,1,x=>x===0?'in front':Math.abs(x)===180?'behind':(x>0?'right ':'left ')+Math.abs(x)+'°'),
    rangeCtrl(v,'dist','Distance',0.12,2.5,0.01,x=>x<0.3?Math.round(x*100)+' cm, very close':x<1?Math.round(x*100)+' cm':x.toFixed(1)+' m'),
    rangeCtrl(v,'speed','Movement speed',0,120,1,x=>x+'°/s'),
    rangeCtrl(v,'rev','Reverb',0,1,0.01,x=>x<0.01?'dry':Math.round(x*100)+'%')
  );
  d.extra.forEach(e=>c.append(e[0]==='range'?rangeCtrl(v,...e.slice(1)):selectCtrl(v,e[1],e[2],e[3])));
  // filter section, collapsed by default
  const det=document.createElement('details'); det.className='filter';
  const sum=document.createElement('summary');
  const plot=document.createElement('canvas'); plot.className='bode';
  plot.setAttribute('aria-label',`${d.name} filter frequency response`);
  const fc=document.createElement('div'); fc.className='ctrls';
  v.ui={det,sum,plot,sw,box};
  fc.append(
    rangeCtrl(v,'hp','High-pass',0,1,0.005,x=>x<=0.001?'off':fmtHz(hpHz(x))),
    rangeCtrl(v,'lp','Low-pass',0,1,0.005,x=>x>=0.999?'off':fmtHz(lpHz(x))),
    selectCtrl(v,'slope','Slope',[['12','12 dB/oct, 2-pole'],['24','24 dB/oct, 4-pole']]),
    rangeCtrl(v,'res','Resonance',0,1,0.01,x=>x<0.01?'none':'peak ≈ +'+dB(1+x*11).toFixed(0)+' dB')
  );
  det.append(sum,plot,fc);
  det.addEventListener('toggle',()=>refreshFilterUI(v));
  refreshFilterUI(v);
  const settings=el('details',{className:'settings',open:v.p.on},el('summary',{textContent:'Settings'}),c,det);
  settings.addEventListener('toggle',()=>refreshFilterUI(v));
  v.ui.settings=settings;
  if(d.custom) box.append(buildUserUI(v));
  box.append(settings); sectionOf[d.group].append(box);
});
