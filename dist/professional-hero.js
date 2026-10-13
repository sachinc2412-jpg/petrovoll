// One continuous image plane, expanded through transforms, then revealed through type.
(()=>{
 const sequence=document.querySelector('.hero-sequence');if(!sequence)return;
 const pin=sequence.querySelector('.hero-pin'),photo=pin.querySelector('.hero-motion-photo'),image=photo.querySelector(':scope > img'),finish=pin.querySelector('.hero-mask-finish'),copy=pin.querySelector('.hero-copy'),figure=pin.querySelector('.hero-image');
 const svg=pin.querySelector('.hero-mask-svg'),field=pin.querySelector('.hero-mask-field'),maskText=pin.querySelector('.hero-mask-text'),outline=pin.querySelector('.hero-mask-outline'),caption=pin.querySelector('.hero-mask-caption'),dock=photo.querySelector('.hero-product-focus');
 const media=matchMedia('(prefers-reduced-motion: reduce)'),clamp=v=>Math.max(0,Math.min(1,v));
 const ease=v=>{v=clamp(v);return v*v*v*(v*(v*6-15)+10)},phase=(p,a,b)=>ease((p-a)/(b-a));
 let frame=0,geometry=null,current=0,target=0,lastTime=0;
 function reset(){sequence.classList.remove('motion-ready');copy.inert=false;copy.style.opacity='';copy.style.transform='';figure.style.opacity='';geometry=null;cancelAnimationFrame(frame);frame=0;lastTime=0;}
 function measure(){
  if(media.matches){reset();return;}
  sequence.classList.add('motion-ready');
  const a=pin.getBoundingClientRect(),b=figure.getBoundingClientRect();
  const sourceWidth=image.naturalWidth||1672,sourceHeight=image.naturalHeight||941;
  const fullScale=Math.min(a.width/sourceWidth,a.height/sourceHeight),startScale=Math.min(b.width/sourceWidth,b.height/sourceHeight);
  geometry={top:b.top-a.top,left:b.left-a.left,right:a.right-b.right,bottom:a.bottom-b.bottom,width:a.width,height:a.height,scale:startScale/fullScale,dx:b.left+b.width/2-a.left-a.width/2,dy:b.top+b.height/2-a.top-a.height/2,radius:parseFloat(getComputedStyle(figure).borderTopLeftRadius)||0};
  const height=1600*a.height/a.width;svg.setAttribute('viewBox',`0 0 1600 ${height}`);pin.querySelector('.hero-mask-image').setAttribute('preserveAspectRatio','xMidYMid meet');
  for(const selector of ['#hero-brand-mask','.hero-mask-field','.hero-mask-image'])pin.querySelector(selector).setAttribute('height',height);
  geometry.svgHeight=height;for(const el of [maskText,outline]){el.setAttribute('y',height*.5+77);el.setAttribute('font-size','225');}
  readTarget();current=target;render(current);schedule();
 }
 function readTarget(){if(!geometry)return;const r=sequence.getBoundingClientRect();target=clamp((72-r.top)/Math.max(1,r.height-pin.offsetHeight));}
 function render(p){
  const g=geometry,expand=phase(p,.035,.46),leave=phase(p,.015,.22),reveal=phase(p,.53,.89),entry=phase(p,.47,.53),settle=phase(p,.87,.97);
  photo.style.clipPath=`inset(${g.top*(1-expand)}px ${g.right*(1-expand)}px ${g.bottom*(1-expand)}px ${g.left*(1-expand)}px round ${g.radius*(1-expand)}px)`;
  image.style.transform=`translate3d(${g.dx*(1-expand)}px,${g.dy*(1-expand)}px,0) scale(${g.scale+(1-g.scale)*expand})`;
  copy.style.opacity=1-leave;copy.style.transform=`translate3d(0,${-18*leave}px,0)`;copy.inert=leave>.95;figure.style.opacity=1-leave;
  dock.style.left=`${g.left+24}px`;dock.style.bottom=`${g.bottom+22}px`;dock.style.opacity=1-phase(p,.015,.18);
  finish.style.opacity=entry;field.style.opacity=1-reveal;
  const scale=1+1.6*(1-reveal),cx=800,cy=g.svgHeight*.5;
  const transform=`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`;
  maskText.setAttribute('transform',transform);outline.setAttribute('transform',transform);outline.style.opacity=.07*Math.sin(reveal*Math.PI);
  caption.style.opacity=settle;caption.style.transform=`translate3d(0,${10*(1-settle)}px,0)`;
 }
 function tick(time){frame=0;if(!geometry||media.matches||document.hidden)return;const dt=lastTime?Math.min(48,time-lastTime):16;lastTime=time;
  current+=(target-current)*(1-Math.exp(-dt/65));if(Math.abs(target-current)<.0002)current=target;
  render(current);if(current!==target)frame=requestAnimationFrame(tick);else lastTime=0;
 }
 function schedule(){if(!frame&&!document.hidden&&geometry)frame=requestAnimationFrame(tick);}
 addEventListener('scroll',()=>{readTarget();schedule()},{passive:true});addEventListener('resize',measure,{passive:true});media.addEventListener('change',measure);
 document.addEventListener('visibilitychange',()=>{lastTime=0;if(!document.hidden){readTarget();schedule();}else{cancelAnimationFrame(frame);frame=0;}});
 new ResizeObserver(measure).observe(figure);image.addEventListener('load',measure);document.fonts.ready.then(measure);measure();
})();
