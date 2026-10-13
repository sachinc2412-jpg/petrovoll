(()=>{
 const data=[
  {title:'Made for the road ahead.',description:'Engine oils, transmission fluids, coolants and car care for every journey.',image:'automotive-premium.webp',alt:'Performance car on a mountain road',label:'Automotive performance',filter:'automotive',button:'Explore automotive'},
  {title:'Built for demanding work.',description:'Diesel engine oil formulations for the engines that do the heavy lifting.',image:'heavy-duty-premium.webp',alt:'Heavy-duty truck on a mountain highway',label:'Heavy-duty performance',filter:'diesel',button:'Explore diesel oils'},
  {title:'Precision behind progress.',description:'Hydraulic, gear, compressor and specialist oils for equipment and machinery.',image:'industrial-premium.webp',alt:'Precision industrial equipment',label:'Industrial performance',filter:'industrial',button:'Explore industrial oils'},
  {title:'Confidence on the open sea.',description:'Marine oil formulations for cylinder, trunk piston and outboard applications.',image:'marine-editorial.webp',alt:'Cargo ship at sea',label:'Marine performance',filter:'marine',button:'Explore marine oils'}
 ];
 const tabs=[...document.querySelectorAll('[data-application]')],image=document.querySelector('#application-image');let current=0,changeId=0;
 function select(i,focus=false){current=i;const d=data[i],id=++changeId;
  tabs.forEach((b,n)=>{b.setAttribute('aria-selected',String(i===n));b.tabIndex=i===n?0:-1});
  const groups=[['Engine oils','Transmission fluids','Coolants & car care'],['Diesel engine oils','Heavy-duty applications','Fleet operations'],['Hydraulic oils','Gear & compressor oils','Specialist formulations'],['Cylinder oils','Trunk piston oils','Outboard applications']];const specs=document.querySelector('#application-specs');specs.replaceChildren(...groups[i].map(text=>{const el=document.createElement('span');el.textContent=text;return el}));
  document.querySelector('#application-panel').setAttribute('aria-labelledby',`application-tab-${i}`);
  document.querySelector('#application-title').textContent=d.title;document.querySelector('#application-description').textContent=d.description;document.querySelector('#application-image-label').textContent=`0${i+1} / ${d.label}`;document.querySelector('#application-catalogue').innerHTML=d.button+' <span aria-hidden="true">↗</span>';
  const preload=new Image();preload.src='assets/'+d.image;preload.onload=()=>{if(id===changeId){image.src=preload.src;image.alt=d.alt;image.animate([{opacity:.55},{opacity:1}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:350,easing:'ease-out'})}};
  if(focus)tabs[i].focus();
 }
 tabs.forEach((b,i)=>{b.addEventListener('click',()=>select(i));b.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%4;if(e.key==='ArrowLeft')next=(i+3)%4;if(e.key==='Home')next=0;if(e.key==='End')next=3;if(next!==undefined){e.preventDefault();select(next,true)}})});
 document.querySelector('#application-catalogue').addEventListener('click',()=>openCatalog(data[current].filter));
 const svg=document.querySelector('#network-map');
 if(!window.d3)return;
 Promise.all([fetch('world-land.json').then(r=>r.json()),fetch('locations.json').then(r=>r.json())]).then(([world,locations])=>{
  const d=d3,projection=d.geoNaturalEarth1().fitExtent([[24,14],[936,440]],world),path=d.geoPath(projection),root=d.select(svg);
  root.append('path').datum(world).attr('d',path).attr('class','map-land');
  const all=[...locations,{key:'germany',name:'Essen, Germany',coordinates:[7.01,51.45]},{key:'uae',name:'Abu Dhabi, UAE',coordinates:[54.38,24.45]}];
  const marks=root.selectAll('g.location').data(all).join('g').attr('class','location').attr('transform',l=>`translate(${projection(l.coordinates)})`);
  marks.append('circle').attr('r',9).attr('class','map-dot-hit');marks.append('circle').attr('r',3.5).attr('class','map-dot');marks.append('title').text(l=>l.name);
  const halo=root.append('circle').attr('class','map-selection').attr('r',12).attr('visibility','hidden');
  const label=root.append('text').attr('class','map-location-label');
  function highlight(key){const l=all.find(x=>x.key===key);if(!l){halo.attr('visibility','hidden');label.text('');return;}const [x,y]=projection(l.coordinates);halo.attr('cx',x).attr('cy',y).attr('visibility','visible');label.attr('x',x).attr('y',y-20).attr('text-anchor','middle').text(l.name);}
  marks.on('click',(_,l)=>{const select=document.querySelector('#network-location');if(locations.some(x=>x.key===l.key)){select.value=l.key;select.dispatchEvent(new Event('change'));}highlight(l.key)});
  document.querySelector('#network-location').addEventListener('change',e=>highlight(e.target.value));
 }).catch(()=>{svg.parentElement.hidden=true});
})();
