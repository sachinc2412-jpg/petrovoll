// Web-native spring motion: transform-only, short, and responsive to reduced-motion.
(()=>{
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const spring=Array.from({length:41},(_,i)=>{const t=i/40;return {offset:t,position:i===40?1:1-Math.exp(-8*t)*Math.cos(9*t)}});
 const tabs=document.querySelector('.application-tabs');
 const pill=document.createElement('span');pill.className='application-pill';pill.setAttribute('aria-hidden','true');tabs.prepend(pill);
 let lastLeft=0,lastWidth=0,pillAnimation;
 function place(animate=false){const selected=tabs.querySelector('[aria-selected=true]');if(!selected)return;const left=selected.offsetLeft,width=selected.offsetWidth;pillAnimation?.cancel();
  pill.style.width=width+'px';pill.style.transform=`translateX(${left}px)`;
  if(animate&&!media.matches&&lastWidth){pillAnimation=pill.animate(spring.map(k=>({offset:k.offset,transform:`translateX(${lastLeft+(left-lastLeft)*k.position}px) scaleX(${(lastWidth+(width-lastWidth)*k.position)/width})`,transformOrigin:'left'})),{duration:550,easing:'linear'});}
  lastLeft=left;lastWidth=width;
 }
 tabs.addEventListener('click',()=>place(true));tabs.addEventListener('keydown',()=>requestAnimationFrame(()=>place(true)));
 new ResizeObserver(()=>place()).observe(tabs);document.fonts.ready.then(()=>place());place();
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){if(!media.matches)e.target.animate(spring.map(k=>({offset:k.offset,opacity:Math.min(1,.55+k.offset*2),transform:`translateY(${14*(1-k.position)}px)`})),{duration:680,easing:'linear'});observer.unobserve(e.target)}},{threshold:.13});
 document.querySelectorAll('.section-heading,.material-figure,.about-introduction,.product-card,.specification-desk,.application-explorer,.network-map-shell,.partnership').forEach(el=>observer.observe(el));
 if(matchMedia('(hover: hover) and (pointer: fine)').matches){document.querySelectorAll('.product-card').forEach(card=>{let frame=0,x=.5,y=.3;card.addEventListener('pointermove',e=>{if(media.matches)return;const r=card.getBoundingClientRect();x=(e.clientX-r.left)/r.width;y=(e.clientY-r.top)/r.height;if(!frame)frame=requestAnimationFrame(()=>{frame=0;card.style.setProperty('--pointer-x',x*100+'%');card.style.setProperty('--pointer-y',y*100+'%');card.style.setProperty('--turn-y',(x-.5)*7+'deg');card.style.setProperty('--turn-x',-(y-.5)*5+'deg')})});card.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);frame=0;for(const name of ['--pointer-x','--pointer-y','--turn-y','--turn-x'])card.style.removeProperty(name)})});}
 const nav=[...document.querySelectorAll('#main-nav a')];
 const active=new IntersectionObserver(entries=>{const e=entries.find(e=>e.isIntersecting);if(e)nav.forEach(a=>{if(a.hash==='#'+e.target.id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')})},{rootMargin:'-15% 0px -55% 0px'});document.querySelectorAll('main>section[id]').forEach(section=>active.observe(section));
})();
