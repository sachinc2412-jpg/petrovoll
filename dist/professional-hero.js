// Reference-inspired animated road network. No scroll hijacking or pinned image masks.
(()=>{
const hero=document.querySelector('.network-hero');if(!hero)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),pause=hero.querySelector('.network-hero-pause'),paths=new Map([...hero.querySelectorAll('path[id^="hero-road-"]')].map(path=>[path.id,{path,length:path.getTotalLength()}]));
const vehicles=[...hero.querySelectorAll('.hero-network-vehicle')].map(el=>({el,route:paths.get(el.dataset.route),speed:Number(el.dataset.speed),offset:Number(el.dataset.offset),reverse:el.dataset.reverse==='true'}));
let visible=false,paused=false,frame=0,last=0,elapsed=0,currentScroll=0;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function draw(time,dt=16){const rect=hero.getBoundingClientRect(),target=clamp(-rect.top/Math.max(1,rect.height),0,1);currentScroll+=(target-currentScroll)*(1-Math.exp(-dt/150));
for(const v of vehicles){const position=(v.offset*v.route.length+elapsed*v.speed)%v.route.length,distance=v.reverse?v.route.length-position:position,p=v.route.path.getPointAtLength(distance),q=v.route.path.getPointAtLength(Math.min(v.route.length,distance+.6)),angle=Math.atan2(q.y-p.y,q.x-p.x),lane=v.reverse?-12:12;v.el.style.transform=`translate(${p.x-Math.sin(angle)*lane}px,${p.y+Math.cos(angle)*lane}px) rotate(${angle*180/Math.PI+(v.reverse?270:90)}deg)`;}
if(!reduced.matches){hero.style.setProperty('--hero-scene-y',`${currentScroll*-18}px`);hero.style.setProperty('--hero-product-y',`${currentScroll*-25}px`);}}
function running(){return visible&&!paused&&!reduced.matches&&!document.hidden;}
function tick(time){frame=0;if(!running())return;const dt=last?Math.min(50,time-last):16;last=time;elapsed+=dt/1000;draw(time,dt);frame=requestAnimationFrame(tick);}
function sync(){last=0;if(running()&&!frame)frame=requestAnimationFrame(tick);else if(!running()&&frame){cancelAnimationFrame(frame);frame=0;}pause.textContent=paused?'▷':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Play hero animation':'Pause hero animation');}
pause.addEventListener('click',()=>{paused=!paused;sync()});new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.01}).observe(hero);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',()=>{if(reduced.matches){hero.style.removeProperty('--hero-scene-y');hero.style.removeProperty('--hero-product-y');}sync()});draw(performance.now());
})();
