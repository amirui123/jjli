/* Hush: Core: audio context, noise, helpers, per-source filter, room reverb. Loaded as a classic script; see index.html for the order. */

/* ============================================================
   Hush: procedural ASMR engine (Web Audio API)
   - every sound is synthesized: noise + filters + stochastic timing
   - each source goes through its own HRTF PannerNode
   - a Worker clock schedules events 250 ms ahead (survives background tabs)
   - short, frequent events (drops, taps, crackles) are pre-rendered once into
     banks of random variants, so playing one costs a buffer source + a gain
   ============================================================ */
let ctx=null, master=null, WHITE=null, BROWN=null, clock=null, ready=false, playing=false;
let FADE=null, RECDEST=null, chaosEvery=0, chaosNext=0, chaosBusy=false;
const BANKS={}, BAKING={};   // pre-rendered sounds per generator, baked the first time a sound is used
const PARAMS=[];          // every slider of every sound, so patterns can drive them
const SELECTS=[];         // every dropdown of every sound
let onPlaceByHand=null;
let renderNow=null;
const PATTERN_API={};      // filled by the pattern panel: link, unlinkWhere, importPattern       // set by the pattern panel: redraws the Now playing section
const LINKS=new Map();    // "soundId.key" -> active pattern link
const el=(tag,props={},...kids)=>{const e=Object.assign(document.createElement(tag),props); e.append(...kids); return e};   // tiny DOM builder
const rand=Math.random, rint=n=>Math.floor(rand()*n), pick=a=>a[rint(a.length)];
const expRand=rate=>-Math.log(1-rand())/rate;          // Poisson inter-arrival time
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const bq=(type,frequency,Q=1)=>new BiquadFilterNode(ctx,{type,frequency,Q});
const gn=gain=>new GainNode(ctx,{gain});

function makeNoise(secs,brown,c=ctx){
  const n=Math.floor(c.sampleRate*secs), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
  let last=0;
  for(let i=0;i<n;i++){const w=rand()*2-1; if(brown){last=(last+0.02*w)/1.02; d[i]=last*3.5}else d[i]=w}
  return b;
}
const NOISE={};
const toneHz=x=>500*Math.pow(32,x);

/* ---------------- per-source filter (high-pass + low-pass) ----------------
   Four biquads in series: HP, HP, LP, LP. A single biquad is a 2-pole filter
   (12 dB/octave, like two RC stages); two in series give 24 dB/octave.
   Unused stages are made transparent: a high-pass at 0 Hz and a low-pass at
   Nyquist both reduce to an identity filter.
   Note: for lowpass/highpass BiquadFilterNodes, Q is specified in dB. */
