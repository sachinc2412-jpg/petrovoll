const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:600px)'),journey=document.querySelector('.performance-journey'),pause=journey.querySelector('.journey-pause');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const routes=new Map([...journey.querySelectorAll('path[id^="journey-"]')].map(path=>[path.id,{path,length:path.getTotalLength()}]));
const travelers=[...journey.querySelectorAll('.journey-traffic')].map(el=>({el,route:routes.get(el.dataset.route||'journey-route'),speed:Number(el.dataset.speed),offset:Number(el.dataset.offset),reverse:el.dataset.reverse==='true'}));
const chapters=[...journey.querySelectorAll('.journey-chapter')].map(el=>({el,p:0,initialized:false,painted:NaN})),nav=[...journey.querySelectorAll('[data-journey-jump]')],navigation=journey.querySelector('.journey-navigation');
for(let i=0;i<2;i++){const img=document.createElement('img');img.src=i?'assets/road-truck-top.webp':'assets/road-car-top.webp';img.alt='';img.className='mobile-traffic'+(i?' mobile-truck':'');img.hidden=!mobile.matches;journey.querySelector('.journey-road').append(img);}
const mobileCars=[...journey.querySelectorAll('.mobile-traffic')];
let visible=false,paused=false,frame=0,last=0,elapsed=0,scrollTravel=0,justEntered=true,active=-1,gearVisible=false,gearRender=null,gearLoading=false,gearFailed=false,pointer={x:0,y:0};
const gear=document.querySelector('.gear-live'),canvas=document.querySelector('#live-gear-canvas');
function traffic(rect){const scaleY=rect.height/3860;for(const t of travelers){const position=(t.offset*t.route.length+elapsed*t.speed+scrollTravel)%t.route.length,distance=t.reverse?t.route.length-position:position,lane=t.reverse?-17:17,p=t.route.path.getPointAtLength(distance),q=t.route.path.getPointAtLength(Math.min(t.route.length,distance+1)),angle=Math.atan2(q.y-p.y,q.x-p.x);t.el.style.transform=`translate(${p.x-Math.sin(angle)*lane}px,${p.y+Math.cos(angle)*lane}px) rotate(${angle*180/Math.PI+(t.reverse?270:90)}deg)`;}
 mobileCars.forEach((el,i)=>{el.hidden=!mobile.matches;const span=Math.max(1,rect.height-690),distance=(elapsed*(i?60:80)+scrollTravel+i*1000)%span;el.style.transform=`translateY(${640+distance}px)`;});}
function paint(time,dt=16){
 // Measure every visible scene before writing transforms, avoiding layout read/write cycles.
 const rect=journey.getBoundingClientRect(),boxes=visible?chapters.map(c=>c.el.getBoundingClientRect()):[],gearBox=gearVisible?gear.getBoundingClientRect():null;
 const blend=1-Math.exp(-dt/150);
 if(visible){const target=Math.max(0,-rect.top)*.4;if(justEntered){scrollTravel=target;justEntered=false;}else scrollTravel+=(target-scrollTravel)*blend;
  if(!paused&&!reduced.matches)traffic(rect);
  const viewportCenter=innerHeight*.46;let nearest=0,nearestDistance=Infinity;
  boxes.forEach((box,i)=>{const center=box.top+box.height*.5,distance=Math.abs(viewportCenter-center);if(distance<nearestDistance){nearest=i;nearestDistance=distance;}});
  if(nearest!==active){active=nearest;nav.forEach((button,i)=>{if(i===active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});}
  const chapterStart=boxes[0].top,chapterEnd=boxes.at(-1).bottom;navigation.style.setProperty('--journey-progress',clamp((viewportCenter-chapterStart)/(chapterEnd-chapterStart)));
  if(!reduced.matches&&!paused){const entryProgress=clamp(scrollTravel/.4/860,-.25,1);journey.style.setProperty('--factory-lift',`${entryProgress*-28}px`);journey.style.setProperty('--origin-lift',`${entryProgress*-58}px`);
   for(let i=0;i<chapters.length;i++){const chapter=chapters[i],box=boxes[i];if(box.bottom<-80||box.top>innerHeight+80){chapter.initialized=false;continue;}
    const target=clamp((innerHeight*.5-(box.top+box.height*.5))/innerHeight,-.7,.7);if(!chapter.initialized){chapter.p=target;chapter.initialized=true;}else chapter.p+=(target-chapter.p)*blend;
    if(Math.abs(chapter.p-chapter.painted)<.0008)continue;chapter.painted=chapter.p;const p=chapter.p;
    chapter.el.style.setProperty('--copy-y',`${p*-18}px`);chapter.el.style.setProperty('--art-y',`${p*-46}px`);chapter.el.style.setProperty('--art-x',`${p*8}px`);chapter.el.style.setProperty('--vehicle-x',`${p*(i===1?62:-62)}px`);chapter.el.style.setProperty('--bottle-one',`${p*-16}px`);chapter.el.style.setProperty('--bottle-two',`${p*-32}px`);chapter.el.style.setProperty('--bottle-three',`${p*-48}px`);
   }
  }
 }
 if(gearBox&&gearRender)gearRender(time,clamp(1-gearBox.top/innerHeight,.6,.95),pointer,paused||reduced.matches);
}
function running(){return !document.hidden&&!paused&&!reduced.matches&&(visible||gearVisible&&gearRender);}
function tick(time){frame=0;if(!running())return;const dt=last?Math.min(50,time-last):16;last=time;elapsed+=dt/1000;paint(time,dt);frame=requestAnimationFrame(tick);}
function sync(){last=0;if(running()&&!frame)frame=requestAnimationFrame(tick);else if(!running()&&frame){cancelAnimationFrame(frame);frame=0;}pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Play road animation':'Pause road animation');pause.innerHTML=paused?'▷ <span>Play motion</span>':'Ⅱ <span>Pause motion</span>';if(reduced.matches)paint(performance.now());}
pause.addEventListener('click',()=>{paused=!paused;sync()});new IntersectionObserver(entries=>{const next=entries[0].isIntersecting;if(next&&!visible)justEntered=true;visible=next;sync()},{threshold:0}).observe(journey);
async function loadGear(){if(gearLoading||gearRender||gearFailed)return;gearLoading=true;try{const {mountGearScene}=await import('./gear-scene.js');gearRender=await mountGearScene(canvas,reduced.matches);gearRender(performance.now(),.8,{x:0,y:0},true);gear.classList.add('gear-ready');sync();}catch(error){gearFailed=true;canvas.hidden=true;gear.dataset.render='fallback';console.warn('Gear scene using image fallback:',error.message);}finally{gearLoading=false;}}
new IntersectionObserver(entries=>{gearVisible=entries[0].isIntersecting;if(gearVisible)loadGear();sync()},{threshold:.1,rootMargin:'60px'}).observe(gear);
gear.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=gear.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5};});gear.addEventListener('pointerleave',()=>pointer={x:0,y:0});
document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);mobile.addEventListener('change',()=>{justEntered=true;traffic(journey.getBoundingClientRect());sync()});
journey.querySelectorAll('[data-journey-filter]').forEach(button=>button.addEventListener('click',()=>window.openCatalog(button.dataset.journeyFilter)));
nav.forEach((button,i)=>button.addEventListener('click',()=>chapters[i].el.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'})));
// A single passive update keeps chapter navigation accurate with reduced motion or paused traffic.
let scrollFrame=0;addEventListener('scroll',()=>{if(running()||scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;if(visible)paint(performance.now());});},{passive:true});
traffic(journey.getBoundingClientRect());
