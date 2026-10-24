/* Hush: Your sounds: audio analysis and synthesised copies. Loaded as a classic script; see index.html for the order. */

/* ---------------- Your sounds: analysis ----------------
   Everything here works on plain Float32Arrays, so it runs the same in the
   browser and in tests. Nothing leaves the device. */
const AN_MAX_SECS=180;                     // analyse at most the first 3 minutes

// in-place radix-2 complex FFT (re, im have length 2^k)
function fft(re,im){
  const n=re.length;
  for(let i=1,j=0;i<n;i++){
    let b=n>>1; for(;j&b;b>>=1) j^=b; j^=b;
    if(i<j){[re[i],re[j]]=[re[j],re[i]]; [im[i],im[j]]=[im[j],im[i]]}
  }
  for(let len=2;len<=n;len<<=1){
    const a=-2*Math.PI/len, wr=Math.cos(a), wi=Math.sin(a);
    for(let i=0;i<n;i+=len){
      let cr=1, ci=0;
      for(let k=0;k<len/2;k++){
        const p=i+k, q=p+len/2, tr=re[q]*cr-im[q]*ci, ti=re[q]*ci+im[q]*cr;
        re[q]=re[p]-tr; im[q]=im[p]-ti; re[p]+=tr; im[p]+=ti;
        const nr=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=nr;
      }
    }
  }
}
const quantile=(a,q)=>{if(!a.length) return 0; const s=[...a].sort((x,y)=>x-y); return s[Math.min(s.length-1,Math.floor(q*s.length))]};
const median=a=>quantile(a,0.5);

// Power spectrum of a segment (Hann window, zero-padded to N)
function powerSpectrum(x,start,N){
  const re=new Float64Array(N), im=new Float64Array(N), L=Math.min(N,x.length-start);
  for(let i=0;i<L;i++) re[i]=x[start+i]*(0.5-0.5*Math.cos(2*Math.PI*i/Math.max(1,L-1)));
  fft(re,im);
  const P=new Float64Array(N/2);
  for(let k=0;k<N/2;k++) P[k]=re[k]*re[k]+im[k]*im[k];
  return P;
}

// Spectral summary: centroid, flatness, and up to 3 resonances with their bandwidth
function describeSpectrum(P,sr,M=1){
  const N=P.length*2, hz=k=>k*sr/N, kLo=Math.ceil(80*N/sr), kHi=Math.min(P.length-1,Math.floor(16000*N/sr));
  let s=0, sw=0, lg=0, cnt=0;
  for(let k=kLo;k<=kHi;k++){s+=P[k]; sw+=P[k]*hz(k); lg+=Math.log(P[k]+1e-30); cnt++}
  const centroid=s>0?sw/s:1000;
  // smooth over about 1/12 octave, in dB
  const D=new Float64Array(P.length);
  for(let k=kLo;k<=kHi;k++){
    const w=Math.max(1,Math.round(k*0.03)); let a=0,c=0;
    for(let j=Math.max(kLo,k-w);j<=Math.min(kHi,k+w);j++){a+=P[j];c++}
    D[k]=10*Math.log10(a/c+1e-30);
  }
  // Noisiness: spectral flatness (geometric / arithmetic mean) in bands of about 1/3 octave,
  // weighted by each band's energy. Measuring within narrow bands ignores the overall
  // tilt of pink or brown noise; the weighting lets the loud parts decide. For noise
  // averaged over M spectra the expected flatness is exp(ψ(M) − ln M) (0.56 for M = 1),
  // so the result is divided by that to give about 1 for noise and about 0 for pure tones.
  let wsum=0, fsum=0;
  for(let a=kLo;a<kHi;){
    const b=Math.min(kHi,Math.max(a+8,Math.round(a*1.26)));
    let lg=0, ar=0; for(let k=a;k<b;k++){lg+=Math.log(P[k]+1e-30); ar+=P[k]}
    const cnt=b-a; if(ar>0){fsum+=ar*Math.exp(lg/cnt)/(ar/cnt); wsum+=ar}
    a=b;
  }
  const psi=M=>M<2?-0.5772:Math.log(M)-1/(2*M)-1/(12*M*M);
  const flatness=clamp((wsum?fsum/wsum:1)/Math.exp(psi(M)-Math.log(M)),0,1);
  const peaks=[];
  for(let k=kLo+1;k<kHi;k++){
    if(!(D[k]>D[k-1]&&D[k]>=D[k+1])) continue;
    // prominence: height above the lowest point within half an octave on either side
    const lo=Math.max(kLo,Math.floor(k/1.41)), hi=Math.min(kHi,Math.ceil(k*1.41));
    let mL=Infinity,mR=Infinity; for(let j=lo;j<k;j++) mL=Math.min(mL,D[j]); for(let j=k+1;j<=hi;j++) mR=Math.min(mR,D[j]);
    const prom=D[k]-Math.max(mL,mR);
    if(prom<4) continue;
    // −3 dB bandwidth on the raw spectrum -> Q
    let a=k,b=k; const lim=P[k]/2;
    while(a>kLo&&P[a]>lim) a--; while(b<kHi&&P[b]>lim) b++;
    peaks.push({f:hz(k),db:D[k],prom,q:Math.max(1,hz(k)/Math.max(sr/N,hz(b)-hz(a)))});
  }
  peaks.sort((p,q)=>q.prom-p.prom);
  const res=[];
  for(const p of peaks){ if(res.every(r=>Math.abs(Math.log2(p.f/r.f))>1/3)) res.push(p); if(res.length===3) break }
  res.sort((a,b)=>a.f-b.f);
  const top=Math.max(...res.map(r=>r.db),-Infinity);
  res.forEach(r=>r.rel=Math.pow(10,(r.db-top)/20));
  return {centroid,flatness,res};
}

