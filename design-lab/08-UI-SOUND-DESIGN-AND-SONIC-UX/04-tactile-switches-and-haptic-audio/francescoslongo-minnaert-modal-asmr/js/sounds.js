/* Hush: Sound generators and music helpers. Loaded as a classic script; see index.html for the order. */

/* ---------------- sound generators ---------------- */
const MATERIALS={
  wood:   {f:[680,1720,2950], q:[18,22,25],   g:[9,6,4],  tail:0.15},
  plastic:{f:[1300,3100,5200],q:[25,30,30],   g:[8,5,3],  tail:0.15},
  glass:  {f:[2300,5900,9800],q:[120,140,150],g:[14,8,5], tail:0.6}
};
/* Whisper phonetics. Formants are raised a little compared with voiced speech, as
   measured for whispers; F4 is fixed near 3.7 kHz. w = how often each vowel occurs:
   the reduced vowel (schwa) dominates real speech, which keeps the flow natural. */
const VOWELS=[
  {f:[520,1500,2500],w:3},   // ə (schwa)
  {f:[850,1250,2650],w:1},   // a
  {f:[620,1850,2650],w:1.3}, // e
  {f:[400,2250,2950],w:1.3}, // i
  {f:[640,1000,2550],w:0.8}, // o
  {f:[440,1000,2350],w:0.8}, // u
  {f:[720,1650,2550],w:1}    // æ
];
const ONSETS=[['s',3],['sh',1.2],['f',1],['h',1.5],['t',2],['k',1.5],['p',1],['n',2],['m',1.5],['l',1.5],['w',1],['',2.5]];
const CODAS=[['',5],['s',2],['t',1.5],['n',2],['k',1],['sh',0.5]];
const wpick=list=>{let r=rand()*list.reduce((a,x)=>a+(x.w??x[1]),0); for(const x of list){r-=x.w??x[1]; if(r<=0) return x} return list[0]};

/* ---------------- music ----------------
   All instruments share one key and scale, so they always sound good together. */
const NOTE_NAMES=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const SCALES={
  majPent:['Major pentatonic',[0,2,4,7,9]],
  minPent:['Minor pentatonic',[0,3,5,7,10]],
  major:['Major',[0,2,4,5,7,9,11]],
  minor:['Minor',[0,2,3,5,7,8,10]],
  dorian:['Dorian',[0,2,3,5,7,9,10]]
};
const MUSIC={root:2,scale:'majPent'};          // D major pentatonic
const mtof=m=>440*Math.pow(2,(m-69)/12);
const scaleLen=()=>SCALES[MUSIC.scale][1].length;
// MIDI note of scale degree `deg` (0 = tonic, may be negative or above one octave) above C `base`
function scaleMidi(base,deg){
  const sc=SCALES[MUSIC.scale][1], n=sc.length;
  return base+MUSIC.root+sc[((deg%n)+n)%n]+12*Math.floor(deg/n);
}
// Struck resonator played live: each mode is [ratio, amplitude, decay τ (s), beat (Hz)].
// A non-zero beat splits the mode into two slightly detuned partials, as in a real bowl.
function modalStrike(v,t,f,modes,amp,decay=1){
  const out=gn(1); out.connect(v.inp);
  let live=0;
  for(const [ratio,a,tau,beat] of modes){
    const fm=f*ratio; if(fm>16000) continue;
    const T=tau*decay, pair=beat?[-beat/2,beat/2]:[0];
    for(const df of pair){
      const o=new OscillatorNode(ctx,{frequency:fm+df}), g=gn(0);
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(amp*a/pair.length,t+0.003);
      g.gain.setTargetAtTime(0,t+0.003,T);
      o.connect(g).connect(out); o.start(t); o.stop(t+0.003+5*T);   // stop at about −43 dB
      live++; v.loops.push(o);
      o.onended=()=>{
        o.disconnect(); g.disconnect();
        const i=v.loops.indexOf(o); if(i>=0) v.loops.splice(i,1);
        if(--live===0) out.disconnect();
      };
    }
  }
}
// Karplus–Strong plucked strings, computed directly into buffers:
// y[n] = ρ·(y[n−N] + y[n−N−1])/2, period N + ½ samples, ρ chosen for a decay time τ
function ksBank(midis,dur){
  const sr=ctx.sampleRate, L=Math.round(dur*sr), fade=Math.round(0.08*sr), bank={midis:[],bufs:[]};
  for(const m of midis){
    const N=Math.max(2,Math.round(sr/mtof(m)-0.5)), f=sr/(N+0.5);
    const tau=clamp(2.2*Math.sqrt(220/f),0.6,4), rho=Math.exp(-1/(f*tau));
    const b=ctx.createBuffer(1,L,sr), y=b.getChannelData(0);
    let lp=0, mean=0;
    for(let i=0;i<=N;i++){lp=0.6*lp+0.4*(rand()*2-1); y[i]=lp; mean+=lp}   // softened pluck
    mean/=N+1; for(let i=0;i<=N;i++) y[i]-=mean;
    for(let n=N+1;n<L;n++) y[n]=rho*0.5*(y[n-N]+y[n-N-1]);
    let pk=1e-9; for(let n=0;n<L;n++) pk=Math.max(pk,Math.abs(y[n]));
    for(let n=0;n<L;n++) y[n]*=0.6/pk;
    for(let n=0;n<fade;n++) y[L-1-n]*=n/fade;
    bank.midis.push(69+12*Math.log2(f/440)); bank.bufs.push(b);     // true pitch of the integer delay
  }
  return bank;
}
// play the nearest pre-rendered note, shifted to the exact pitch
function playNote(v,bank,midi,gain,t,cents=0){
  let k=0;
  for(let i=1;i<bank.midis.length;i++) if(Math.abs(bank.midis[i]-midi)<Math.abs(bank.midis[k]-midi)) k=i;
  oneShot(v,bank.bufs[k],t,gain,Math.pow(2,(midi-bank.midis[k]+cents/100)/12));
}

