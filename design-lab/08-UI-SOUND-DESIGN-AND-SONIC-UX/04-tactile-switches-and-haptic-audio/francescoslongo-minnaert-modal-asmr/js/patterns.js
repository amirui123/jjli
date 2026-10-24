/* Hush: Register pattern and Now playing. Loaded as a classic script; see index.html for the order. */

/* ---------------- Register pattern ----------------
   Record the movement of a slider (sampled at 50 Hz) and loop it onto any
   slider of any sound. Patterns are kept in this browser's localStorage. */
const PDT=0.02, PMAX=3000;                                  // 50 Hz, max 60 s
const PATTERNS=(()=>{try{return JSON.parse(localStorage.getItem('hush.patterns')||'[]')}catch(e){return []}})();
const savePatterns=()=>{try{localStorage.setItem('hush.patterns',JSON.stringify(PATTERNS))}catch(e){}};
const linkSpeed=x=>0.25*Math.pow(16,x);                     // 0.25x .. 4x, log scale
function patternAt(P,pos){                                  // pos in samples, loops, linear interpolation
  const n=P.values.length, x=((pos%n)+n)%n, i=Math.floor(x), f=x-i;
  return P.values[i]+(P.values[(i+1)%n]-P.values[i])*f;
}
function linkValue(L,t){return L.param.min+(L.param.max-L.param.min)*patternAt(L.pat,(t-L.t0)*L.speed/PDT)}
function applyLinks(t){
  for(const L of LINKS.values()){L.param.input.value=linkValue(L,t); L.param.input.dispatchEvent(new Event('input'))}
}
function drawCurve(cvs,values,color){
  const k=window.devicePixelRatio||1, W=Math.round(cvs.clientWidth*k), H=Math.round(cvs.clientHeight*k);
  if(!W||!H) return;
  if(cvs.width!==W||cvs.height!==H){cvs.width=W; cvs.height=H}
  const g=cvs.getContext('2d'); g.clearRect(0,0,W,H);
  if(values.length<2) return;
  const pad=4*k, n=Math.max(values.length-1,1);
  g.strokeStyle=color; g.lineWidth=2*k; g.lineJoin='round'; g.beginPath();
  values.forEach((y,i)=>{const X=i/n*W, Y=pad+(1-y)*(H-2*pad); i?g.lineTo(X,Y):g.moveTo(X,Y)});
  g.stroke();
}
/* Generated patterns. All return n samples in [0,1] that loop seamlessly.
   Periodic shapes are exact functions of the phase; random ones are built periodic
   (random Fourier series, periodic knots) or corrected at the seam (Brownian bridge). */
