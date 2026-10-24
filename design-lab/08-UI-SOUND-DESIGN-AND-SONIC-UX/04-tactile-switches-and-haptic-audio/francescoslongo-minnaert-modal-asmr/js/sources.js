/* Hush: Sound definitions, voices, scheduler, audio start-up. Loaded as a classic script; see index.html for the order. */

/* ---------------- sources: definition, spatial path, lifecycle ---------------- */
const GROUPS=[['ambience','Ambience'],['touch','Touch and objects'],['animals','Animals'],['music','Instruments'],['voice','Mouth and voice'],['yours','Your sounds']];
const DEFS=[
  {id:'noise',group:'ambience',name:'Noise colours',color:'#C9C2B0',desc:'A steady background layer. "All around" fills the whole space; "One spot" places it like the other sounds.',
    p:{on:true,vol:0.4,mode:'static',angle:0,dist:1.5,speed:5,color:'pink',spread:'wide',tone:1,swell:0},
    extra:[
      ['select','color','Colour',[['white','White, bright hiss'],['pink','Pink, balanced'],['brown','Brown, deep rumble'],['grey','Grey, evenly loud'],['blue','Blue, airy'],['violet','Violet, sharp']]],
      ['select','spread','Space',[['wide','All around'],['placed','One spot']]],
      ['range','tone','Tone',0,1,0.01,x=>x>0.99?'open':Math.round(toneHz(x))+' Hz'],
      ['range','swell','Waves',0,1,0.01,x=>x<0.01?'steady':Math.round(x*100)+'%']
    ]},
  {id:'rain',group:'ambience',name:'Rain',color:'#7FB2C9',desc:'Drops on a window, placed a little further away.',
    p:{on:false,vol:0.5,mode:'static',angle:0,dist:1.6,speed:5,density:70},
    extra:[['range','density','Drops per second',10,250,1,x=>Math.round(x)]]},
  {id:'fire',group:'ambience',name:'Fire',color:'#D9967A',desc:'Low rumble with irregular crackles.',
    p:{on:false,vol:0.5,mode:'static',angle:150,dist:1.2,speed:5,intensity:8},
    extra:[['range','intensity','Crackles per second',1,40,0.5,x=>x.toFixed(1)]]}

,
  {id:'drops',group:'ambience',name:'Water drops',color:'#9AD0E0',desc:'Single drops falling into water, each one ringing with a small bubble.',
    p:{on:false,vol:0.65,mode:'static',angle:-30,dist:0.9,speed:5,rate:1.2,size:1},
    extra:[['range','rate','Drops per second',0.2,6,0.1,x=>x.toFixed(1)],['range','size','Drop size',0.6,1.8,0.01,x=>x<0.85?'small':x>1.2?'large':'medium']]},
  {id:'tap',group:'touch',name:'Tapping',color:'#E3C58A',desc:'Fingertip taps ringing on a surface.',
    p:{on:false,vol:0.6,mode:'sweep',angle:0,dist:0.3,speed:30,rate:1,material:'wood'},
    extra:[['range','rate','Rhythm',0.3,3,0.05,x=>x.toFixed(2)+'×'],['select','material','Surface',['wood','plastic','glass']]]},
  {id:'brush',group:'touch',name:'Brushing',color:'#8FB39A',desc:'Slow brush strokes, as if on a microphone.',
    p:{on:false,vol:0.6,mode:'static',angle:-90,dist:0.2,speed:20,rate:1},
    extra:[['range','rate','Stroke speed',0.4,2.5,0.05,x=>x.toFixed(2)+'×']]},
  {id:'squish',group:'touch',name:'Squishy',color:'#D7A6C8',desc:'Slime and gel being squeezed, with little pops and sticky clicks.',
    p:{on:false,vol:0.6,mode:'static',angle:40,dist:0.25,speed:10,rate:1,sticky:0.5,size:0.5},
    extra:[['range','rate','Squeeze speed',0.4,2.5,0.05,x=>x.toFixed(2)+'×'],['range','sticky','Stickiness',0,1,0.01,x=>Math.round(x*100)+'%'],['range','size','Bubble size',0,1,0.01,x=>x<0.35?'small':x>0.65?'large':'medium']]},
  {id:'crack',group:'touch',name:'Crinkles and cracks',color:'#B8C7D9',desc:'A crinkly wrapper, ice cracking with a laser-like ring, or twigs snapping.',
    p:{on:false,vol:0.55,mode:'static',angle:-50,dist:0.3,speed:10,rate:0.6,material:'plastic'},
    extra:[['select','material','Material',[['plastic','Crinkly wrapper'],['ice','Cracking ice'],['snap','Snapping twigs']]],['range','rate','How often',0.1,3,0.05,x=>x.toFixed(2)+' per s']]},
  {id:'birds',group:'animals',name:'Birds',color:'#A8D08D',desc:'A songbird repeating its little tune, somewhere in the trees.',
    p:{on:false,vol:0.35,mode:'wander',angle:30,dist:2,speed:8,rate:1},
    extra:[['range','rate','Singing',0.3,3,0.05,x=>x<0.7?'occasional':x>1.6?'busy':'normal']]},
  {id:'crickets',group:'animals',name:'Crickets',color:'#C8D66B',desc:'Chirping crickets. Warmer nights make them chirp faster (Dolbear\'s law).',
    p:{on:false,vol:0.3,mode:'static',angle:120,dist:2.2,speed:5,temp:22,count:2},
    extra:[['range','temp','Temperature',10,32,0.5,x=>{const f=x*9/5+32; return x.toFixed(1)+' °C, '+Math.round(Math.max(20,4*(f-50)+40))+'/min'}],['range','count','Crickets',1,4,1,x=>x]]},
  {id:'purr',group:'animals',name:'Cat purring',color:'#F0A6A0',desc:'A cat purring close by, breathing in and out.',
    p:{on:false,vol:0.6,mode:'static',angle:-70,dist:0.3,speed:5,hz:25,breath:1},
    extra:[['range','hz','Purr rate',20,32,0.5,x=>x.toFixed(1)+' Hz'],['range','breath','Breathing speed',0.6,1.6,0.05,x=>x.toFixed(2)+'×']]},
  {id:'frogs',group:'animals',name:'Frogs',color:'#6FBF8E',desc:'Frogs croaking and answering each other by a pond.',
    p:{on:false,vol:0.4,mode:'static',angle:-140,dist:2,speed:5,rate:0.8},
    extra:[['range','rate','Croaks per second',0.2,3,0.05,x=>x.toFixed(2)]]},
  {id:'bowl',group:'music',name:'Singing bowl',color:'#D4B483',desc:'A metal bowl, struck with a mallet or sung by rubbing its rim, with the slow beating of its paired tones.',
    p:{on:false,vol:0.5,mode:'static',angle:0,dist:0.6,speed:5,style:'strike',size:'medium',rate:4,ring:1},
    extra:[['select','style','Playing',[['strike','Struck'],['sing','Sung (rubbed rim)']]],['select','size','Size',[['large','Large'],['medium','Medium'],['small','Small']]],
      ['range','rate','Strikes per minute',1,12,0.5,x=>x.toFixed(1)],['range','ring','Ring time',0.5,2,0.05,x=>x.toFixed(2)+'×']]},
  {id:'kalimba',group:'music',name:'Kalimba',color:'#E6A57E',desc:'A thumb piano wandering through gentle melodies.',
    p:{on:false,vol:0.5,mode:'static',angle:25,dist:0.5,speed:5,tempo:72,harmony:0.25},
    extra:[['range','tempo','Tempo',50,110,1,x=>x+' BPM'],['range','harmony','Two-note chords',0,1,0.01,x=>Math.round(x*100)+'%']]},
  {id:'harp',group:'music',name:'Harp',color:'#9FB7E8',desc:'Soft rolling chords on plucked strings.',
    p:{on:false,vol:0.45,mode:'static',angle:-35,dist:0.9,speed:5,pace:1,dir:'both'},
    extra:[['select','dir','Rolls',[['up','Upwards'],['down','Downwards'],['both','Up and down']]],['range','pace','Pace',0.5,2,0.05,x=>x.toFixed(2)+'×']]},
  {id:'chimes',group:'music',name:'Wind chimes',color:'#C5E0DC',desc:'Metal tubes tuned to the key, moved by a gusty breeze.',
    p:{on:false,vol:0.4,mode:'static',angle:70,dist:1.4,speed:5,wind:0.4,ring:1,tubes:'high'},
    extra:[['range','wind','Wind',0.1,1,0.01,x=>x<0.3?'light breeze':x>0.7?'windy':'breezy'],['select','tubes','Tubes',[['high','Small (higher)'],['low','Large (lower)']]],
      ['range','ring','Ring time',0.5,2,0.05,x=>x.toFixed(2)+'×']]},
  {id:'pad',group:'music',name:'Warm pad',color:'#8C9BD9',desc:'A slowly changing, soft synthesizer chord that fills the background.',
    p:{on:false,vol:0.35,mode:'static',angle:0,dist:1.5,speed:5,spread:'wide',bright:0.35,change:3},
    extra:[['select','spread','Space',[['wide','All around'],['placed','One spot']]],['range','bright','Brightness',0,1,0.01,x=>Math.round(250*Math.pow(12,x))+' Hz'],
      ['range','change','Chord changes per minute',1,8,0.5,x=>x.toFixed(1)]]},
  {id:'mouth',group:'voice',name:'Mouth sounds',color:'#E88FA6',desc:'Tongue clicks, lip smacks and soft wet sounds, very close to the ear.',
    p:{on:false,vol:0.55,mode:'sweep',angle:0,dist:0.18,speed:12,rate:1,wet:0.4,style:'mixed'},
    extra:[['select','style','Style',[['mixed','Mixed'],['clicks','Mostly clicks'],['smacks','Mostly smacks']]],['range','rate','Pace',0.3,2.5,0.05,x=>x.toFixed(2)+'×'],['range','wet','Wetness',0,1,0.01,x=>Math.round(x*100)+'%']]},
  {id:'whisper',group:'voice',name:'Whispering',color:'#B9A3E3',desc:'Soft, wordless whispers built from filtered breath noise.',
    p:{on:false,vol:0.55,mode:'wander',angle:60,dist:0.35,speed:15,pace:1,tract:1.08},
    extra:[['range','pace','Pace',0.6,1.6,0.05,x=>x.toFixed(2)+'×'],['range','tract','Voice size',0.85,1.2,0.01,x=>x<0.97?'larger':x>1.03?'smaller':'neutral']]},
  {id:'user1',gen:'user',group:'yours',custom:true,name:'Your sound 1',color:'#F2C57C',desc:'A sound analysed from your own audio or video file.',
    p:{on:false,vol:0.6,mode:'static',angle:-45,dist:0.5,speed:5,source:'rec',kind:'events',timing:'orig',tempo:1,pitch:0,vary:0.3},
    extra:[['select','source','Play',[['rec','The recording'],['syn','Synthesised copy']]],['select','kind','Treat as',[['events','Separate sounds'],['texture','Continuous texture']]],
      ['select','timing','Timing',[['orig','Like the original'],['steady','Steady'],['random','Random']]],['range','tempo','Tempo',0.25,4,0.01,x=>x.toFixed(2)+'×'],
      ['range','pitch','Pitch',-12,12,0.5,x=>(x>0?'+':'')+x+' semitones'],['range','vary','Variation',0,1,0.01,x=>Math.round(x*100)+'%']]},
  {id:'user2',gen:'user',group:'yours',custom:true,name:'Your sound 2',color:'#9ED9C4',desc:'A sound analysed from your own audio or video file.',
    p:{on:false,vol:0.6,mode:'static',angle:45,dist:0.5,speed:5,source:'rec',kind:'events',timing:'orig',tempo:1,pitch:0,vary:0.3},
    extra:[['select','source','Play',[['rec','The recording'],['syn','Synthesised copy']]],['select','kind','Treat as',[['events','Separate sounds'],['texture','Continuous texture']]],
      ['select','timing','Timing',[['orig','Like the original'],['steady','Steady'],['random','Random']]],['range','tempo','Tempo',0.25,4,0.01,x=>x.toFixed(2)+'×'],
      ['range','pitch','Pitch',-12,12,0.5,x=>(x>0?'+':'')+x+' semitones'],['range','vary','Variation',0,1,0.01,x=>Math.round(x*100)+'%']]},
  {id:'user3',gen:'user',group:'yours',custom:true,name:'Your sound 3',color:'#C9A0E8',desc:'A sound analysed from your own audio or video file.',
    p:{on:false,vol:0.6,mode:'static',angle:180,dist:0.5,speed:5,source:'rec',kind:'events',timing:'orig',tempo:1,pitch:0,vary:0.3},
    extra:[['select','source','Play',[['rec','The recording'],['syn','Synthesised copy']]],['select','kind','Treat as',[['events','Separate sounds'],['texture','Continuous texture']]],
      ['select','timing','Timing',[['orig','Like the original'],['steady','Steady'],['random','Random']]],['range','tempo','Tempo',0.25,4,0.01,x=>x.toFixed(2)+'×'],
      ['range','pitch','Pitch',-12,12,0.5,x=>(x>0?'+':'')+x+' semitones'],['range','vary','Variation',0,1,0.01,x=>Math.round(x*100)+'%']]}
];