const microClicks=(c,noise,t,out)=>{            // wet, sticky micro-clicks
  const n=4+Math.floor(rand()*7);
  for(let i=0;i<n;i++){
    const h=new BiquadFilterNode(c,{type:'highpass',frequency:2000+rand()*3500,Q:0.7}); h.connect(out);
    burst(t+rand()*0.05,0.0005+rand()*0.0012,0.2+0.8*rand()**2,h,{c,noise});
  }
};
const modal=(c,out,modes)=>{                      // parallel resonators -> returns their shared input
  const g=new GainNode(c);
  modes.forEach(([f,q,a])=>g.connect(new BiquadFilterNode(c,{type:'bandpass',frequency:f,Q:q})).connect(new GainNode(c,{gain:a})).connect(out));
  return g;
};
const BAKE={
  harp:async()=>ksBank([44,48,52,56,60,64,68,72,76,80,84,88],2.5),
  rain:()=>bakeBank(48,0.07,(c,noise,t,out)=>{
    const f=new BiquadFilterNode(c,{type:'bandpass',frequency:1800+rand()*5500,Q:3+rand()*6}); f.connect(out);
    burst(t,0.015+rand()*0.035,1,f,{c,noise});
  }),
  fire:()=>bakeBank(48,0.03,(c,noise,t,out)=>{
    const f=new BiquadFilterNode(c,{type:'highpass',frequency:1200+rand()*3000,Q:0.7}); f.connect(out);
    burst(t,0.0015+rand()*0.006,1,f,{c,noise});
  }),
  tap:async()=>{
    const mats=Object.entries(MATERIALS);
    const banks=await Promise.all(mats.map(([,M])=>bakeBank(16,0.003+M.tail+0.05,(c,noise,t,out)=>
      burst(t,0.003,1,modal(c,out,M.f.map((f,i)=>[f,M.q[i],M.g[i]])),{c,noise,tail:M.tail}))));
    return Object.fromEntries(mats.map(([k],i)=>[k,banks[i]]));
  },
  // water drop: impact click, then a Minnaert bubble whose pitch rises as it nears the surface
  drops:()=>bakeBank(32,0.14,(c,noise,t,out)=>{
    const h=new BiquadFilterNode(c,{type:'highpass',frequency:2500}); h.connect(out);
    burst(t,0.002,0.25,h,{c,noise});
    const f0=450+rand()*1100;
    tone(c,t+0.004,0.05+rand()*0.06,out,{f0,f1:f0*(1.5+rand()*0.8),peak:0.6,attack:0.001});
  }),
  mouth:async()=>{
    const [click,smack,wet]=await Promise.all([
      // tongue click: impulse into the mouth cavity's two main resonances
      bakeBank(16,0.08,(c,noise,t,out)=>{const f=1100+rand()*1600; burst(t,0.002,1,modal(c,out,[[f,8,6],[f*1.9,6,2.5]]),{c,noise,tail:0.06})}),
      // lip smack: noise through a resonance that falls quickly as the lips part
      bakeBank(16,0.1,(c,noise,t,out)=>{
        const bp=new BiquadFilterNode(c,{type:'bandpass',frequency:2600,Q:1.8}), lp=new BiquadFilterNode(c,{type:'lowpass',frequency:4000});
        bp.frequency.setValueAtTime(2200+rand()*800,t); bp.frequency.exponentialRampToValueAtTime(500+rand()*400,t+0.04);
        bp.connect(lp).connect(out); burst(t,0.03+rand()*0.02,1.2,bp,{c,noise,attack:0.003});
      }),
      bakeBank(16,0.08,microClicks)
    ]);
    return {click,smack,wet};
  },
  squish:async()=>{
    const [bub,wet]=await Promise.all([
      bakeBank(32,0.07,(c,noise,t,out)=>{const f0=250+rand()*600; tone(c,t,0.015+rand()*0.04,out,{f0,f1:f0*(1.2+rand()*0.9),attack:0.001})}),
      bakeBank(16,0.08,microClicks)
    ]);
    return {bub,wet};
  },
  crack:async()=>{
    const [crinkle,ice,snap]=await Promise.all([
      bakeBank(48,0.012,(c,noise,t,out)=>{
        const f=new BiquadFilterNode(c,rand()<0.5?{type:'highpass',frequency:2500+rand()*5000,Q:0.7}:{type:'bandpass',frequency:3000+rand()*5000,Q:2});
        f.connect(out); burst(t,0.0008+rand()*0.003,1,f,{c,noise,tail:0.005});
      }),
      // ice: sharp crack, low thump, and a falling "pew": flexural waves in ice are
      // dispersive, so high frequencies arrive first
      bakeBank(16,0.6,(c,noise,t,out)=>{
        const h=new BiquadFilterNode(c,{type:'highpass',frequency:1500}); h.connect(out);
        burst(t,0.003,1,h,{c,noise});
        tone(c,t+0.001,0.08,out,{f0:140,f1:55,peak:0.6,attack:0.001});
        const d=0.15+rand()*0.3;
        tone(c,t+0.002,d,out,{f0:2500+rand()*2500,f1:220+rand()*300,peak:0.35});
        if(rand()<0.5) tone(c,t+0.05+rand()*0.1,d*0.7,out,{f0:1800+rand()*2000,f1:200+rand()*200,peak:0.15});
      }),
      // twig: broadband snap exciting short woody modes, then a smaller second break
      bakeBank(16,0.3,(c,noise,t,out)=>{
        const j=0.85+rand()*0.3, g=modal(c,out,[[850*j,10,5],[2100*j,14,3.5],[3500*j,16,2]]);
        const h=new BiquadFilterNode(c,{type:'highpass',frequency:1200}); h.connect(out);
        const t2=t+0.012+rand()*0.05;
        burst(t,0.0015,1,g,{c,noise,tail:0.1}); burst(t,0.002,0.6,h,{c,noise});
        burst(t2,0.001,0.5,g,{c,noise,tail:0.1}); burst(t2,0.0015,0.3,h,{c,noise});
      })
    ]);
    return {crinkle,ice,snap};
  },
  // one purr pulse: a low noise puff plus a short low tone
  purr:()=>bakeBank(12,0.07,(c,noise,t,out)=>{
    const lp=new BiquadFilterNode(c,{type:'lowpass',frequency:500+rand()*300,Q:0.7}); lp.connect(out);
    burst(t,0.035,1,lp,{c,noise,attack:0.006});
    tone(c,t,0.04,out,{f0:85+rand()*20,f1:60,peak:0.7,attack:0.006});
  }),
  // one cricket pulse: a nearly pure tone around 4.5 kHz
  crickets:()=>bakeBank(8,0.03,(c,noise,t,out)=>tone(c,t,0.018,out,{f0:4200+rand()*700,attack:0.002,hold:0.6})),
  birds:async()=>{
    const [up,down,whistle,note]=await Promise.all([
      bakeBank(8,0.12,(c,n,t,o)=>tone(c,t,0.07+rand()*0.04,o,{f0:2200+rand()*800,f1:4500+rand()*1500,attack:0.005,hold:0.5,harm:0.08})),
      bakeBank(8,0.14,(c,n,t,o)=>tone(c,t,0.08+rand()*0.05,o,{f0:5500+rand()*1000,f1:2500+rand()*700,attack:0.004,hold:0.5,harm:0.08})),
      bakeBank(8,0.3,(c,n,t,o)=>tone(c,t,0.18+rand()*0.08,o,{f0:2800+rand()*900,peak:0.8,attack:0.02,hold:0.75,vib:0.02,vibHz:18+rand()*10,harm:0.05})),
      bakeBank(8,0.05,(c,n,t,o)=>{const f=4000+rand()*1200; tone(c,t,0.03,o,{f0:f*1.1,f1:f*0.9,attack:0.002,hold:0.3})})
    ]);
    return {up,down,whistle,note};
  },
  // frog croak ("rib-bit"): a buzzy source gated by a fast pulse train, through a throat resonance
  frogs:()=>bakeBank(16,1.0,(c,noise,t,out)=>{
    const f0=180+rand()*140, o=new OscillatorNode(c,{type:'sawtooth',frequency:f0}), g=new GainNode(c,{gain:0});
    o.connect(new BiquadFilterNode(c,{type:'bandpass',frequency:700+rand()*500,Q:2.5}))
     .connect(new BiquadFilterNode(c,{type:'lowpass',frequency:2500})).connect(g).connect(out);
    const pr=28+rand()*16, parts=rand()<0.6?2:1; let tt=t;
    for(let q=0;q<parts;q++){
      const n=5+Math.floor(rand()*7);
      for(let i=0;i<n;i++){g.gain.setValueAtTime(0,tt); g.gain.linearRampToValueAtTime(1,tt+0.002); g.gain.exponentialRampToValueAtTime(0.02,tt+0.8/pr); tt+=1/pr}
      tt+=0.06;
    }
    g.gain.setValueAtTime(0,tt);
    o.frequency.setValueAtTime(f0,t); o.frequency.linearRampToValueAtTime(f0*0.9,tt);
    o.start(t); o.stop(tt+0.01);
  })
};

