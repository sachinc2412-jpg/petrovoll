'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

const menu=$('.menu-toggle');menu.addEventListener('click',()=>{const open=$('nav').classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});$$('nav a').forEach(a=>a.addEventListener('click',()=>{ $('nav').classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}));
const categories={gasoline:'Gasoline engine oils',diesel:'Diesel engine oils',motorcycle:'Motorcycle oils',marine:'Marine oils',industrial:'Industrial oils',automatic_transmission:'Automatic transmission fluids',automatic_manual_gear:'Manual gear oils',brake:'Brake fluids',coolants:'Coolants & anti-freeze',greases:'Greases',additives:'Additives & car care'};
const officialPaths={gasoline:'GasolineEngineOils',diesel:'DieselEngineOils',motorcycle:'MotorcycleOils',marine:'MarineOils',industrial:'IndustrialOils/products-list.php',automatic_transmission:'AutomaticTransmissionFluids',automatic_manual_gear:'AutomotiveManualGearOils',brake:'BrakeFluids',coolants:'CoolantsAndAntiFreeze',greases:'Greases',additives:'AdditivesAndCarCare'};
const cat=$('#catalog'), detail=$('#product-detail');let catalogData=[];let catalogueState='loading';
$('#filter').innerHTML='<option value="all">All products</option><option value="automotive">All automotive</option>'+Object.entries(categories).map(([v,n])=>`<option value="${v}">${n}</option>`).join('');
$('#category-list').innerHTML=Object.entries(categories).map(([v,n])=>`<button data-filter="${v}">${n}<span>↗</span></button>`).join('');
function closeModal(d){d.close();if(!cat.open&&!detail.open)document.body.style.overflow=''}
$$('.close-dialog').forEach(b=>b.addEventListener('click',()=>closeModal(b.closest('dialog'))));[cat,detail].forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal(d)}});d.addEventListener('close',()=>{if(!cat.open&&!detail.open)document.body.style.overflow=''})});
function openCatalog(filter='all'){ $('#filter').value=filter;$('#search').value='';renderCatalog();if(!cat.open)cat.showModal();document.body.style.overflow='hidden'}
$('#open-catalog').addEventListener('click',()=>openCatalog());$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>openCatalog(b.dataset.filter)));
function productDetails(p){const box=$('#detail-content');box.replaceChildren();const img=document.createElement('img');img.src=p.image;img.alt=p.name;const copy=document.createElement('div');const type=document.createElement('span');type.className='eyebrow';type.textContent=categories[p.category];const h=document.createElement('h2');h.textContent=p.name;const desc=document.createElement('p');desc.textContent='Explore the official Petrovöll catalogue for available grades, packaging, performance specifications and application guidance.';const link=document.createElement('a');link.className='button';link.href='https://petrovoll.com/Products';link.target='_blank';link.rel='noopener';link.textContent='Official specifications ↗';const inquiry=document.createElement('a');inquiry.className='text-link';inquiry.href='mailto:info@petrovoll.com?subject='+encodeURIComponent('Product inquiry: '+p.name);inquiry.textContent='Ask about this product ↗';copy.append(type,h,desc,link,inquiry);box.append(img,copy);if(!detail.open)detail.showModal();document.body.style.overflow='hidden'}
function renderCatalog(){if(catalogueState!=='ready'){ $('#result-count').textContent=catalogueState==='loading'?'Loading products…':'The catalogue could not load. Please refresh or view the official product catalogue.';return;}const filter=$('#filter').value,q=$('#search').value.toLowerCase();const rows=catalogData.filter(p=>(filter==='all'||p.category===filter||(filter==='automotive'&&!['marine','industrial','greases'].includes(p.category)))&&(p.name+' '+categories[p.category]).toLowerCase().includes(q));$('#result-count').textContent=rows.length+' products';const grid=$('#catalog-grid');grid.replaceChildren();rows.forEach(p=>{const b=document.createElement('button');b.className='catalog-product';const img=document.createElement('img');img.src=p.image;img.loading='lazy';img.alt=p.name;const h=document.createElement('h3');h.textContent=p.name;const c=document.createElement('span');c.textContent=categories[p.category].toUpperCase()+' ↗';b.append(img,h,c);b.addEventListener('click',()=>productDetails(p));grid.append(b)});if(!rows.length)grid.textContent='No matching products. Try another search.'}
$('#search').addEventListener('input',renderCatalog);$('#filter').addEventListener('change',renderCatalog);
fetch('catalog.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{catalogData=data;catalogueState='ready';renderCatalog()}).catch(()=>{catalogueState='error';$('#result-count').textContent='The catalogue could not load. Please refresh or view the official product catalogue.';const a=document.createElement('a');a.href='https://petrovoll.com/Products';a.textContent='View official catalogue ↗';$('#catalog-grid').append(a)});

// Production stages change only when selected; videos remain under visitor control.
const processStages=[
 {title:'Ingredients',description:'Base oils and additives are selected for the intended lubricant formulation.'},
 {title:'Blending',description:'Selected base oils and additives come together through controlled blending.'},
 {title:'Laboratory checks',description:'Laboratory testing supports raw material checks and finished product analysis.'},
 {title:'Filling & dispatch',description:'Finished lubricant is filled, packaged and prepared for distribution.'}
];
const processTabs=$$('[data-step]'), processVideo=$('#process-video');let selectedStep=0;
function selectProcess(i,focus=false){
 const stage=processStages[i];if(!stage)return;
 processTabs.forEach((b,n)=>{b.classList.toggle('active',i===n);b.setAttribute('aria-selected',String(i===n));b.tabIndex=i===n?0:-1});
 $('#process-panel').setAttribute('aria-labelledby',`process-tab-${i}`);
 if(selectedStep!==i){processVideo.pause();processVideo.poster=`assets/process-step-${i+1}.webp`;processVideo.querySelector('source').src=`assets/process-step-${i+1}.mp4`;processVideo.load();selectedStep=i;}
 processVideo.setAttribute('aria-label',stage.title+' production visualization');
 $('#process-title').textContent=stage.title;$('#process-description').textContent=stage.description;
 if(focus)processTabs[i].focus();
}
processTabs.forEach((b,i)=>{b.addEventListener('click',()=>selectProcess(i));b.addEventListener('keydown',e=>{let next;if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(i+1)%4;if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(i+3)%4;if(e.key==='Home')next=0;if(e.key==='End')next=3;if(next!==undefined){e.preventDefault();selectProcess(next,true)}})});
const videoObserver=new IntersectionObserver(entries=>{for(const e of entries)if(!e.isIntersecting)processVideo.pause()},{threshold:0});videoObserver.observe(processVideo);
document.addEventListener('visibilitychange',()=>{if(document.hidden)processVideo.pause()});
fetch('locations.json').then(r=>{if(!r.ok)throw Error('Network unavailable');return r.json()}).then(locations=>{
 const select=$('#network-location');
 for(const location of [...locations].sort((a,b)=>a.name.localeCompare(b.name))){const option=document.createElement('option');option.value=location.key;option.textContent=location.name;select.append(option)}
 select.addEventListener('change',()=>{const location=locations.find(l=>l.key===select.value);$('#network-info').textContent=location?location.name+' · '+location.type+'. Contact our team for local distribution information.':'Choose a location to inquire about local distribution.';$('#network-inquiry').href=location?'mailto:info@petrovoll.com?subject='+encodeURIComponent('Distribution inquiry: '+location.name):'#contact'});
}).catch(()=>{$('#network-location').disabled=true;$('#network-info').textContent='Contact our team for information about distribution in your region.'});
$$('[data-inquiry]').forEach(a=>a.addEventListener('click',()=>$('#inquiry').value=a.dataset.inquiry));
$('#contact-form').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.target);const body='Name: '+data.get('name')+'\nEmail: '+data.get('email')+'\n\n'+data.get('message');location.href='mailto:info@petrovoll.com?subject='+encodeURIComponent(data.get('subject'))+'&body='+encodeURIComponent(body)});
$('#year').textContent=new Date().getFullYear();
addEventListener('keydown',e=>{if(e.key==='Escape'&&$('nav').classList.contains('open')){$('nav').classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');menu.focus()}});
matchMedia('(min-width: 821px)').addEventListener('change',e=>{if(e.matches){$('nav').classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}});