class Voice{
  constructor(def){
    const rev={ambience:0.1,touch:0.15,animals:0.25,music:0.35,voice:0.1,yours:0.15}[def.group]??0.15;
    this.def=def; this.p={hp:0,lp:1,slope:'12',res:0,rev,...def.p}; this.phase=rand()*6.283; this.active=false;
    this.u0=0; this.t0=0; this.w=this.p.speed*Math.PI/180;       // motion phase u(t) = u0 + w·(t - t0)
  }
  motion(t){return this.u0+this.w*(t-this.t0)}
  // Speed changed: re-anchor the phase where the already-scheduled path ends, so the sound doesn't jump
  retime(){
    const tc=this.active?Math.max(this.posT,ctx.currentTime):(ctx?ctx.currentTime:0);
    this.u0=this.motion(tc); this.t0=tc; this.w=this.p.speed*Math.PI/180;
  }
  val(key,t){const L=LINKS.get(this.def.id+'.'+key); return L?linkValue(L,t):this.p[key]}
  drivenPos(){return LINKS.has(this.def.id+'.angle')||LINKS.has(this.def.id+'.dist')}
  // position at time t (metres); listener at origin facing -z; angle 0 = front, +90 = right ear
  pos(t){
    const p=this.p, u=this.motion(t); let th=this.val('angle',t)*Math.PI/180, d=this.val('dist',t);
    if(p.mode==='orbit') th+=u;
    else if(p.mode==='sweep') th=(Math.PI/2)*Math.sin(0.5*u+this.phase);            // ear to ear through the front
    else if(p.mode==='wander'){th+=Math.sin(0.37*u+this.phase)+0.6*Math.sin(0.91*u); d*=1+0.35*Math.sin(0.53*u+2*this.phase)}
    d=Math.max(0.12,d);
    return {x:d*Math.sin(th),z:-d*Math.cos(th),d};
  }
  async start(){
    const token=this.token=(this.token||0)+1;
    await ensureBank(this.def.id);                   // bake this sound's variants the first time
    if(token!==this.token||!this.p.on||this.active) return;
    const now=ctx.currentTime; this.loops=[]; this.nodes=[];
    this.inp=gn(0);
    this.shelf=bq('lowshelf',220);                      // proximity effect: bass lift when very close
    this.panner=new PannerNode(ctx,{panningModel:'HRTF',distanceModel:'inverse',refDistance:0.25,maxDistance:20,rolloffFactor:1});
    this.flt=['highpass','highpass','lowpass','lowpass'].map(type=>new BiquadFilterNode(ctx,{type}));
    applyFilter(this,true);
    const out=this.flt.reduce((a,f)=>a.connect(f),this.inp);
    this.send=gn(this.p.rev);                           // amount sent to the room reverb
    if(this.p.spread==='wide'){out.connect(master); out.connect(this.send)}
    else{out.connect(this.shelf).connect(this.panner).connect(master); this.panner.connect(this.send)}
    this.send.connect(REV.in);
    this.nodes.push(this.inp,...this.flt,this.shelf,this.panner,this.send);
    this.inp.gain.setTargetAtTime(this.p.vol,now,0.1);
    const q=this.pos(now);
    this.panner.positionX.setValueAtTime(q.x,now); this.panner.positionY.setValueAtTime(0,now); this.panner.positionZ.setValueAtTime(q.z,now);
    this.posT=now; this.posDirty=false; this.next=now+0.1;
    GEN[this.def.id].build(this); this.active=true;
  }
  stop(){
    this.token=(this.token||0)+1;
    if(!this.active) return; this.active=false;
    const loops=this.loops, nodes=this.nodes;
    this.inp.gain.setTargetAtTime(0,ctx.currentTime,0.04);
    setTimeout(()=>{loops.forEach(s=>{try{s.stop()}catch(e){}}); nodes.forEach(n=>n.disconnect())},400);
  }
  rampTo(t){
    const q=this.pos(t);
    this.panner.positionX.linearRampToValueAtTime(q.x,t);
    this.panner.positionZ.linearRampToValueAtTime(q.z,t);
    this.shelf.gain.linearRampToValueAtTime(clamp(10*(0.6-q.d)/0.45,0,10),t);
  }
  // hold the current values from time t, so a new ramp starts from where the sound is now
  anchorPos(t){[this.panner.positionX,this.panner.positionZ,this.shelf.gain].forEach(a=>a.setValueAtTime(a.value,t))}
  schedulePos(t1){
    const now=ctx.currentTime;
    if(this.p.spread==='wide'){this.posT=t1; return}            // panner not in use
    const stat=this.p.mode==='static'&&!this.drivenPos();
    if(stat&&!this.posDirty) return;                            // still: only move when something changed
    let t=this.posT;
    if(t<now){t=now; this.anchorPos(now)}
    if(stat){this.rampTo(t+0.03); this.posT=t+0.03; this.posDirty=false; return}   // ~30 ms response
    while(t<t1){t+=0.04; this.rampTo(t)}
    this.posT=t;
  }
}
for(const d of DEFS) if(d.gen) GEN[d.id]=GEN[d.gen];   // several sounds can share one generator
const voices=DEFS.map(d=>new Voice(d));