const GEN={
  rain:{
    build(v){
      const s=loop(v,WHITE), f=bq('bandpass',1100,0.5), h=bq('highshelf',3000), g=gn(0.12);
      h.gain.value=-6; s.connect(f).connect(h).connect(g).connect(v.inp); v.nodes.push(f,h,g);
    },
    schedule(v,t1){
      while(v.next<t1){
        oneShot(v,pick(BANKS.rain),v.next,0.02+0.4*rand()**2,0.85+rand()*0.3);
        v.next+=expRand(v.p.density);
      }
    }
  },
  tap:{
    build(){},
    schedule(v,t1){
      const bank=BANKS.tap[v.p.material], r=v.p.rate;
      while(v.next<t1){
        oneShot(v,pick(bank),v.next,0.5+rand()*0.5,1+(rand()-0.5)*0.06);   // playbackRate detunes all modes together
        v.next+= rand()<0.78 ? (0.07+rand()*0.12)/r : (0.35+rand()*0.9)/r;   // taps come in clusters
      }
    }
  },
  brush:{
    build(v){
      const s=loop(v,WHITE), bp=bq('bandpass',3000,0.9), hp=bq('highpass',700), g=gn(0);
      s.connect(bp).connect(hp).connect(g).connect(v.inp); v.nodes.push(bp,hp,g); v.bp=bp; v.sg=g;
    },
    schedule(v,t1){
      while(v.next<t1){
        const t=v.next, D=(0.3+rand()*0.4)/Math.sqrt(v.p.rate), A=0.25+rand()*0.2, up=rand()<0.5;
        v.sg.gain.setValueAtTime(0,t);
        v.sg.gain.linearRampToValueAtTime(A,t+D*0.15);
        v.sg.gain.linearRampToValueAtTime(A*0.7,t+D*0.75);
        v.sg.gain.linearRampToValueAtTime(0,t+D);
        v.bp.frequency.setValueAtTime(up?2200:4800,t);
        v.bp.frequency.linearRampToValueAtTime(up?4800:2200,t+D);   // stroke direction = spectral sweep
        v.next=t+D+(0.04+rand()*0.25)/v.p.rate;
      }
    }
  },
  fire:{
    build(v){
      const s=loop(v,BROWN), lp=bq('lowpass',380,0.7), g=gn(0.45);
      s.connect(lp).connect(g).connect(v.inp); v.nodes.push(lp,g);
    },
    schedule(v,t1){
      while(v.next<t1){
        const n=rand()<0.2?3+rint(4):1;
        for(let k=0;k<n;k++) oneShot(v,pick(BANKS.fire),v.next+(k?rand()*0.06:0),0.05+0.9*rand()**3,0.9+rand()*0.2);   // heavy-tailed loudness
        v.next+=expRand(v.p.intensity);
      }
    }
  },
  noise:{
    build(v){
      v.cur=null;
      v.tone=bq('lowpass',toneHz(v.p.tone),0.5); v.swell=gn(1);
      v.lfo=new OscillatorNode(ctx,{frequency:0.07}); v.lfoG=gn(0);   // ~14 s "waves" swell
      v.lfo.connect(v.lfoG).connect(v.swell.gain); v.lfo.start(); v.loops.push(v.lfo);
      v.tone.connect(v.swell).connect(v.inp); v.nodes.push(v.tone,v.swell,v.lfoG);
      this.setSwell(v); this.setColor(v,0.01);
    },
    setColor(v,fade){
      const now=ctx.currentTime, src=new AudioBufferSourceNode(ctx,{buffer:colorNoise(v.p.color),loop:true}), g=gn(0), extra=[];
      src.start(now,rand()*8); v.loops.push(src); src.connect(g);
      let tail=g;
      if(v.p.color==='grey'){   // rough inverse equal-loudness curve on top of pink
        const ls=new BiquadFilterNode(ctx,{type:'lowshelf',frequency:200,gain:8});
        const pk=new BiquadFilterNode(ctx,{type:'peaking',frequency:3000,Q:0.8,gain:-7});
        g.connect(ls).connect(pk); tail=pk; extra.push(ls,pk);
      }
      tail.connect(v.tone); v.nodes.push(g,...extra);
      g.gain.setTargetAtTime(1,now,fade);
      if(v.cur){
        const old=v.cur, loops=v.loops, nodes=v.nodes, dead=[old.g,...old.extra];
        old.g.gain.setTargetAtTime(0,now,fade);
        setTimeout(()=>{
          try{old.src.stop()}catch(e){}
          dead.forEach(n=>n.disconnect());
          loops.splice(loops.indexOf(old.src),1);
          dead.forEach(n=>nodes.splice(nodes.indexOf(n),1));
        },fade*8000);
      }
      v.cur={src,g,extra};
    },
    setSwell(v){
      const now=ctx.currentTime, d=v.p.swell;
      v.swell.gain.setTargetAtTime(1-0.45*d,now,0.1);
      v.lfoG.gain.setTargetAtTime(0.45*d,now,0.1);
    },
    update(v,key){
      if(key==='color') this.setColor(v,0.25);
      else if(key==='tone') v.tone.frequency.setTargetAtTime(toneHz(v.p.tone),ctx.currentTime,0.05);
      else if(key==='swell') this.setSwell(v);
      else if(key==='spread'){v.stop(); v.start()}
    },
    schedule(){}
  },
  drops:{
    build(){},
    schedule(v,t1){
      while(v.next<t1){
        const r=(0.9+0.2*rand())/v.p.size;              // bigger drop -> bigger bubble -> lower and longer
        oneShot(v,pick(BANKS.drops),v.next,0.3+0.7*rand()**2,r);
        if(rand()<0.25) oneShot(v,pick(BANKS.drops),v.next+0.08+rand()*0.12,0.2+0.4*rand(),r*(0.9+0.2*rand()));
        v.next+=expRand(v.p.rate);
      }
    }
  },
  mouth:{
    build(v){v.state={left:2+rint(5)}},   // start with a group straight away
    schedule(v,t1){
      const B=BANKS.mouth, s=v.state, r=v.p.rate;
      while(v.next<t1){
        if(s.left<=0){s.left=2+rint(5); v.next+=(0.6+rand()*1.6)/r; continue}   // pause between groups
        const t=v.next, x=rand(), st=v.p.style;
        const type= st==='clicks'?(x<0.85?'click':'wet') : st==='smacks'?(x<0.7?'smack':'wet') : (x<0.4?'click':x<0.75?'smack':'wet');
        oneShot(v,pick(B[type]),t,type==='wet'?0.5:0.5+0.3*rand(),0.9+rand()*0.2);
        if(type!=='wet'&&rand()<v.p.wet) oneShot(v,pick(B.wet),t+0.01+rand()*0.03,0.25+0.35*v.p.wet,0.9+rand()*0.2);
        s.left--; v.next+=(0.07+rand()*0.2)/r;
      }
    }
  },
  squish:{
    build(v){
      const s=loop(v,WHITE), bp=bq('bandpass',600,1.5), lp=bq('lowpass',2500), g=gn(0);
      s.connect(bp).connect(lp).connect(g).connect(v.inp); v.nodes.push(bp,lp,g); v.bp=bp; v.sg=g;
    },
    schedule(v,t1){
      const B=BANKS.squish;
      while(v.next<t1){
        const t=v.next, D=(0.45+rand()*0.7)/Math.sqrt(v.p.rate), A=0.35+rand()*0.25, up=rand()<0.5;
        v.sg.gain.setValueAtTime(0,t);
        v.sg.gain.linearRampToValueAtTime(A,t+D*0.3);
        v.sg.gain.linearRampToValueAtTime(A*0.5,t+D*0.8);
        v.sg.gain.linearRampToValueAtTime(0,t+D);
        v.bp.frequency.setValueAtTime(up?350:1000,t);
        v.bp.frequency.exponentialRampToValueAtTime(up?1000:350,t+D);
        const n=Math.round(D*(4+30*v.p.sticky));
        for(let i=0;i<n;i++){                         // pops and sticky clicks, densest mid-squeeze
          const u=rand(), env=Math.sin(Math.PI*u);
          if(rand()<0.6) oneShot(v,pick(B.bub),t+u*D,(0.15+0.5*rand())*env,(1.4-0.7*v.p.size)*(0.85+0.3*rand()));
          else oneShot(v,pick(B.wet),t+u*D,0.3*env,1);
        }
        v.next=t+D+(0.1+rand()*0.6)/v.p.rate;
      }
    }
  },
  crack:{
    build(){},
    schedule(v,t1){
      const B=BANKS.crack, m=v.p.material;
      while(v.next<t1){
        const t=v.next;
        if(m==='plastic'){                            // one crumple gesture: a dense, bursty cloud of clicks
          const D=0.25+rand()*0.9, dens=60+rand()*160;
          for(let tt=t;tt<t+D;){
            const env=Math.sin(Math.PI*(tt-t)/D)**0.7;
            oneShot(v,pick(B.crinkle),tt,(0.05+0.9*rand()**3)*env,0.8+rand()*0.5);
            tt+=expRand(dens*(0.3+env));
          }
          v.next=t+D+(0.2+rand()*1.5)/v.p.rate;
        }else{
          oneShot(v,pick(B[m]),t,0.5+0.5*rand(),0.85+rand()*0.3);
          if(m==='snap'&&rand()<0.3) oneShot(v,pick(B.snap),t+0.15+rand()*0.3,0.3+0.3*rand(),0.9+rand()*0.3);
          v.next=t+expRand(v.p.rate*(m==='ice'?0.7:1));
        }
      }
    }
  },
  purr:{
    build(v){
      const s=loop(v,WHITE), bp=bq('bandpass',900,0.6), g=gn(0);      // breath noise
      s.connect(bp).connect(g).connect(v.inp); v.nodes.push(bp,g); v.bg=g;
      v.state={inhale:true,start:0,end:0,len:1};
    },
    schedule(v,t1){
      const s=v.state;
      while(v.next<t1){
        if(v.next>=s.end){                            // alternate exhale (louder, longer) and inhale
          s.inhale=!s.inhale; s.start=v.next;
          s.len=(s.inhale?0.8+rand()*0.3:1.1+rand()*0.4)/v.p.breath; s.end=v.next+s.len;
          const a=s.inhale?0.05:0.08;
          v.bg.gain.setValueAtTime(0,v.next);
          v.bg.gain.linearRampToValueAtTime(a,v.next+s.len*0.4);
          v.bg.gain.linearRampToValueAtTime(0,v.next+s.len);
        }
        const env=Math.sin(Math.PI*(v.next-s.start)/s.len)**0.6;
        oneShot(v,pick(BANKS.purr),v.next,(s.inhale?0.5:0.9)*env*(0.85+0.3*rand()),0.9+rand()*0.2);
        v.next+=(0.97+0.06*rand())/(v.p.hz*(s.inhale?1.08:1));
      }
    }
  },
  crickets:{
    build(v){v.state={cr:[]}},
    schedule(v,t1){
      // Dolbear's law (snowy tree cricket): chirps per minute N = 4·(T[°F] − 50) + 40
      const now=ctx.currentTime, tF=v.p.temp*9/5+32, period=60/Math.max(20,4*(tF-50)+40);
      const cr=v.state.cr, count=Math.round(v.p.count);
      while(cr.length<count) cr.push({next:now+rand()*period,b:rint(8),jit:0.92+0.16*rand(),n:3+rint(2),g:0.5+0.5*rand()});
      cr.length=count;
      for(const c of cr){
        if(c.next<now-0.3) c.next=now+rand()*0.1;
        while(c.next<t1){
          for(let i=0;i<c.n;i++) oneShot(v,BANKS.crickets[c.b],c.next+i*0.035,c.g*(i?1:0.8),c.jit);
          c.next+=period*c.jit*(0.97+0.06*rand());
        }
      }
      v.next=t1;
    }
  },
  birds:{
    song(){                                          // a short motif that the bird repeats
      return Array.from({length:3+rint(4)},()=>({type:pick(['up','down','whistle','trill']),b:rint(8),n:6+rint(7),gap:0.04+rand()*0.12}));
    },
    build(v){v.state={song:this.song()}},
    schedule(v,t1){
      const B=BANKS.birds, s=v.state, len={up:0.1,down:0.12,whistle:0.25};
      while(v.next<t1){
        if(rand()<0.15) s.song=this.song();
        let t=v.next; const pr=0.92+0.16*rand(), keep=Math.max(2,s.song.length-rint(2));
        for(const e of s.song.slice(0,keep)){
          if(e.type==='trill') for(let k=0;k<e.n;k++){oneShot(v,B.note[e.b],t,0.5,pr); t+=0.055}
          else{oneShot(v,B[e.type][e.b],t,0.6,pr); t+=len[e.type]}
          t+=e.gap;
        }
        v.next=t+(1.5+rand()*4)/v.p.rate;
      }
    }
  },
  frogs:{
    build(){},
    schedule(v,t1){
      while(v.next<t1){
        const r=0.8+0.45*rand();                      // each croak as a different frog
        oneShot(v,pick(BANKS.frogs),v.next,0.9+0.7*rand(),r);
        if(rand()<0.3) oneShot(v,pick(BANKS.frogs),v.next+0.2+rand()*0.4,0.5+0.5*rand(),0.8+0.45*rand());   // an answer
        v.next+=expRand(v.p.rate);
      }
    }
  },
  bowl:{
    f(v){return mtof({large:48,medium:60,small:72}[v.p.size]+MUSIC.root)},
    build(v){
      v.bo=null;
      if(v.p.style!=='sing') return;
      // rubbed rim: the two lowest modes sound continuously, each split into a slowly beating pair
      const f=this.f(v); v.sg=gn(0.22); v.bo=[];
      [[1,1,0.3+rand()*0.5],[2.71,0.35,1+rand()]].forEach(([r,a,beat])=>{
        for(const sgn of [-1,1]){
          const o=new OscillatorNode(ctx,{frequency:f*r+sgn*beat/2}), g=gn(a*0.5);
          o.connect(g).connect(v.sg); o.start(); v.loops.push(o); v.nodes.push(g); v.bo.push({o,r,sgn,beat});
        }
      });
      const lfo=new OscillatorNode(ctx,{frequency:0.06+rand()*0.04}), lg=gn(0.12);   // slow swell of the rubbing
      lfo.connect(lg).connect(v.sg.gain); lfo.start(); v.loops.push(lfo);
      const n=loop(v,WHITE), bp=bq('bandpass',f*2.71,6), ng=gn(0.02);             // faint friction noise
      n.connect(bp).connect(ng).connect(v.inp); v.fr=bp;
      v.sg.connect(v.inp); v.nodes.push(v.sg,lg,bp,ng);
    },
    retune(v){
      if(!v.bo) return;
      const f=this.f(v), now=ctx.currentTime;
      v.bo.forEach(b=>b.o.frequency.setTargetAtTime(f*b.r+b.sgn*b.beat/2,now,0.3));
      v.fr.frequency.setTargetAtTime(f*2.71,now,0.3);
    },
    update(v,key){if(key==='style'){v.stop(); v.start()} else if(key==='size') this.retune(v)},
    schedule(v,t1){
      if(v.p.style!=='strike'){v.next=t1; return}
      while(v.next<t1){
        // mode ratios of a typical bowl: 1 : 2.71 : 5.15 : 8.43
        modalStrike(v,v.next,this.f(v),[[1,1,12,0.3+rand()*0.9],[2.71,0.45,6,1+rand()*1.5],[5.15,0.22,3,1.5+rand()*2.5],[8.43,0.1,1.5,0]],0.3+0.15*rand(),v.p.ring);
        const bp=bq('bandpass',2500+rand()*1500,1.5); bp.connect(v.inp);
        burst(v.next,0.004,0.12,bp,{cleanup:[bp]});                                // mallet contact
        v.next+=60/v.p.rate*(0.75+0.5*rand());
      }
    }
  },
  kalimba:{
    build(v){v.state={deg:scaleLen(),left:4+rint(4)}},
    note(v,t,midi,amp){
      const f=mtof(midi);
      // steel tine: fundamental plus the clamped-bar overtone at 6.27×, which dies quickly
      modalStrike(v,t,f,[[1,1,0.9*Math.pow(523/f,0.3),0],[6.27,0.18,0.06,0]],amp);
      const bp=bq('bandpass',f*3,2); bp.connect(v.inp);
      burst(t,0.0015,0.05*amp,bp,{cleanup:[bp]});
    },
    schedule(v,t1){
      const s=v.state, beat=60/v.p.tempo, top=2*scaleLen();
      while(v.next<t1){
        if(s.left<=0){s.left=6+rint(7); v.next+=beat*(2+rint(3)); continue}   // rest between phrases
        let d=s.deg+pick([-2,-1,-1,0,1,1,2]);
        if(d<0||d>top) d=s.deg-(d-s.deg);                                     // bounce off the ends
        s.deg=clamp(d,0,top);
        const t=v.next+(rand()-0.5)*0.02;                                     // a little human timing
        this.note(v,t,scaleMidi(60,s.deg),0.35+0.15*rand());
        if(rand()<v.p.harmony) this.note(v,t+0.012,scaleMidi(60,s.deg+2),0.25);
        s.left--; v.next+=beat*pick([0.5,0.5,1,1,1,1.5,2]);
      }
    }
  },
  harp:{
    build(){},
    schedule(v,t1){
      const n=scaleLen(), pace=v.p.pace;
      while(v.next<t1){
        const i=rint(n), degs=[i,i+2,i+4,i+n,i+n+2];                         // a chord built from the scale
        const dir=v.p.dir==='both'?(rand()<0.5?'up':'down'):v.p.dir;
        if(dir==='down') degs.reverse();
        let t=v.next;
        for(const g of degs){playNote(v,BANKS.harp,scaleMidi(48,g),0.55+0.3*rand(),t,(rand()-0.5)*6); t+=(0.1+rand()*0.06)/pace}
        v.next=t+(1.2+rand()*1.6)/pace;
      }
    }
  },
  chimes:{
    build(v){v.state={last:2,ph:[rand()*6,rand()*6]}},
    gust(v,t){                                                                // slow, irregular wind strength in [0,1]
      const p=v.state.ph;
      return clamp(0.5+0.5*Math.sin(2*Math.PI*t/17+p[0])*Math.sin(2*Math.PI*t/7.3+p[1])+0.2*Math.sin(2*Math.PI*t/3.1),0,1);
    },
    schedule(v,t1){
      const s=v.state, base=v.p.tubes==='high'?72:60;
      while(v.next<t1){
        const tube=rand()<0.3?rint(6):clamp(s.last+pick([-2,-1,1,2]),0,5); s.last=tube;
        // free-free tube modes: 1 : 2.76 : 5.40
        modalStrike(v,v.next,mtof(scaleMidi(base,tube)),[[1,1,1.8,0],[2.76,0.5,0.9,0],[5.40,0.25,0.4,0]],0.12+0.2*rand()**1.5,v.p.ring);
        v.next+=expRand(0.15+5*v.p.wind*this.gust(v,v.next));
      }
    }
  },
  pad:{
    cut(v){return 250*Math.pow(12,v.p.bright)},                               // 250 Hz .. 3 kHz
    build(v){
      v.lp=bq('lowpass',this.cut(v),0.4); v.amp=gn(0.8);
      const lfo=new OscillatorNode(ctx,{frequency:0.05}), lg=gn(600);          // cutoff drifts ±½ octave
      lfo.connect(lg).connect(v.lp.detune);
      const al=new OscillatorNode(ctx,{frequency:0.07}), ag=gn(0.2);          // slow swell
      al.connect(ag).connect(v.amp.gain);
      const mg=new ChannelMergerNode(ctx,{numberOfInputs:2});
      v.po=[];
      for(let j=0;j<4;j++) for(const [ch,det] of [[0,-7],[1,7]]){             // each chord tone: two saws, detuned, one per ear
        const o=new OscillatorNode(ctx,{type:'sawtooth',detune:det+(rand()-0.5)*4}), g=gn(0.045);
        o.connect(g).connect(mg,0,ch); o.start(); v.loops.push(o); v.nodes.push(g); v.po.push({o,j});
      }
      lfo.start(); al.start(); v.loops.push(lfo,al);
      mg.connect(v.lp).connect(v.amp).connect(v.inp); v.nodes.push(mg,v.lp,v.amp,lg,ag);
      v.state={i:0}; this.chord(v,ctx.currentTime,0.01);
      v.next=ctx.currentTime+60/v.p.change;
    },
    chord(v,t,glide){
      const i=v.state.i, ms=[scaleMidi(36,i),scaleMidi(48,i),scaleMidi(48,i+2),scaleMidi(48,i+4)];
      v.po.forEach(({o,j})=>o.frequency.setTargetAtTime(mtof(ms[j]),t,glide));
    },
    retune(v){this.chord(v,ctx.currentTime,0.3)},
    update(v,key){
      if(key==='bright') v.lp.frequency.setTargetAtTime(this.cut(v),ctx.currentTime,0.1);
      else if(key==='spread'){v.stop(); v.start()}
    },
    schedule(v,t1){
      while(v.next<t1){
        const n=scaleLen(); let i;
        do{i=rint(n)}while(i===v.state.i&&n>1);
        v.state.i=i; this.chord(v,v.next,1.2);                                // chords melt into each other
        v.next+=60/v.p.change*(0.8+0.4*rand());
      }
    }
  },
  user:{
    rate(v){return Math.pow(2,v.p.pitch/12)},
    build(v){
      v.tex=null; v.state={j:0};
      const U=v.user; if(!U) return;
      if(v.p.kind==='texture'){
        const buf=U[v.p.source].texture;
        const s=new AudioBufferSourceNode(ctx,{buffer:buf,loop:true,playbackRate:this.rate(v)});
        s.connect(v.inp); s.start(0,rand()*buf.duration); v.loops.push(s); v.tex=s;
      }
      v.state.j=rint(Math.max(1,U.an.iois.length));
    },
    update(v,key){
      if(key==='source'||key==='kind'){v.stop(); v.start()}
      else if(key==='pitch'&&v.tex) v.tex.playbackRate.setTargetAtTime(this.rate(v),ctx.currentTime,0.05);
    },
    schedule(v,t1){
      const U=v.user;
      if(!U||v.p.kind==='texture'||!U[v.p.source].events.length){v.next=t1; return}
      const bank=U[v.p.source].events, io=U.an.iois, vary=v.p.vary, r0=this.rate(v);
      while(v.next<t1){
        const e=pick(bank), g=(e.gain??(U.gains.length?pick(U.gains):0.8))*(1+(rand()-0.5)*vary);
        oneShot(v,e.buf,v.next,0.9*clamp(g,0.02,1.2),r0*(1+(rand()-0.5)*0.12*vary));
        let dt;
        if(v.p.timing==='orig'&&io.length){                  // walk through the measured gaps, keeping their local order
          v.state.j=rand()<0.15?rint(io.length):(v.state.j+1)%io.length; dt=io[v.state.j];
        }else if(v.p.timing==='random') dt=expRand(1/U.an.meanIoi);
        else dt=U.an.meanIoi;
        v.next+=Math.max(0.02,dt/v.p.tempo);
      }
    }
  },
  whisper:{
    /* Source-filter model of a whisper: turbulent noise (no voicing) through the
       vocal tract. The tract is a cascade of peaking filters on top of the noise,
       so formants rise 6-12 dB above a breathy floor, as in real whispers, instead
       of ringing on their own (which is what made the old version sound like a
       creature). A 4th-order high-pass at 450 Hz removes the low growl: whispers
       carry little energy there. Consonants have their own noise paths. */
    build(v){
      const src=loop(v,WHITE);
      v.F=[[500,6,300],[1500,12,250],[2500,10,350],[3700,6,500]].map(([f,g,bw])=>new BiquadFilterNode(ctx,{type:'peaking',frequency:f,gain:g,Q:f/bw}));
      v.vg=gn(0);
      const chain=[bq('highpass',450,0.541),bq('highpass',450,1.307),...v.F,v.vg,bq('lowpass',8000,0.5)];
      const trim=gn(0.6); trim.connect(v.inp);                        // overall level, matched to the other sounds
      chain.reduce((a,n)=>a.connect(n),src).connect(trim);
      v.cons=gn(1); v.cons.connect(trim);                            // consonant noise paths
      v.cf={
        s:[bq('highpass',4000,0.7),bq('bandpass',6500,1.4)],          // "s": 4-9 kHz
        sh:[bq('highpass',1800,0.7),bq('bandpass',3200,1.2)],         // "sh": 2-5 kHz, lip rounding
        f:[bq('highpass',1500,0.5)],                                  // "f": weak and flat
        t:[bq('highpass',3000,0.7)], k:[bq('bandpass',2000,1.5)], p:[bq('lowpass',1500,0.7)],
        breath:[bq('highpass',500,0.7),bq('bandpass',1700,0.6)],     // audible inhale between phrases
        click:[bq('highpass',2500,0.7)]                               // tiny lip/tongue click at word starts
      };
      for(const f of Object.values(v.cf)){f.reduce((a,n)=>a.connect(n)).connect(v.cons); v.nodes.push(...f)}
      v.nodes.push(...chain,v.cons,trim); v.state={syl:0,words:0,phrase:0,wlen:1,widx:0};
    },
    // noise segment with a flat top (fricatives and breaths hold, unlike a decaying burst)
    hiss(v,t,dur,amp,path,att=0.03,rel=0.04){
      const src=new AudioBufferSourceNode(ctx,{buffer:WHITE}), g=gn(0), dest=v.cf[path][0];
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(amp,t+att);
      g.gain.setValueAtTime(amp,Math.max(t+att,t+dur-rel)); g.gain.linearRampToValueAtTime(0,t+dur);
      src.connect(g).connect(dest); src.start(t,rand()*(WHITE.duration-2)); src.stop(t+dur+0.02);
      src.onended=()=>{src.disconnect(); g.disconnect()};
    },
    formants(v,t,f,tau=0.04){
      const k=v.p.tract;
      f.forEach((x,i)=>{v.F[i].frequency.setTargetAtTime(x*k,t,tau)});
    },
    // one consonant starting at t; returns when the vowel may start
    consonant(v,t,c,amp,next){
      const sp=v.p.pace;
      switch(c){
        case 's': case 'sh': case 'f':{
          const d=({s:0.13,sh:0.14,f:0.1})[c]*(0.85+0.3*rand())/sp;
          this.hiss(v,t,d,amp*({s:0.28,sh:0.24,f:0.1})[c],c,0.03,0.035); return t+d*0.8;
        }
        case 'h': v.vg.gain.setTargetAtTime(0.28*amp,t,0.03); return t+0.07/sp;
        case 't': case 'k': case 'p':{                                 // closure, release burst, aspiration
          const tb=t+0.035/sp;
          burst(tb,0.012,0.16*amp,v.cf[c][0],{attack:0.001});
          v.vg.gain.setValueAtTime(0,tb); v.vg.gain.setTargetAtTime(0.3*amp,tb+0.01,0.01);
          return tb+(0.03+0.02*rand())/sp;
        }
        case 'n': case 'm': case 'l': case 'w':{                       // whispered sonorants: faint murmur, then glide
          const mf={n:[300,1500,2400],m:[300,1100,2300],l:[380,1100,2700],w:[330,700,2300]}[c];
          this.formants(v,t,mf,0.015);
          v.vg.gain.setTargetAtTime(0.14*amp,t,0.02);
          return t+0.06/sp;
        }
      }
      return t;
    },
    syllable(v,t,stressed,amp){
      const sp=v.p.pace, vw=wpick(VOWELS).f;
      const onset=wpick(ONSETS)[0], coda=rand()<0.35?wpick(CODAS)[0]:'';
      if(onset==='s'||onset==='sh'||onset==='f'||onset==='t'||onset==='k'||onset==='p') this.formants(v,t,vw,0.03);
      let tv=this.consonant(v,t,onset,amp);
      const vd=(stressed?0.14+rand()*0.07:0.075+rand()*0.05)/sp;
      this.formants(v,tv-0.01,vw,0.045);
      v.vg.gain.setTargetAtTime((stressed?0.62:0.42)*amp*(0.9+0.2*rand()),tv,0.022);
      // slight drift inside the vowel keeps it from sounding static
      this.formants(v,tv+vd*0.5,vw.map(f=>f*(0.97+0.06*rand())),0.08);
      let te=tv+vd;
      v.vg.gain.setTargetAtTime(0,te-0.02,0.03);
      if(coda) te=this.consonant(v,te-0.01,coda,amp*0.8)+(coda==='t'||coda==='k'?0.02:0.04);
      return te;
    },
    schedule(v,t1){
      const s=v.state, sp=v.p.pace;
      while(v.next<t1){
        if(s.syl<=0){                                                  // next word
          if(s.words<=0){                                              // next phrase: pause and breathe in
            if(s.phrase>0){this.hiss(v,v.next+0.15/sp,(0.45+rand()*0.2)/sp,0.05,'breath',0.2,0.15); v.next+=(0.6+rand()*0.5)/sp}
            s.words=4+rint(6); s.phrase=s.words;
          }
          s.wlen=pick([1,1,2,2,2,3,3]); s.syl=s.wlen; s.widx=0; s.stress=rint(Math.min(2,s.wlen)); s.words--;
          if(rand()<0.2) burst(v.next,0.0008,0.05,v.cf.click[0]);        // lips parting
          v.next+=(rand()<0.75?0.01+rand()*0.05:0.1+rand()*0.12)/sp;     // words mostly run together
          continue;
        }
        const decl=1-0.3*(1-s.words/Math.max(1,s.phrase));               // phrases get softer towards the end
        v.next=this.syllable(v,v.next,s.widx===s.stress,decl);
        s.widx++; s.syl--;
      }
    }
  }

};
