const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const mix=(a,b,t)=>a+(b-a)*t;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q=s=>document.querySelector(s), QA=s=>[...document.querySelectorAll(s)];
const heroSection=Q('.hero-sequence'), heroPin=Q('.hero-pin'), heroText=Q('.hero-content'), second=Q('.hero-second'), brand=Q('.hero-brand-reveal');
const stage=Q('.product-stage'), first=Q('#showcase');
const layers=[first,...['assets/viro-transparent.webp','assets/hydkon-transparent.webp'].map((src,i)=>{const img=document.createElement('img');img.src=src;img.alt=i?'Petrovöll HYDKÖN hydraulic oil':'Petrovöll VIRÖ-TEC diesel engine oil';img.className='product-layer';stage.append(img);return img})];
// Preserve the original STÄRK render while the copy changes between families.
const storyRender=first.src;
const phases=[0,.35,.68,1];
let targetScroll=scrollY, smoothScroll=scrollY, lastTime=0, frame=0, active=true;
let heroProgress=0, mouseX=0,mouseY=0,renderEngine=null;
let sceneReady=false;
const aboutTitle=Q('.about h2');
// Each headline line reveals independently with the scroll position.
aboutTitle.innerHTML='<span class="motion-line">A higher standard.</span><br><span class="motion-line"><em>By design.</em></span>';
function sectionProgress(el){const r=el.getBoundingClientRect();return clamp((smoothScroll-(r.top+scrollY))/Math.max(1,r.height-innerHeight))}
const manifest=Q('.motion-manifesto'), driveRail=Q('.drive-rail'), drivePanels=QA('.drive-panel');
const facility=Q('.facility'), about=Q('.about'), tech=Q('.tech-art'), dist=Q('.distributor-layout h2');
function keyframes(keys,p){for(let i=1;i<keys.length;i++){if(p<=keys[i][0]){const t=ease((p-keys[i-1][0])/(keys[i][0]-keys[i-1][0]));return keys[i-1][1].map((v,n)=>mix(v,keys[i][1][n],t))}}return keys.at(-1)[1]}
const productKeys=[
 [[0,[-55,18,.59,-6,1]],[.12,[0,0,1,0,1]],[.27,[0,0,1,0,1]],[.42,[-95,-25,.75,-7,0]],[.7,[-95,-25,.75,-7,0]],[.9,[-55,18,.55,-4,1]],[1,[-55,18,.55,-4,1]]],
 [[0,[0,10,.69,0,.9]],[.12,[95,30,.65,8,0]],[.28,[95,30,.65,8,0]],[.43,[0,0,1,0,1]],[.58,[0,0,1,0,1]],[.72,[0,-40,.7,0,0]],[.9,[0,7,.66,0,1]],[1,[0,7,.66,0,1]]],
 [[0,[55,18,.59,6,1]],[.12,[100,45,.65,7,0]],[.58,[100,45,.65,7,0]],[.73,[0,0,1,0,1]],[.82,[0,0,1,0,1]],[.9,[55,18,.55,4,1]],[1,[55,18,.55,4,1]]]
];
let current=-1;
function updateMotion(t){frame=0;if(document.hidden||!active)return;const dt=Math.min(40,t-lastTime||16);lastTime=t;smoothScroll=mix(smoothScroll,targetScroll,1-Math.exp(-dt/75));if(Math.abs(smoothScroll-targetScroll)<.15)smoothScroll=targetScroll;
heroProgress=sectionProgress(heroSection);const p=heroProgress;
if(!reduced){
const ar=about.getBoundingClientRect(),a=clamp((innerHeight-ar.top)/(innerHeight*.85));QA('.motion-line').forEach((e,i)=>{const k=ease((a-i*.17)/.46);e.style.opacity=mix(.13,1,k);e.style.transform=`translate3d(0,${(1-k)*60}px,0)`;e.style.display='inline-block'});
const artProgress=ease(clamp((innerHeight-about.querySelector('.about-art').getBoundingClientRect().top)/(innerHeight*.85)));about.style.setProperty('--about-reveal',artProgress);QA('.about-principles>div').forEach((row,i)=>{const k=ease(clamp((innerHeight*.9-row.getBoundingClientRect().top)/(innerHeight*.35)));row.style.opacity=.3+k*.7;row.style.transform=`translate3d(0,${(1-k)*12}px,0)`});
const sp=sectionProgress(Q('.product-story')), n=sp<.34?0:sp<.67?1:2;
// Fade the current composition out completely before handing off the copy.
const edges=[.34,.67], distance=Math.min(...edges.map(edge=>Math.abs(sp-edge))), reveal=ease(distance/.055);
if(n!==current){current=n;showStory(n);first.src=storyRender;first.alt='Petrovöll STÄRK engine oil bottle';first.classList.remove('original')}
const blendA=ease((sp-.285)/.11),blendB=ease((sp-.615)/.11),weights=[1-blendA,blendA*(1-blendB),blendB];
layers.forEach((img,i)=>{const selected=i===n,weight=weights[i],local=clamp((sp-i/3)*3);img.style.opacity=weight;img.style.transform=`translate3d(${(i===0?-1:1)*(1-weight)*46}px,${(1-weight)*28-local*7}px,0) scale(${.94+weight*.06})`;img.style.zIndex=selected?'3':'2';img.setAttribute('aria-hidden',String(!selected))});
QA('.collection-backdrop>img').forEach((img,i)=>{img.style.opacity=weights[i];img.style.transform=`scale(${1.08-(weights[i]*.04)}) translate3d(0,${-sp*12}px,0)`});Q('.collection-scene-label').textContent=['01 / EVERYDAY PERFORMANCE','02 / HEAVY-DUTY PROTECTION','03 / INDUSTRIAL PRECISION'][n];Q('.collection-scene-label').style.opacity=reveal;
const copy=Q('.story-copy');copy.style.opacity=reveal;copy.style.transform=`translate3d(0,${(1-reveal)*10}px,0)`;copy.style.pointerEvents=reveal>.4?'auto':'none';copy.inert=reveal<.4;
Q('.story-word').style.transform=`translate3d(${-sp*18}px,0,0)`;Q('.story-word').style.opacity=.045*reveal;
QA('[data-story]').forEach((button,i)=>{button.style.setProperty('--chapter-progress',clamp((sp-i/3)*3));button.setAttribute('aria-pressed',String(i===n))});
const mp=sectionProgress(manifest),journey=mp*2;
drivePanels.forEach((panel,i)=>{const delta=journey-i,distance=Math.abs(delta),opacity=1-ease((distance-.12)/.68),copy=panel.querySelector('.drive-copy'),visual=panel.querySelector('.drive-visual'),pack=panel.querySelector('.drive-cutout');copy.style.opacity=opacity;copy.style.transform=`translate3d(0,${-delta*75}px,0)`;copy.inert=opacity<.5;copy.setAttribute('aria-hidden',String(opacity<.5));copy.style.pointerEvents=opacity>.5?'auto':'none';panel.style.zIndex=String(5-Math.round(distance*2));visual.style.opacity=distance<1.6?.18+opacity*.82:0;visual.style.transform=`perspective(1800px) translate3d(${delta*35}px,${delta*-25}px,${-distance*110}px) rotateY(${-9+delta*13}deg) rotateZ(${1.5+delta*2.5}deg) scale(${1-distance*.04})`;visual.querySelector('img').style.transform=`scale(1.06) translateX(${delta*10}px)`;pack.style.opacity=opacity;pack.style.transform=`perspective(1400px) translate3d(${delta*-35}px,${-delta*30}px,60px) scale(${1-distance*.1})`});
QA('[data-drive]').forEach((button,i)=>{const selected=i===Math.min(2,Math.round(journey));button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected))});Q('.drive-progress i').style.transform=`scaleX(${mp})`;
const tr=tech.getBoundingClientRect();tech.classList.toggle('in-view',tr.top<innerHeight*.78);tech.style.transform=`perspective(1200px) rotateY(${mix(5,0,clamp((innerHeight-tr.top)/innerHeight))}deg)`;
const dr=dist.getBoundingClientRect();dist.style.transform=`translateX(${mix(40,0,clamp((innerHeight-dr.top)/innerHeight))}px)`;
const footer=Q('footer').getBoundingClientRect();Q('.footer-word').style.transform=`translateY(${mix(75,0,clamp((innerHeight-footer.top)/innerHeight))}px)`;
}
if(renderEngine)renderEngine(t,p,mouseX,mouseY);if(Math.abs(smoothScroll-targetScroll)>.1)frame=requestAnimationFrame(updateMotion)}
function start(){if(!frame){lastTime=performance.now();frame=requestAnimationFrame(updateMotion)}}
addEventListener('scroll',()=>{targetScroll=scrollY;start()},{passive:true});addEventListener('resize',start,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else start()});
heroPin.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;mouseX=(e.clientX/innerWidth-.5)*.35;mouseY=(e.clientY/innerHeight-.5)*.2;start()});
QA('.application').forEach(card=>{card.addEventListener('pointermove',e=>{if(reduced||e.pointerType!=='mouse')return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`rotateY(${x*8}deg) rotateX(${-y*8}deg) translateZ(8px)`});card.addEventListener('pointerleave',()=>card.style.transform='')});
QA('[data-drive]').forEach((button,i)=>button.addEventListener('click',()=>{if(reduced){drivePanels[i].scrollIntoView({behavior:'auto'});return}const rect=manifest.getBoundingClientRect(),top=rect.top+scrollY;window.scrollTo({top:top+(rect.height-innerHeight)*i/2,behavior:'smooth'})}));
if(reduced){layers.slice(1).forEach(i=>i.style.display='none');QA('[data-story]').forEach((b,i)=>b.addEventListener('click',()=>{layers.forEach((im,n)=>im.style.display=n===i?'block':'none');if(i===0)first.src=storyRender;QA('.collection-backdrop>img').forEach((im,n)=>im.style.opacity=n===i?1:0);Q('.collection-scene-label').textContent=['01 / EVERYDAY PERFORMANCE','02 / HEAVY-DUTY PROTECTION','03 / INDUSTRIAL PRECISION'][i]}))}start();