function tick(){
  if(!ctx||ctx.state!=='running') return;
  // hidden pages (screen off, other app) may get fewer timer ticks: schedule further ahead
  const now=ctx.currentTime, t1=now+(document.hidden?2:0.25);
  if(sleepEnd&&now>=sleepEnd) sleepFinished();
  if(chaosEvery&&now>=chaosNext) chaosStep();
  applyLinks(now);
  for(const v of voices){
    if(!v.active) continue;
    if(v.next<now-0.3) v.next=now+0.02;
    if(v.posT<now-0.3) v.posT=now;
    GEN[v.def.id].schedule(v,t1);
    v.schedulePos(t1);
  }
}

// 25 ms clock in a Worker (less throttled than page timers); run(false) stops it while paused
function makeClock(){
  try{
    const src='let id=0;onmessage=e=>{clearInterval(id);id=e.data?setInterval(()=>postMessage(0),25):0}';
    const w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
    w.onmessage=tick;
    return {run:on=>w.postMessage(on?1:0)};
  }catch(e){
    let id=0;
    return {run:on=>{clearInterval(id); id=on?setInterval(tick,25):0}};
  }
}
async function initAudio(){
  ctx=new AudioContext({latencyHint:'playback'});      // created inside the click, before any await
  const comp=new DynamicsCompressorNode(ctx,{threshold:-18,ratio:4,attack:0.005,release:0.2});
  master=gn(+document.getElementById('master').value);
  FADE=gn(1);                                          // sleep-timer fade, after everything else
  master.connect(FADE).connect(comp).connect(ctx.destination);
  RECDEST=ctx.createMediaStreamDestination(); comp.connect(RECDEST);
  REV={in:gn(1),cur:null}; setRoom(ROOM);
  WHITE=makeNoise(4,false); BROWN=makeNoise(4,true);
  ready=true;
  await Promise.all(voices.filter(v=>v.p.on).map(v=>v.start()));
  clock=makeClock();
}
