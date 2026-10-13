import {wordmarkState} from './wordmark-motion.js';
const $=s=>document.querySelector(s),clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const hero=$('.hero-sequence'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame=0,smooth=0,target=0,last=0;
function update(time){frame=0;if(reduced||document.hidden)return;const r=hero.getBoundingClientRect();target=clamp(-r.top/Math.max(1,r.height-innerHeight));const dt=Math.min(40,last?time-last:16);last=time;smooth+=(target-smooth)*(1-Math.exp(-dt/75));const p=smooth,leave=ease((p-.16)/.22);
const expand=ease((p-.12)/.32), mobile=innerWidth<=700;
const photo=$('.opening-photo');photo.style.inset=mobile?`${58*(1-expand)}% ${6*(1-expand)}% ${10*(1-expand)}% ${6*(1-expand)}%`:'0%';photo.style.borderRadius=mobile?`${24*(1-expand)}px`:'0px';photo.style.transform='none';photo.style.setProperty('--copy-shade',1-leave);
$('.opening-photo img').style.transform=`scale(${1.015+expand*.045}) translate3d(0,0,0)`;
$('.hero-image-notes').style.opacity=1-ease((p-.18)/.16);$('.hero-watermark').style.opacity=1-leave;
$('.opening-copy').style.transform=`translate3d(${-leave*35}px,${leave*-25}px,0)`;$('.opening-copy').style.opacity=1-leave;$('.opening-copy').inert=leave>.5;
const mark=wordmarkState(p);$('.opening-finish').style.opacity=mark.entry;$('.opening-finish').style.transform='none';$('.wordmark-field').style.opacity=mark.field;$('.wordmark-outline').style.opacity=mark.outline;$('.wordmark-ink').style.opacity=mark.ink;$('.wordmark-photo').style.transform=`scale(${1.06-mark.resolve*.06})`;$('.wordmark-caption').style.opacity=mark.caption;$('.wordmark-caption').style.transform=`translateY(${(1-mark.caption)*20}px)`;
$('.opening-bottom').style.color=p>.30&&p<.78?'#fff8eb':'#978365';$('.opening-bottom a').style.color=p>.30&&p<.78?'#fff8eb':'#a41017';
$('.opening-progress i').style.transform=`scaleX(${p})`;
if(Math.abs(smooth-target)>.0001)frame=requestAnimationFrame(update);
}
function sizeWordmark(){const pin=$('.opening-pin'),width=1600,height=Math.round(width*pin.clientHeight/Math.max(1,pin.clientWidth));$('.wordmark-portal').setAttribute('viewBox',`0 0 ${width} ${height}`);['#petrovoll-wordmark-mask','.wordmark-field','.wordmark-photo'].forEach(selector=>{$(selector).setAttribute('width',width);$(selector).setAttribute('height',height)});document.querySelectorAll('.wordmark-mask-text,.wordmark-outline,.wordmark-ink').forEach(text=>{text.setAttribute('y',height*.55+80);text.setAttribute('font-size',225)})}sizeWordmark();addEventListener('resize',sizeWordmark,{passive:true});document.fonts.ready.then(sizeWordmark);
function start(){if(!frame&&!reduced){last=0;frame=requestAnimationFrame(update)}}addEventListener('scroll',start,{passive:true});addEventListener('resize',start,{passive:true});start();