const gauss=()=>Math.sqrt(-2*Math.log(1-rand()))*Math.cos(2*Math.PI*rand());
const normalize=a=>{let lo=Infinity,hi=-Infinity; for(const x of a){lo=Math.min(lo,x);hi=Math.max(hi,x)} const r=hi-lo||1; return a.map(x=>(x-lo)/r)};
const bridge=a=>{const n=a.length, d=a[n-1]-a[0]; return a.map((x,i)=>x-d*i/(n-1))};   // end meets start
const phases=n=>Array.from({length:n},(_,i)=>i/n);
const GENS={
  sine:    {label:'Sine',          periodic:true, make:(n)=>phases(n).map(u=>0.5-0.5*Math.cos(2*Math.PI*u))},
  triangle:{label:'Triangle',      periodic:true, make:(n)=>phases(n).map(u=>u<0.5?2*u:2-2*u)},
  sawUp:   {label:'Ramp up',       periodic:true, make:(n)=>phases(n)},
  sawDown: {label:'Ramp down',     periodic:true, make:(n)=>phases(n).map(u=>1-u)},
  square:  {label:'Square',        periodic:true, make:(n)=>phases(n).map(u=>u<0.5?1:0)},
  pulse:   {label:'Pulse',         periodic:true, make:(n)=>phases(n).map(u=>u<0.15?1:0)},
  breath:  {label:'Breathing',     periodic:true, make:(n)=>phases(n).map(u=>u<0.4?Math.sin(Math.PI*u/0.8)**2:Math.cos(Math.PI*(u-0.4)/1.2)**2)},  // quick in, slow out
  smooth:  {label:'Smooth random', make:(n,k)=>{            // k random knots on a circle, cosine interpolation
    const K=Math.max(2,k), knots=Array.from({length:K},rand);
    return phases(n).map(u=>{const x=u*K, i=Math.floor(x), f=(1-Math.cos(Math.PI*(x-i)))/2; return knots[i]+(knots[(i+1)%K]-knots[i])*f});
  }},
  steps:   {label:'Random steps',  make:(n,k)=>{            // sample and hold
    const K=Math.max(2,k), lv=Array.from({length:K},rand);
    return phases(n).map(u=>lv[Math.floor(u*K)]);
  }},
  walk:    {label:'Random walk',   make:(n,k)=>{            // Brownian motion, bridged so the loop closes
    const K=Math.max(2,k), w=[0]; for(let i=1;i<=K;i++) w.push(w[i-1]+gauss());
    const b=bridge(w);
    return normalize(phases(n).map(u=>{const x=u*K, i=Math.floor(x); return b[i]+(b[i+1]-b[i])*(x-i)}));
  }},
  pink:    {label:'1/f drift',     make:(n,k)=>{            // random Fourier series, amplitude ∝ 1/√f: periodic by construction
    const K=Math.max(2,k), a=[], ph=[];
    for(let m=1;m<=K;m++){a.push(1/Math.sqrt(m)); ph.push(rand()*2*Math.PI)}
    return normalize(phases(n).map(u=>a.reduce((s,am,m)=>s+am*Math.sin(2*Math.PI*(m+1)*u+ph[m]),0)));
  }},
  ou:      {label:'Ornstein–Uhlenbeck', make:(n,k,len)=>{   // mean-reverting noise, rate θ = k/len
    const th=Math.max(0.2,k/len), sig=0.18*Math.sqrt(2*th), x=[0.5];
    for(let i=1;i<n;i++) x.push(x[i-1]+th*(0.5-x[i-1])*PDT+sig*Math.sqrt(PDT)*gauss());
    return bridge(x).map(v=>clamp(v,0,1));
  }},
  spikes:  {label:'Random bursts', make:(n,k)=>{            // Poisson events with exponential decay, wrapped around the loop
    const out=new Array(n).fill(0), tau=Math.round(0.15/PDT), m=Math.max(1,k);
    for(let e=0;e<m;e++){
      const t0=Math.floor(rand()*n), h=0.4+0.6*rand();
      for(let j=0;j<6*tau;j++){const idx=(t0+j)%n; out[idx]=Math.max(out[idx],h*Math.exp(-j/tau))}
    }
    return out;
  }}
};
const genLen=x=>0.5*Math.pow(120,x);      // 0.5 .. 60 s
const genRate=x=>0.2*Math.pow(50,x);      // 0.2 .. 10 changes per second