const FILTER_KEYS=new Set(['hp','lp','slope','res']);
const hpHz=x=>20*Math.pow(400,x);          // 20 Hz .. 8 kHz, log scale
const lpHz=x=>200*Math.pow(100,x);         // 200 Hz .. 20 kHz, log scale
const fmtHz=f=>f<1000?Math.round(f)+' Hz':(f/1000).toFixed(f<10000?1:0)+' kHz';
const dB=q=>20*Math.log10(q);
function filterSettings(p,nyq){
  const hpOn=p.hp>0.001, lpOn=p.lp<0.999, four=p.slope==='24';
  const peak=p.res*11;                                   // resonance adds to the last stage's Q
  // Butterworth Q values: 0.7071 for 2 poles; 0.5412 and 1.3066 for 4 poles
  const qs=four?[0.5412,1.3066+peak]:[0.7071+peak,0.7071];
  const flat=[0.7071,0.7071];
  const hq=hpOn?qs:flat, lq=lpOn?qs:flat;
  const fh=hpOn?Math.min(hpHz(p.hp),nyq):0, fl=lpOn?Math.min(lpHz(p.lp),nyq):nyq;
  return [
    {f:fh, q:dB(hq[0])},
    {f:hpOn&&four?fh:0, q:dB(hq[1])},
    {f:fl, q:dB(lq[0])},
    {f:lpOn&&four?fl:nyq, q:dB(lq[1])}
  ];
}
function applyFilter(v,instant){
  const S=filterSettings(v.p,ctx.sampleRate/2), now=ctx.currentTime;
  v.flt.forEach((f,i)=>{
    if(instant){f.frequency.value=S[i].f; f.Q.value=S[i].q}
    else{f.frequency.setTargetAtTime(S[i].f,now,0.03); f.Q.setTargetAtTime(S[i].q,now,0.03)}
  });
}
function filterSummary(p){
  const parts=[];
  if(p.hp>0.001) parts.push('high-pass '+fmtHz(hpHz(p.hp)));
  if(p.lp<0.999) parts.push('low-pass '+fmtHz(lpHz(p.lp)));
  if(!parts.length) return 'off';
  return parts.join(', ')+', '+p.slope+' dB/oct'+(p.res>0.01?', resonant':'');
}
// 8 s stereo loop (independent channels), seamless crossfaded loop point, RMS-normalised
function colorNoise(color){
  if(NOISE[color]) return NOISE[color];
  const sr=ctx.sampleRate, n=sr*8, fade=Math.floor(sr*0.5), buf=ctx.createBuffer(2,n,sr);
  for(let ch=0;ch<2;ch++){
    const x=new Float32Array(n+fade);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,br=0,pw=0,pp=0;
    for(let i=0;i<n+fade;i++){
      const w=rand()*2-1;
      // Paul Kellet's pink filter (-3 dB/oct)
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759; b2=0.96900*b2+w*0.1538520;
      b3=0.86650*b3+w*0.3104856; b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
      const pink=b0+b1+b2+b3+b4+b5+b6+w*0.5362; b6=w*0.115926;
      br=(br+0.02*w)/1.02;                                  // brown: leaky random walk (-6 dB/oct)
      x[i]= color==='white'?w : color==='brown'?br
          : color==='blue'?pink-pp                          // differentiated pink: +3 dB/oct
          : color==='violet'?w-pw                           // differentiated white: +6 dB/oct
          : pink;                                           // pink, and grey (EQ'd later)
      pw=w; pp=pink;
    }
    let m=0; for(const y of x) m+=y; m/=x.length;
    const d=buf.getChannelData(ch);
    for(let i=0;i<n;i++) d[i]=x[i]-m;
    for(let i=0;i<fade;i++){const a=i/fade; d[i]=(x[i]-m)*Math.sqrt(a)+(x[n+i]-m)*Math.sqrt(1-a)}
    let e=0; for(let i=0;i<n;i++) e+=d[i]*d[i];
    const k=0.18/Math.sqrt(e/n); for(let i=0;i<n;i++) d[i]*=k;
  }
  return NOISE[color]=buf;
}
function loop(v,buf){
  const s=new AudioBufferSourceNode(ctx,{buffer:buf,loop:true});
  s.start(0,rand()*buf.duration); v.loops.push(s); return s;
}
// short enveloped noise event -> dest; extra nodes are disconnected when it ends
function burst(t,dur,peak,dest,{attack=0.001,tail=0.02,cleanup=[],c=ctx,noise=WHITE}={}){
  const s=new AudioBufferSourceNode(c,{buffer:noise}), g=new GainNode(c,{gain:0});
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(peak,t+attack);
  g.gain.exponentialRampToValueAtTime(1e-4,t+Math.max(dur,attack+0.002));
  s.connect(g).connect(dest);
  s.start(t,rand()*(noise.duration-2)); s.stop(t+dur+tail);
  s.onended=()=>{s.disconnect();g.disconnect();cleanup.forEach(n=>n.disconnect())};
}
// Render n variants of a short sound offline, in one pass, and slice them into buffers.
// build(oc, noise, t, out) schedules one variant starting at time t.
async function bakeBank(n,slot,build){
  const sr=ctx.sampleRate, L=Math.round(slot*sr);
  const oc=new OfflineAudioContext(1,n*L,sr), noise=makeNoise(4,false,oc);
  for(let k=0;k<n;k++) build(oc,noise,k*slot,oc.destination);
  const data=(await oc.startRendering()).getChannelData(0);
  return Array.from({length:n},(_,k)=>{const b=ctx.createBuffer(1,L,sr); b.copyToChannel(data.subarray(k*L,(k+1)*L),0); return b});
}
// Offline tone: oscillator with optional glide (exponential), vibrato, 2nd harmonic and hold.
function tone(c,t,dur,dest,{f0,f1=f0,peak=1,attack=0.002,type='sine',vib=0,vibHz=6,harm=0,hold=0}){
  const g=new GainNode(c,{gain:0});
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(peak,t+attack);
  if(hold>0) g.gain.setValueAtTime(peak,t+Math.max(attack,dur*hold));
  g.gain.exponentialRampToValueAtTime(1e-4,t+dur);
  const voice=(mult,amp)=>{
    const o=new OscillatorNode(c,{type,frequency:f0*mult});
    o.frequency.setValueAtTime(f0*mult,t);
    if(f1!==f0) o.frequency.exponentialRampToValueAtTime(f1*mult,t+dur);
    if(vib){const l=new OscillatorNode(c,{frequency:vibHz}); l.connect(new GainNode(c,{gain:vib*f0*mult})).connect(o.frequency); l.start(t); l.stop(t+dur+0.02)}
    o.connect(new GainNode(c,{gain:amp})).connect(g); o.start(t); o.stop(t+dur+0.02);
  };
  voice(1,1); if(harm) voice(2,harm);
  g.connect(dest);
}
/* ---------------- room reverb ----------------
   One shared convolution reverb. Its impulse response is synthesised: stereo noise
   split at 1.8 kHz, with the lows decaying over the room's RT60 and the highs twice
   as fast (air and walls absorb highs), a short build-up, a pre-delay, and a few
   discrete early reflections. Each sound sends into it with its own "Reverb" amount. */
