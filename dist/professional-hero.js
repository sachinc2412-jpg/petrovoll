// Continuous road surfaces and connected driving routes; eased speed, steering and headway.
(()=>{
const hero=document.querySelector('.network-hero-reference');if(!hero)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),pause=hero.querySelector('.network-hero-pause'),stage=hero.querySelector('.network-scene-stage');
const paths=new Map([...hero.querySelectorAll('path[id^="hero-road-"],path[id^="hero-traffic-"]')].map(path=>[path.id,{path,length:path.getTotalLength(),closed:path.id==='hero-road-centre'}]));
const vehicles=[...hero.querySelectorAll('.hero-network-vehicle')].map(el=>({el,route:paths.get(el.dataset.route),routeId:el.dataset.route,reverse:el.dataset.reverse==='true',truck:el.querySelector('image').getAttribute('href').includes('truck'),distance:0,speed:0,heading:null,point:null}));
const lanes=new Map();for(const v of vehicles){const key=v.routeId+v.reverse;if(!lanes.has(key))lanes.set(key,[]);lanes.get(key).push(v);}for(const lane of lanes.values())lane.forEach((v,i)=>v.distance=v.route.length*(i+.5)/lane.length);
hero.classList.add('hero-intro-pending');let visible=false,paused=false,frame=0,last=0;const entranceAnimations=[];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),wrapAngle=v=>Math.atan2(Math.sin(v),Math.cos(v));
function sample(v,distance){const route=v.route,d=clamp(distance,0,route.length),p=route.path.getPointAtLength(d),a=route.path.getPointAtLength(Math.max(0,d-1)),b=route.path.getPointAtLength(Math.min(route.length,d+1)),angle=Math.atan2(b.y-a.y,b.x-a.x),lane=v.reverse?-10:10;return {x:p.x-Math.sin(angle)*lane,y:p.y+Math.cos(angle)*lane,angle:angle+(v.reverse?Math.PI:0),roadAngle:angle};}
function draw(dt=0){
 const blend=1-Math.exp(-dt/220),positions=vehicles.map(v=>sample(v,v.distance));
 for(let i=0;i<vehicles.length;i++){const v=vehicles[i],p=positions[i],direction=v.reverse?-1:1,look=sample(v,v.distance+direction*24),bend=Math.abs(wrapAngle(look.roadAngle-p.roadAngle));let target=(v.truck?31:39)*(1-clamp(bend/.8,0,.4));
  // Adjacent vehicles on the same heading brake smoothly, including shared route segments.
  for(let j=0;j<vehicles.length;j++){if(i===j)continue;const other=positions[j],dx=other.x-p.x,dy=other.y-p.y,ahead=dx*Math.cos(p.angle)+dy*Math.sin(p.angle),side=Math.abs(-dx*Math.sin(p.angle)+dy*Math.cos(p.angle)),alignment=Math.cos(other.angle-p.angle);if(ahead>0&&side<13&&alignment>.75){const gap=v.truck||vehicles[j].truck?72:48;if(ahead<gap+25)target=Math.min(target,clamp((ahead-gap)/25,0,1)*target);}}
  v.speed+=(target-v.speed)*blend;if(dt){v.distance+=direction*v.speed*dt/1000;if(v.distance>v.route.length)v.distance-=v.route.length;if(v.distance<0)v.distance+=v.route.length;}
  const q=sample(v,v.distance),angle=q.angle+Math.PI/2;if(v.heading===null)v.heading=angle;else v.heading+=wrapAngle(angle-v.heading)*(1-Math.exp(-Math.max(dt,16)/55));
  v.el.style.transform=`translate(${q.x}px,${q.y}px) rotate(${v.heading*180/Math.PI}deg)`;
  // Open routes re-enter outside the view; the factory gate softly occludes arrivals.
  const gate=v.routeId==='hero-traffic-west'?clamp(v.distance/44,0,1):1;v.el.style.opacity=String(gate);
 }
}
function running(){return visible&&!paused&&!reduced.matches&&!document.hidden;}
function tick(time){frame=0;if(!running())return;const dt=last?Math.min(40,time-last):16;last=time;draw(dt);frame=requestAnimationFrame(tick);}
function sync(){last=0;hero.classList.toggle('hero-paused',paused||reduced.matches||!visible||document.hidden);if(running()&&!frame)frame=requestAnimationFrame(tick);else if(!running()&&frame){cancelAnimationFrame(frame);frame=0;}pause.textContent=paused?'▷':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Play hero animation':'Pause hero animation');for(const animation of entranceAnimations){if(animation.playState==='finished')continue;if(reduced.matches)animation.finish();else if(paused||document.hidden)animation.pause();else animation.play();}}
function animate(el,keyframes,options){const a=el.animate(keyframes,options);entranceAnimations.push(a);}
function enter(){hero.classList.remove('hero-intro-pending');if(reduced.matches)return;const easing='cubic-bezier(.22,1,.36,1)';animate(stage,[{opacity:0,transform:'scale(.74)'},{opacity:1,transform:'scale(1)'}],{duration:1600,easing,fill:'backwards'});const groups=[['.hero-road-network',80],['.network-hero-centre',120],['.network-hero-facility',340],['.network-hero-machinery',490],['.network-industrial-copy,.network-technology-copy,.network-products-copy',680],['.hero-network-vehicle,.hero-fluid-flow,.network-hero-pause',850]];for(const [selector,delay] of groups)hero.querySelectorAll(selector).forEach(el=>animate(el,[{opacity:0,translate:'0 9px'},{opacity:1,translate:'0 0'}],{duration:760,delay,easing,fill:'backwards'}));sync();}
pause.addEventListener('click',()=>{paused=!paused;sync()});new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.01}).observe(hero);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);hero.querySelectorAll('[data-hero-filter]').forEach(button=>button.addEventListener('click',()=>window.openCatalog(button.dataset.heroFilter)));
draw();Promise.all([...hero.querySelectorAll('img')].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});}))).then(()=>document.fonts.ready).then(enter);
})();