/* Main analysis. chans: array of Float32Array; returns plain data + raw slices.
   Onsets: short-time energy of a pre-emphasised signal (5 ms hop), an onset is a rise
   of at least 6 dB within 20 ms that ends at least 12 dB above the noise floor. */
function analyseAudio(chans,sr){
  const n=Math.min(chans[0].length,Math.floor(AN_MAX_SECS*sr));
  const x=new Float32Array(n);
  for(const c of chans) for(let i=0;i<n;i++) x[i]+=c[i]/chans.length;
  // DC / rumble removal: one-pole high-pass at 40 Hz
  const a=Math.exp(-2*Math.PI*40/sr); let px=0,py=0;
  for(let i=0;i<n;i++){const y=a*(py+x[i]-px); px=x[i]; py=y; x[i]=y}
  const H=Math.max(1,Math.round(sr*0.005)), F=Math.floor(n/H);
  const E=new Float32Array(F);                  // dB, pre-emphasised (transients stand out)
  const A=new Float32Array(F);                  // dB, plain level
  for(let f=0;f<F;f++){
    let e=0,p=0; const s=f*H, t=Math.min(n,s+2*H);
    for(let i=Math.max(1,s);i<t;i++){const d=x[i]-0.95*x[i-1]; e+=d*d; p+=x[i]*x[i]}
    E[f]=10*Math.log10(e/(t-s)+1e-12); A[f]=10*Math.log10(p/(t-s)+1e-12);
  }
  const floor=quantile(E,0.2), top=quantile(E,0.995);
  const onsets=[]; let last=-1e9;
  for(let f=4;f<F-1;f++){
    let m=Infinity; for(let j=f-4;j<f;j++) m=Math.min(m,E[j]);
    if(E[f]-m>=6&&E[f]>floor+12&&E[f]>=E[f+1]-1&&f-last>=6){   // at least 30 ms apart
      let pk=f; for(let j=f;j<Math.min(F,f+6);j++) if(E[j]>E[pk]) pk=j;
      onsets.push({f,pre:Math.max(0,f-2),pk}); last=f;
    }
  }
  // steadiness: how much the level moves around, in the part above the floor
  const aFloor=quantile(A,0.2), above=Array.from(A).filter(v=>v>aFloor+3);   // (computed once: inside the filter it was quadratic)
  const spread=above.length?quantile(above,0.9)-quantile(above,0.1):0;
  const dur=n/sr, rate=onsets.length/Math.max(0.5,dur);
  const kind=(onsets.length>=3&&rate<=20&&spread>=8)?'events':'texture';

  // ----- events
  const events=[];
  for(let i=0;i<onsets.length;i++){
    const o=onsets[i], nextF=i+1<onsets.length?onsets[i+1].f:F;
    let end=o.pk;
    while(end<Math.min(F-1,nextF,o.pk+160)&&E[end]>E[o.pk]-30&&E[end]>floor+3) end++;
    const s0=Math.max(0,o.pre*H), s1=Math.min(n,(end+2)*H);
    if(s1-s0<Math.round(0.01*sr)) continue;
    let peak=0; for(let j=s0;j<s1;j++) peak=Math.max(peak,Math.abs(x[j]));
    // decay: time from the peak to 20 dB below it (in the plain level)
    let k=o.pk; while(k<Math.min(F-1,end+1)&&A[k]>A[o.pk]-20) k++;
    const t20=(k-o.pk)*H/sr;
    events.push({s0,s1,peak,t:o.f*H/sr,t20,attack:(o.pk-o.f)*H/sr});
  }
  const iois=[]; for(let i=1;i<onsets.length;i++) iois.push((onsets[i].f-onsets[i-1].f)*H/sr);
  const meanIoi=iois.length?iois.reduce((s,v)=>s+v,0)/iois.length:1;
  const cv=iois.length>1?Math.sqrt(iois.reduce((s,v)=>s+(v-meanIoi)**2,0)/iois.length)/meanIoi:0;

  // keep up to 32 of the loudest events, as normalised slices with fades
  const kept=[...events].sort((p,q)=>q.peak-p.peak).slice(0,32).sort((p,q)=>p.s0-q.s0);
  const maxPeak=Math.max(1e-9,...kept.map(e=>e.peak));
  const slices=kept.map(e=>{
    const L=e.s1-e.s0, y=new Float32Array(L), fi=Math.round(0.0015*sr), fo=Math.min(Math.round(0.02*sr),Math.floor(L*0.3));
    for(let j=0;j<L;j++){
      let g=1; if(j<fi) g=j/fi; if(j>=L-fo) g=Math.min(g,(L-1-j)/fo);
      y[j]=x[e.s0+j]*g*0.9/e.peak;
    }
    return {data:y,gain:e.peak/maxPeak};
  });

  // ----- texture: the loudest window of up to 10 s, looped with an equal-power crossfade
  const W=Math.min(n,Math.round(10*sr)), step=Math.round(sr);
  let bestS=0,bestE=-1;
  for(let s=0;s+W<=n;s+=step){let e=0; for(let j=s;j<s+W;j+=64) e+=x[j]*x[j]; if(e>bestE){bestE=e;bestS=s}}
  const fade=Math.min(Math.round(0.5*sr),Math.floor(W/4)), TL=W-fade, tex=new Float32Array(TL);
  for(let j=0;j<TL;j++) tex[j]=x[bestS+j];
  for(let j=0;j<fade;j++){const u=j/fade; tex[j]=x[bestS+j]*Math.sqrt(u)+x[bestS+TL+j]*Math.sqrt(1-u)}
  let te=0; for(let j=0;j<TL;j++) te+=tex[j]*tex[j];
  const tk=0.18/Math.sqrt(te/TL+1e-20); for(let j=0;j<TL;j++) tex[j]*=tk;

  // ----- spectrum: average over events (first 4096 samples of each) or over the texture
  const N=4096, P=new Float64Array(N/2);
  const segs=kind==='events'&&kept.length?kept.map(e=>e.s0):Array.from({length:Math.max(1,Math.floor(TL/N))},(_,i)=>bestS+i*N);
  const used=segs.slice(0,64);
  for(const s0 of used){const Q=powerSpectrum(x,s0,N); for(let k=0;k<P.length;k++) P[k]+=Q[k]}
  const spec=describeSpectrum(P,sr,used.length);

  const envelope=Array.from(E,v=>Math.max(0,Math.min(1,(v-floor)/Math.max(1,top-floor))));
  return {
    sr,dur,kind,
    count:onsets.length,rate,meanIoi,cv,iois,
    decay:median(events.map(e=>e.t20)),attack:median(events.map(e=>e.attack)),
    ...spec,spread,
    slices,texture:tex,
    envelope,onsetTimes:onsets.map(o=>o.f*H/sr),hop:H/sr
  };
}