function buildPatternPanel(){
  const take=el('canvas',{className:'take'});
  take.setAttribute('aria-label','Recorded movement');
  const pad=el('input',{type:'range',min:0,max:1,step:0.001,value:0.5,className:'pad'});
  pad.setAttribute('aria-label','Pattern slider');
  const recBtn=el('button',{className:'btn',textContent:'Record'});
  const recMsg=el('span',{className:'note',textContent:'Press Record, then move the slider. Press Stop when done.'});
  // generator controls
  const gShape=el('select');
  const gP=el('optgroup',{label:'Periodic'}), gR=el('optgroup',{label:'Random'});
  for(const [k,G] of Object.entries(GENS)) (G.periodic?gP:gR).append(new Option(G.label,k));
  gShape.append(gP,gR);
  const gSlider=(label,x,fmt)=>{
    const r=el('input',{type:'range',min:0,max:1,step:0.005,value:x}), o=el('b',{textContent:fmt(x)});
    r.addEventListener('input',()=>o.textContent=fmt(+r.value));
    return {r,box:el('label',{className:'ctrl'},el('span',{},label,o),r)};
  };
  const gLen=gSlider('Length',Math.log(4/0.5)/Math.log(120),x=>genLen(x).toFixed(1)+' s');
  const gRate=gSlider('Changes per second',Math.log(1/0.2)/Math.log(50),x=>genRate(x).toFixed(1));
  const gLo=gSlider('Lowest',0,x=>Math.round(x*100)+'%'), gHi=gSlider('Highest',1,x=>Math.round(x*100)+'%');
  const genBtn=el('button',{className:'btn',textContent:'Generate'});
  const syncGen=()=>{const per=!!GENS[gShape.value]?.periodic; gRate.box.style.opacity=per?0.4:1; gRate.r.disabled=per;
    gLen.box.firstChild.firstChild.textContent=per?'Period':'Length'};
  gShape.addEventListener('change',syncGen);
  const plist=el('ul',{className:'plist'}), pEmpty=el('p',{className:'empty',textContent:'No patterns yet.'});
  const selPat=el('select'), selSound=el('select'), selKey=el('select');
  const spd=el('input',{type:'range',min:0,max:1,step:0.01,value:0.5}), spdOut=el('b',{textContent:'1.00×'});
  const applyBtn=el('button',{className:'btn',textContent:'Apply'});
  const nowList=el('div'), nowEmpty=el('p',{className:'empty',textContent:'Nothing is switched on.'});
  const stopAll=el('button',{className:'btn',textContent:'Stop all patterns'});
  stopAll.addEventListener('click',()=>{[...LINKS.keys()].forEach(unlink); renderLinks()});
  const allOff=el('button',{className:'btn',textContent:'Turn everything off'});
  allOff.addEventListener('click',()=>voices.forEach(v=>{if(v.p.on){v.ui.sw.checked=false; v.ui.sw.dispatchEvent(new Event('change'))}}));
  const nowActions=el('div',{className:'np-actions'},allOff,stopAll);
  sectionOf.now.append(nowEmpty,nowList,nowActions);
  const lab=(t,...kids)=>el('label',{className:'ctrl'},t,...kids);
  const spdLab=el('label',{className:'ctrl'},el('span',{},'Speed',spdOut),spd);

  const panel=el('article',{className:'src pattern'},
    el('div',{className:'src-head'},el('span',{className:'dot',style:'background:var(--lilac)'}),el('h2',{textContent:'Register pattern'})),
    el('div',{className:'body'},
      take,pad,el('div',{className:'row'},recBtn,recMsg),
      el('h3',{textContent:'Or generate one'}),
      el('div',{className:'ctrls',style:'margin-left:0'},el('label',{className:'ctrl'},'Shape',gShape),gLen.box,gRate.box,gLo.box,gHi.box),
      el('div',{className:'row',style:'margin-top:12px'},genBtn),
      el('h3',{textContent:'Saved patterns'}),pEmpty,plist,
      el('h3',{textContent:'Use a pattern'}),
      el('div',{className:'ctrls',style:'margin-left:0'},lab('Pattern',selPat),lab('Sound',selSound),lab('Setting',selKey),spdLab),
      el('div',{className:'row',style:'margin-top:12px'},applyBtn)));
  sectionOf.patterns.append(panel);

  // ----- recording
  let rec=null;
  const stopRec=()=>{
    clearInterval(rec.timer);
    const vals=rec.values; rec=null;
    recBtn.textContent='Record'; recBtn.classList.remove('rec');
    if(vals.length<10){recMsg.textContent='Too short, nothing saved. Try again.'; return}
    addPattern(vals,'Pattern');
  };
  function addPattern(vals,base){
    const num=1+PATTERNS.reduce((m,P)=>{
      const rest=P.name.startsWith(base+' ')?P.name.slice(base.length+1):'';
      return /^\d+$/.test(rest)?Math.max(m,+rest):m;
    },0);
    const P={id:Date.now().toString(36)+rint(1e6).toString(36),name:base+' '+num,values:vals.map(x=>Math.round(x*1000)/1000)};
    PATTERNS.push(P); savePatterns(); renderPatterns(); selPat.value=P.id;
    drawCurve(take,P.values,'#B9A3E3');
    recMsg.textContent=`Saved "${P.name}", ${(vals.length*PDT).toFixed(1)} s.`;
  }
  genBtn.addEventListener('click',()=>{
    const G=GENS[gShape.value], len=genLen(+gLen.r.value), n=Math.min(PMAX,Math.max(10,Math.round(len/PDT)));
    const k=Math.round(genRate(+gRate.r.value)*n*PDT);
    const lo=+gLo.r.value, hi=+gHi.r.value;
    addPattern(G.make(n,k,n*PDT).map(v=>lo+(hi-lo)*v),G.label);
  });
  syncGen();
  recBtn.addEventListener('click',()=>{
    if(rec){stopRec(); return}
    rec={armed:true,values:[]}; drawCurve(take,[],'');
    recBtn.textContent='Stop'; recBtn.classList.add('rec');
    recMsg.textContent='Move the slider to start recording…';
  });
  pad.addEventListener('input',()=>{
    if(!rec||!rec.armed) return;
    rec.armed=false;                                          // recording starts on the first movement
    const sample=()=>{
      rec.values.push(+pad.value); drawCurve(take,rec.values,'#B9A3E3');
      recMsg.textContent=`Recording… ${(rec.values.length*PDT).toFixed(1)} s`;
      if(rec.values.length>=PMAX) stopRec();
    };
    rec.timer=setInterval(sample,PDT*1000); sample();
  });

  // ----- saved patterns
  function renderPatterns(){
    const keep=selPat.value;
    plist.replaceChildren(); selPat.replaceChildren();
    pEmpty.hidden=PATTERNS.length>0;
    for(const P of PATTERNS){
      const c=el('canvas'), name=el('input',{type:'text',value:P.name});
      name.setAttribute('aria-label','Pattern name');
      name.addEventListener('change',()=>{P.name=name.value.trim()||P.name; savePatterns(); renderPatterns(); renderLinks()});
      const del=el('button',{className:'btn',textContent:'Delete'});
      del.addEventListener('click',()=>{
        for(const [k,L] of LINKS) if(L.pat===P) unlink(k);
        PATTERNS.splice(PATTERNS.indexOf(P),1); savePatterns(); renderPatterns(); renderLinks();
      });
      plist.append(el('li',{},c,name,el('span',{className:'note',textContent:(P.values.length*PDT).toFixed(1)+' s'}),del));
      requestAnimationFrame(()=>drawCurve(c,P.values,'#B9A3E3'));
      selPat.append(new Option(P.name,P.id,false,P.id===keep));
    }
    applyBtn.disabled=!PATTERNS.length;
  }

  // ----- targets
  voices.forEach(v=>selSound.append(new Option(v.def.name,v.def.id)));
  const fillKeys=()=>{
    selKey.replaceChildren();
    PARAMS.filter(q=>q.v.def.id===selSound.value).forEach(q=>selKey.append(new Option(q.label,q.key)));
  };
  selSound.addEventListener('change',fillKeys); fillKeys();
  spd.addEventListener('input',()=>spdOut.textContent=linkSpeed(+spd.value).toFixed(2)+'×');

  onPlaceByHand=v=>{
    const had=['angle','dist'].map(key=>v.def.id+'.'+key).filter(k=>LINKS.has(k));
    had.forEach(unlink); if(had.length) renderLinks();
  };
  function unlink(k){
    const L=LINKS.get(k); if(!L) return;
    LINKS.delete(k); L.param.el.classList.remove('driven'); L.param.v.posDirty=true;
  }
  function linkPattern(pat,param,speed){
    const k=param.v.def.id+'.'+param.key; unlink(k);
    const L={pat,param,speed,t0:ctx?ctx.currentTime:0};
    LINKS.set(k,L); param.el.classList.add('driven');
    if(param.key==='speed') param.v.retime();
    applyLinks(L.t0); renderLinks();
  }
  applyBtn.addEventListener('click',()=>{
    const pat=PATTERNS.find(P=>P.id===selPat.value);
    const param=PARAMS.find(q=>q.v.def.id===selSound.value&&q.key===selKey.value);
    if(!pat||!param) return;
    linkPattern(pat,param,linkSpeed(+spd.value));
  });
  // used by scenes
  PATTERN_API.link=linkPattern;
  PATTERN_API.unlinkWhere=test=>{let n=0; for(const [k,L] of [...LINKS]) if(test(L)){unlink(k); n++} if(n) renderLinks()};
  PATTERN_API.importPattern=(name,values)=>{
    const same=PATTERNS.find(P=>P.values.length===values.length&&P.values.every((x,i)=>Math.abs(x-values[i])<0.006));
    if(same) return same;
    let nm=name, i=2; while(PATTERNS.some(P=>P.name===nm)) nm=`${name} ${i++}`;
    const P={id:Date.now().toString(36)+rint(1e6).toString(36),name:nm,values:values.map(x=>Math.round(x*1000)/1000)};
    PATTERNS.push(P); savePatterns(); renderPatterns();
    return P;
  };
  // One block per sound that is on: volume, off switch, and the patterns driving it
  function patternRow(k,L){
    const c=el('canvas'), head=el('div',{className:'head'}), now=el('span',{className:'now'});
    const meta=el('div',{className:'meta'},el('b',{textContent:L.pat.name}),el('br'),`${L.param.label}: `,now);
    const x0=Math.log(L.speed/0.25)/Math.log(16);
    const sp=el('input',{type:'range',min:0,max:1,step:0.01,value:x0}), spOut=el('b',{textContent:L.speed.toFixed(2)+'×'});
    sp.addEventListener('input',()=>{                 // change speed without jumping in the loop
      const t=ctx?ctx.currentTime:0, ns=linkSpeed(+sp.value);
      L.t0=t-(t-L.t0)*L.speed/ns; L.speed=ns; spOut.textContent=ns.toFixed(2)+'×';
    });
    const rm=el('button',{className:'btn',textContent:'Remove'});
    rm.addEventListener('click',()=>{unlink(k); renderLinks()});
    L.ui={head,now};
    requestAnimationFrame(()=>drawCurve(c,L.pat.values,L.param.v.def.color));
    return el('li',{},el('div',{className:'curve'},c,head),meta,el('label',{className:'ctrl'},el('span',{},'Speed',spOut),sp),rm);
  }
  function renderLinks(){
    nowList.replaceChildren();
    const on=voices.filter(v=>v.p.on);
    nowEmpty.hidden=on.length>0; allOff.hidden=!on.length; stopAll.hidden=LINKS.size===0;
    for(const v of on){
      const d=v.def;
      const name=el('button',{className:'np-name',textContent:d.name,title:'Show its settings'});
      name.addEventListener('click',()=>{
        showSection(d.group); v.ui.settings.open=true;
        v.ui.box.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
      });
      const vol=el('input',{type:'range',min:0,max:1,step:0.01,value:v.p.vol});
      vol.setAttribute('aria-label',d.name+' volume');
      vol.addEventListener('input',()=>setSlider(v,'vol',vol.value));
      v.ui.nowVol=vol;
      const off=el('button',{className:'btn',textContent:'Off'});
      off.addEventListener('click',()=>{v.ui.sw.checked=false; v.ui.sw.dispatchEvent(new Event('change'))});
      const rows=[...LINKS].filter(([,L])=>L.param.v===v);
      const block=el('div',{className:'np'},
        el('div',{className:'np-head'},el('span',{className:'dot',style:`background:${d.color}`}),name,el('div',{className:'vol'},vol),off));
      if(rows.length) block.append(el('ul',{className:'playing'},...rows.map(([k,L])=>patternRow(k,L))));
      nowList.append(block);
    }
    for(const v of voices) if(!v.p.on) v.ui.nowVol=null;
    updateCounts();
    updatePlaying();
  }
  renderNow=renderLinks;


  renderPatterns(); renderLinks();
  new ResizeObserver(()=>{if(rec) return; renderPatterns()}).observe(plist);
}
buildPatternPanel();
showSection('now');

// Help dialog (native <dialog>: Escape closes it, focus stays inside while open)
{
  const dlg=document.getElementById('help'), open=document.getElementById('helpBtn');
  open.addEventListener('click',()=>dlg.showModal());
  document.getElementById('helpClose').addEventListener('click',()=>dlg.close());
  dlg.addEventListener('click',e=>{if(e.target===dlg) dlg.close()});          // click on the backdrop
  dlg.addEventListener('close',()=>open.focus());
}
