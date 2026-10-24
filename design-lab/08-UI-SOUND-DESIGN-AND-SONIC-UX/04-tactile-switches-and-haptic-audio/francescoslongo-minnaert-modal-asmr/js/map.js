/* Hush: Head map: drawing and dragging. Loaded as a classic script; see index.html for the order. */

/* ---------------- head map ---------------- */
// Redrawn every frame only while audio runs; otherwise only after a change.
const cv=document.getElementById('map'), g2=cv.getContext('2d');
let rafId=0;
function requestDraw(){ if(!rafId) rafId=requestAnimationFrame(frame) }
function updatePlaying(){
  const t=ctx?ctx.currentTime:0;
  for(const L of LINKS.values()){
    if(!L.ui) continue;
    const n=L.pat.values.length, x=((((t-L.t0)*L.speed/PDT)%n)+n)%n;
    L.ui.head.style.left=(x/n*100)+'%';
    L.ui.now.textContent=L.param.el.querySelector('b')?.textContent??'';
  }
}
function frame(){
  rafId=0; draw(); updatePlaying();
  if(ctx&&ctx.state==='running') requestDraw();
}
function fitCanvas(){
  const px=Math.round(cv.clientWidth*(window.devicePixelRatio||1));
  if(px>0&&cv.width!==px){cv.width=cv.height=px; requestDraw()}
}
new ResizeObserver(fitCanvas).observe(cv);
function mapGeom(){const W=cv.width; return {W,u:W/720,C:W/2,R:W*0.44}}   // u: scale for fixed sizes
function screenPos(v,t,G){
  const q=v.pos(t), r=G.R*Math.sqrt(Math.min(q.d,2.5)/2.5), k=r/q.d;    // square-root distance scale
  return {x:G.C+q.x*k,y:G.C+q.z*k};
}
let dragV=null, hoverV=null;
function draw(){
  const G=mapGeom(), {W,u,C,R}=G, t=ctx?ctx.currentTime:0;
  g2.clearRect(0,0,W,W);
  g2.strokeStyle='rgba(138,155,165,.18)'; g2.lineWidth=1.5*u;
  [0.25,0.5,1,2.5].forEach(m=>{g2.beginPath(); g2.arc(C,C,R*Math.sqrt(m/2.5),0,7); g2.stroke()});
  // head, nose (front = up), ears
  g2.fillStyle='#E6E1D3';
  g2.beginPath(); g2.moveTo(C-10*u,C-30*u); g2.lineTo(C,C-46*u); g2.lineTo(C+10*u,C-30*u); g2.fill();
  g2.beginPath(); g2.ellipse(C-33*u,C,7*u,13*u,0,0,7); g2.fill();
  g2.beginPath(); g2.ellipse(C+33*u,C,7*u,13*u,0,0,7); g2.fill();
  g2.beginPath(); g2.arc(C,C,34*u,0,7); g2.fill();
  let label=null;
  for(const v of voices){
    if(!v.p.on) continue;
    if(v.p.spread==='wide'){g2.strokeStyle=v.def.color+'55'; g2.lineWidth=14*u; g2.beginPath(); g2.arc(C,C,R*0.97,0,7); g2.stroke(); continue}
    const {x,y}=screenPos(v,t,G), big=v===dragV||v===hoverV;
    g2.fillStyle=v.def.color+(big?'55':'33'); g2.beginPath(); g2.arc(x,y,(big?30:26)*u,0,7); g2.fill();
    g2.fillStyle=v.def.color; g2.beginPath(); g2.arc(x,y,11*u,0,7); g2.fill();
    if(big) label={v,x,y};
  }
  if(label){
    const {v,x,y}=label, text=v.def.name, left=x>C;
    g2.font=`500 ${14*u}px system-ui,sans-serif`; g2.fillStyle='#E6E1D3';
    g2.textAlign=left?'right':'left'; g2.textBaseline='middle';
    g2.fillText(text,x+(left?-36:36)*u,y);
    g2.textAlign='left';
  }
}

/* Dragging a dot places that sound: its Direction and Distance sliders follow the pointer.
   A moving sound switches to "Still", and patterns on its position are removed. */
const toCanvas=e=>{const b=cv.getBoundingClientRect(); return {x:(e.clientX-b.left)*cv.width/b.width,y:(e.clientY-b.top)*cv.height/b.height}};
function hitDot(p){
  const G=mapGeom(), t=ctx?ctx.currentTime:0; let best=null, bd=32*G.u;
  for(const v of voices){
    if(!v.p.on||v.p.spread==='wide') continue;
    const s=screenPos(v,t,G), d=Math.hypot(s.x-p.x,s.y-p.y);
    if(d<=bd){best=v; bd=d}                            // nearest, later (top-most) dots win ties
  }
  return best;
}
function setSlider(v,key,val){
  const q=PARAMS.find(x=>x.v===v&&x.key===key);
  q.input.value=val; q.input.dispatchEvent(new Event('input'));
}
function placeAt(v,p){
  const G=mapGeom(), dx=p.x-G.C, dy=p.y-G.C, r=Math.min(Math.hypot(dx,dy),G.R);
  setSlider(v,'angle',Math.round(Math.atan2(dx,-dy)*180/Math.PI));      // 0 = front, +90 = right
  setSlider(v,'dist',Math.max(0.12,2.5*(r/G.R)**2).toFixed(2));          // inverse of the square-root scale
}
cv.addEventListener('pointerdown',e=>{
  const v=hitDot(toCanvas(e)); if(!v) return;
  e.preventDefault(); dragV=v; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing';
  if(v.p.mode!=='static'){const m=SELECTS.find(x=>x.v===v&&x.key==='mode'); m.s.value='static'; m.s.dispatchEvent(new Event('change'))}
  onPlaceByHand?.(v);
  placeAt(v,toCanvas(e));
});
cv.addEventListener('pointermove',e=>{
  const p=toCanvas(e);
  if(dragV){placeAt(dragV,p); return}
  const h=hitDot(p);
  if(h!==hoverV){hoverV=h; cv.style.cursor=h?'grab':''; requestDraw()}
});
const endDrag=()=>{if(!dragV) return; dragV=null; cv.style.cursor=hoverV?'grab':''; requestDraw()};
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',endDrag);
cv.addEventListener('pointerleave',()=>{if(!dragV&&hoverV){hoverV=null; cv.style.cursor=''; requestDraw()}});
fitCanvas(); requestDraw();
