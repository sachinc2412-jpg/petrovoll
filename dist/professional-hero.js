// A single, event-driven photo-to-Petrovöll mask transition.
(()=>{
 const sequence=document.querySelector('.hero-sequence'),pin=sequence.querySelector('.hero-pin');
 const photo=pin.querySelector('.hero-motion-photo'),finish=pin.querySelector('.hero-mask-finish'),copy=pin.querySelector('.hero-copy'),figure=pin.querySelector('.hero-image');
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=v=>Math.max(0,Math.min(1,v));const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
 let frame=0,geometry=null;
 function measure(){
  if(media.matches){sequence.classList.remove('motion-ready');copy.inert=false;copy.style.opacity='';figure.style.opacity='';return;}
  sequence.classList.add('motion-ready');
  const a=pin.getBoundingClientRect(),b=figure.getBoundingClientRect();
  geometry={top:b.top-a.top,left:b.left-a.left,right:a.right-b.right,bottom:a.bottom-b.bottom,width:a.width,height:a.height};
  const height=Math.round(1600*a.height/Math.max(1,a.width));
  pin.querySelector('.hero-mask-svg').setAttribute('viewBox',`0 0 1600 ${height}`);
  pin.querySelector('.hero-mask-image').setAttribute('preserveAspectRatio','xMidYMid meet');
  for(const selector of ['#hero-brand-mask','.hero-mask-field','.hero-mask-image']){const el=pin.querySelector(selector);el.setAttribute('height',height);}
  for(const text of pin.querySelectorAll('.hero-mask-text,.hero-mask-outline')){text.setAttribute('y',height*.52+75);text.setAttribute('font-size','225');}
  schedule();
 }
 function update(){frame=0;if(!geometry||media.matches)return;
  const header=72,r=sequence.getBoundingClientRect();
  const p=clamp((header-r.top)/Math.max(1,r.height-pin.offsetHeight)),expand=ease((p-.08)/.38),leave=ease((p-.05)/.27);
  photo.style.inset=`${geometry.top*(1-expand)}px ${geometry.right*(1-expand)}px ${geometry.bottom*(1-expand)}px ${geometry.left*(1-expand)}px`;
  photo.style.borderRadius=`${24*(1-expand)}px`;copy.style.opacity=1-leave;copy.inert=leave>.9;figure.style.opacity=1-leave;
  const entry=ease((p-.46)/.09),resolve=ease((p-.55)/.35);
  finish.style.opacity=entry;pin.querySelector('.hero-mask-field').style.opacity=1-resolve;pin.querySelector('.hero-mask-outline').style.opacity=(1-resolve)*.5;pin.querySelector('.hero-mask-caption').style.opacity=ease((p-.82)/.15);
 }
 function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update)}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});media.addEventListener('change',measure);document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
 new ResizeObserver(measure).observe(figure);document.fonts.ready.then(measure);measure();
})();
