// Native horizontal scrolling: touch/trackpad gestures, keyboard, and explicit controls.
(()=>{
 const track=document.querySelector('#range-track');if(!track)return;
 const cards=[...track.querySelectorAll('.range-card')],prev=document.querySelector('.range-prev'),next=document.querySelector('.range-next'),label=document.querySelector('#range-position'),progress=document.querySelector('.range-progress span');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0;
 function update(){frame=0;const left=track.scrollLeft,max=track.scrollWidth-track.clientWidth;prev.disabled=left<2;next.disabled=left>=max-2;
  const bounds=track.getBoundingClientRect(),visible=cards.map((card,i)=>({i,r:card.getBoundingClientRect()})).filter(({r})=>r.right>bounds.left+35&&r.left<bounds.right-35);
  if(visible.length){const first=visible[0].i+1,last=visible.at(-1).i+1;const message=first===last?`Group ${first} of ${cards.length}`:`Groups ${first}–${last} of ${cards.length}`;if(label.textContent!==message)label.textContent=message;progress.style.width=`${Math.max(8,last/cards.length*100)}%`;}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 function move(direction){const stride=cards[1].offsetLeft-cards[0].offsetLeft;track.scrollBy({left:direction*stride,behavior:reduced.matches?'instant':'smooth'});}
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));track.addEventListener('scroll',schedule,{passive:true});
 track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}if(e.key==='Home'||e.key==='End'){e.preventDefault();track.scrollTo({left:e.key==='Home'?0:track.scrollWidth,behavior:reduced.matches?'instant':'smooth'})}});
 new ResizeObserver(schedule).observe(track);document.fonts.ready.then(schedule);update();
})();