// Turn raw Float32 data into an AudioBuffer (usable by any audio context)
function toBuffer(data,sr){const b=new AudioBuffer({length:Math.max(1,data.length),sampleRate:sr,numberOfChannels:1}); b.copyToChannel(data,0); return b}
function normPeak(d,to=0.9){let p=1e-9; for(const v of d) p=Math.max(p,Math.abs(v)); for(let i=0;i<d.length;i++) d[i]*=to/p; return d}
/* "Synthesised copy": rebuild the sound from the measurements only.
   Events: a short noise burst excites the measured resonances, each with
   Q = π·f·τ so it rings for the measured decay time τ, plus a decaying band
   of noise around the spectral centroid, weighted by how noisy the original is.
   Textures: noise through the same resonances and a band at the centroid. */
async function bakeCopy(an){
  const sr=48000, tau=Math.max(0.004,(an.decay||0.05)/Math.LN10), noisy=an.res.length?an.flatness:1;
  const out={};
  // --- events
  const slot=Math.min(1.5,0.05+(an.attack||0.002)+7*tau), n=16, L=Math.round(slot*sr);
  let oc=new OfflineAudioContext(1,n*L,sr), noise=makeNoise(4,false,oc);
  for(let k=0;k<n;k++){
    const t=k*slot, det=1+(rand()-0.5)*0.08, g=new GainNode(oc);
    for(const r of an.res){
      const q=clamp(Math.PI*r.f*det*tau,2,400);
      g.connect(new BiquadFilterNode(oc,{type:'bandpass',frequency:r.f*det,Q:q})).connect(new GainNode(oc,{gain:r.rel*Math.sqrt(q)})).connect(oc.destination);
    }
    burst(t,clamp(an.attack||0.002,0.001,0.01),1,g,{c:oc,noise,tail:6*tau});
    if(noisy>0.05){
      const bp=new BiquadFilterNode(oc,{type:'bandpass',frequency:an.centroid*det,Q:0.7}); bp.connect(new GainNode(oc,{gain:3*noisy})).connect(oc.destination);
      burst(t,4*tau*Math.LN10,1,bp,{c:oc,noise,attack:clamp(an.attack||0.002,0.001,0.02)});
    }
  }
  const ev=(await oc.startRendering()).getChannelData(0);
  out.events=Array.from({length:n},(_,k)=>toBuffer(normPeak(ev.slice(k*L,(k+1)*L)),sr));
  // --- texture
  const TL=6*sr, fade=Math.round(0.5*sr);
  oc=new OfflineAudioContext(1,TL+fade,sr); noise=makeNoise(TL/sr+1,false,oc);
  const src=new AudioBufferSourceNode(oc,{buffer:noise}); src.start(0);
  for(const r of an.res) src.connect(new BiquadFilterNode(oc,{type:'bandpass',frequency:r.f,Q:clamp(r.q,1,60)})).connect(new GainNode(oc,{gain:r.rel*Math.sqrt(clamp(r.q,1,60))})).connect(oc.destination);
  src.connect(new BiquadFilterNode(oc,{type:'bandpass',frequency:an.centroid,Q:0.6})).connect(new GainNode(oc,{gain:0.3+2*noisy})).connect(oc.destination);
  const x=(await oc.startRendering()).getChannelData(0), tex=new Float32Array(TL);
  for(let j=0;j<TL;j++) tex[j]=x[j];
  for(let j=0;j<fade;j++){const u=j/fade; tex[j]=x[j]*Math.sqrt(u)+x[TL+j]*Math.sqrt(1-u)}
  let e=0; for(const v of tex) e+=v*v; const kk=0.18/Math.sqrt(e/TL+1e-20); for(let j=0;j<TL;j++) tex[j]*=kk;
  out.texture=toBuffer(tex,sr);
  return out;
}
async function loadUserSound(file){
  const bytes=await file.arrayBuffer();
  const dec=new OfflineAudioContext(1,1,48000);
  let audio;
  try{audio=await dec.decodeAudioData(bytes)}
  catch(e){throw new Error(file.type.startsWith('video')
    ?"This browser can't read the sound in this video. Try Chrome, Edge or Safari, or export the audio as .wav or .mp3."
    :"The browser couldn't read the sound in this file. Try exporting it as .wav or .mp3.")}
  const chans=Array.from({length:audio.numberOfChannels},(_,i)=>audio.getChannelData(i));
  const an=analyseAudio(chans,audio.sampleRate);
  const copy=await bakeCopy(an);
  return {
    name:file.name,an,
    rec:{events:an.slices.map(s=>({buf:toBuffer(s.data,an.sr),gain:s.gain})),texture:toBuffer(an.texture,an.sr)},
    syn:{events:copy.events.map(buf=>({buf,gain:null})),texture:copy.texture},
    gains:an.slices.map(s=>s.gain)
  };
}
