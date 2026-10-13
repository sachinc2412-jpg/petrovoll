const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
// A physical gear train: a machined face, bearing, collar and shaft per gear.
export function createAssembly(T){
 const root=new T.Group(),parts=[];
 const steel=new T.MeshStandardMaterial({color:0xb8bec4,metalness:.94,roughness:.26});
 const face=new T.MeshStandardMaterial({color:0xd5d8db,metalness:.88,roughness:.3});
 const dark=new T.MeshStandardMaterial({color:0x343d45,metalness:.85,roughness:.32});
 const red=new T.MeshStandardMaterial({color:0xa50914,metalness:.6,roughness:.24});
 const oil=new T.MeshPhysicalMaterial({color:0xb9770f,metalness:.5,roughness:.16,clearcoat:1});
 function annulus(outer,inner,depth,material){const s=new T.Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new T.Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:64});g.translate(0,0,-depth/2);return new T.Mesh(g,material)}
 const specs=[{x:-.66,y:.04,r:1.12,n:28,angle:0},{x:1.07,y:.67,r:.73,n:18,angle:Math.PI/18},{x:.72,y:-1.0,r:.6,n:15,angle:Math.PI/15}];
 specs.forEach((s,i)=>{
  const unit=new T.Group();unit.position.set(s.x,s.y,0);root.add(unit);
  const rotor=new T.Group();unit.add(rotor);
  const shape=new T.Shape(),points=[];
  // Tooth pitch matches across the train; bevels catch the studio strip lights.
  for(let j=0;j<s.n*4;j++){const a=j/(s.n*4)*Math.PI*2,rr=s.r+(j%4===1||j%4===2?.065:-.055);points.push([Math.cos(a)*rr,Math.sin(a)*rr]);}
  points.forEach((p,j)=>j?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();
  const hole=new T.Path();hole.absarc(0,0,s.r*.31,0,Math.PI*2,true);shape.holes.push(hole);
  const geometry=new T.ExtrudeGeometry(shape,{depth:.28,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,steps:1,curveSegments:48});geometry.translate(0,0,-.14);
  const gear=new T.Mesh(geometry,[face,steel]);rotor.add(gear);
  const inset=annulus(s.r*.77,s.r*.43,.025,dark);inset.position.z=.164;rotor.add(inset);
  const plate=annulus(s.r*.74,s.r*.45,.024,face);plate.position.z=.181;rotor.add(plate);
  const scored=new T.Group();rotor.add(scored);
  for(let j=0;j<5;j++){const line=new T.Mesh(new T.TorusGeometry(s.r*(.79+j*.026),.002,4,96),dark);line.position.z=.16;scored.add(line)}
  const bearing=annulus(s.r*.43,s.r*.24,.12,red);bearing.position.z=.25;unit.add(bearing);
  const inner=annulus(s.r*.29,s.r*.18,.145,steel);inner.position.z=.275;unit.add(inner);
  const shaft=new T.Mesh(new T.CylinderGeometry(s.r*.17,s.r*.17,.78,48),dark);shaft.rotation.x=Math.PI/2;shaft.position.z=-.17;unit.add(shaft);
  const bolts=new T.Group();bearing.add(bolts);
  for(let j=0;j<6;j++){const a=j*Math.PI/3;const bolt=new T.Mesh(new T.CylinderGeometry(.025,.025,.025,6),steel);bolt.rotation.x=Math.PI/2;bolt.position.set(Math.cos(a)*s.r*.34,Math.sin(a)*s.r*.34,.076);bolts.add(bolt)}
  const film=new T.Mesh(new T.TorusGeometry(s.r*.44,.015,8,96,Math.PI*1.55),oil);film.position.z=.32;film.rotation.z=.3;unit.add(film);
  rotor.rotation.z=s.angle;parts.push({unit,rotor,bearing,inner,film,shaft,spec:s});
 });
 return {root,parts,update(p,angle,mouse){
  const assembled=ease((p-.14)/.45),separation=(1-assembled)*.85;
  root.rotation.set(-.16+mouse.y*.12,-.65+mouse.x*.2+ease((p-.55)/.4)*.78,-.04);
  parts.forEach((part,i)=>{const ratio=i===0?1:-28/part.spec.n;part.rotor.rotation.z=part.spec.angle+angle*ratio;part.bearing.position.z=.25+separation;part.inner.position.z=.275+separation*1.55;part.film.position.z=.32+separation;part.unit.position.z=i===0?0:-separation*.22;part.film.visible=p>.17});
 }};
}
export async function mountGearScene(canvas,reduced){
 const T=await import('./three.module.js');
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<701?1.25:1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,40);camera.position.set(0,0,8.4);camera.lookAt(.05,-.08,0);
 const ec=document.createElement('canvas');ec.width=1024;ec.height=512;const c=ec.getContext('2d');c.fillStyle='#343b44';c.fillRect(0,0,1024,512);c.fillStyle='#e3e7eb';c.fillRect(20,30,190,440);c.fillStyle='#ffffff';c.fillRect(610,40,110,400);c.fillStyle='#c1ccd7';c.fillRect(850,170,90,260);c.fillStyle='#8b7551';c.fillRect(400,280,80,180);
 const env=new T.CanvasTexture(ec);env.mapping=T.EquirectangularReflectionMapping;const pm=new T.PMREMGenerator(renderer);const envTarget=pm.fromEquirectangular(env);scene.environment=envTarget.texture;env.dispose();pm.dispose();
 scene.add(new T.HemisphereLight(0xf5f8ff,0x635a46,1.4));const key=new T.DirectionalLight(0xffffff,3.2);key.position.set(-3,4,5);scene.add(key);const rim=new T.DirectionalLight(0xd5e4ff,2.5);rim.position.set(4,2,-3);scene.add(rim);
 const assembly=createAssembly(T);scene.add(assembly.root);
 // One soft studio contact shadow, no floating particles or decorative orbit loops.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(128,128,5,128,128,128);gradient.addColorStop(0,'rgba(42,45,51,.3)');gradient.addColorStop(1,'rgba(42,45,51,0)');sc.fillStyle=gradient;sc.fillRect(0,0,256,256);
 const shadow=new T.Mesh(new T.PlaneGeometry(4.7,1.15),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.position.set(.05,-1.72,-.55);scene.add(shadow);
 let width=0,height=0,smoothed=.0,mx=0,my=0,angle=0,last=0;
 return (time,p,mouse,paused=false)=>{
  const dt=Math.min(40,last?time-last:16);last=time;const blend=1-Math.exp(-dt/100);smoothed+=(p-smoothed)*blend;mx+=(mouse.x-mx)*blend;my+=(mouse.y-my)*blend;
  const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=8.4*Math.max(1,1.3/camera.aspect);camera.updateProjectionMatrix()}
  if(!reduced&&!paused)angle+=dt*.00012*ease((smoothed-.3)/.3);
  camera.position.z=(8.4-ease((smoothed-.35)/.55)*1.15)*Math.max(1,1.3/camera.aspect);camera.position.x=ease((smoothed-.55)/.4)*.2;camera.lookAt(.05,-.08,0);
  assembly.update(reduced?.8:smoothed,angle+smoothed*.48,{x:reduced?0:mx,y:reduced?0:my});renderer.render(scene,camera);
 };
}