const ROOMS={
  none:{label:'None'},
  room:{label:'Small room',rt:0.5,pre:0.003,bright:0.55,gain:0.9,er:[[0.005,0.55],[0.009,0.42],[0.014,0.33],[0.019,0.25],[0.026,0.18]]},
  bath:{label:'Bathroom',rt:1.4,pre:0.002,bright:1,gain:0.75,er:[[0.003,0.6],[0.006,0.5],[0.010,0.42],[0.015,0.3]]},
  hall:{label:'Concert hall',rt:2.8,pre:0.022,bright:0.45,gain:0.7,er:[[0.018,0.35],[0.026,0.3],[0.037,0.25],[0.052,0.18]]},
  outdoors:{label:'Outdoors',rt:0.9,pre:0.01,bright:0.3,gain:0.55,diffuse:0.35,er:[[0.011,0.45],[0.048,0.16],[0.11,0.09]]}
};
let ROOM='room', REV=null;
const IRS={};
function makeIR(R,sr){
  const L=Math.round((R.pre+R.rt*1.1+0.05)*sr), buf=new AudioBuffer({length:L,numberOfChannels:2,sampleRate:sr});
  const a=1-Math.exp(-2*Math.PI*1800/sr), pre=Math.round(R.pre*sr), dif=R.diffuse??1;
  for(let ch=0;ch<2;ch++){
    const d=buf.getChannelData(ch); let lo=0, e=0;
    for(let i=0;i<L;i++){
      const w=rand()*2-1; lo+=a*(w-lo);
      const t=(i-pre)/sr; if(t<0) continue;
      d[i]=Math.min(1,t/0.008)*(lo*Math.exp(-6.91*t/R.rt)+R.bright*(w-lo)*Math.exp(-6.91*t/(0.5*R.rt)));
      e+=d[i]*d[i];
    }
    const k=dif/Math.sqrt(e||1); for(let i=0;i<L;i++) d[i]*=k;      // diffuse part normalised to unit energy
    for(const [t,amp] of R.er){                                      // early reflections, slightly different per ear
      const i=Math.round((R.pre+t+(ch?1:-1)*0.0007*rand())*sr);
      if(i<L) d[i]+=0.6*amp*(rand()<0.5?-1:1);
    }
  }
  return buf;
}
function setRoom(id){
  ROOM=id;
  if(!ctx||!REV) return;
  const now=ctx.currentTime;
  if(REV.cur){const old=REV.cur; old.g.gain.setTargetAtTime(0,now,0.08); setTimeout(()=>{old.conv.disconnect(); old.g.disconnect()},800)}
  REV.cur=null;
  if(id==='none') return;
  const R=ROOMS[id];
  const conv=new ConvolverNode(ctx,{disableNormalization:true,buffer:IRS[id]??=makeIR(R,ctx.sampleRate)}), g=gn(0);
  REV.in.connect(conv).connect(g).connect(master);
  g.gain.setTargetAtTime(R.gain,now,0.08);
  REV.cur={conv,g};
}

async function ensureBank(id){
  if(!BAKE[id]||BANKS[id]) return;
  BAKING[id]??=BAKE[id]().then(b=>BANKS[id]=b);
  await BAKING[id];
}
// play a pre-rendered variant into a voice (rate > 1 = higher and shorter)
function oneShot(v,buf,t,gain,rate=1){
  const s=new AudioBufferSourceNode(ctx,{buffer:buf,playbackRate:rate}), g=gn(gain);
  s.connect(g).connect(v.inp); s.start(t);
  s.onended=()=>{s.disconnect();g.disconnect()};
}
