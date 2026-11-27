const {rocketPose}=await import('./launch-math.js'+new URL(import.meta.url).search);
// Geometric rocket, lit and rendered in 3D. No third-party model or texture.
export function createRocket(THREE){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,50);camera.position.set(0,.15,7.5);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight('#c9e6ff','#283444',2.8));
 const key=new THREE.DirectionalLight('#fff0dc',5);key.position.set(-3,4,5);scene.add(key);
 const rim=new THREE.DirectionalLight('#72c5f3',4);rim.position.set(3,1,-2);scene.add(rim);
 const rocket=new THREE.Group();rocket.name='rocket';scene.add(rocket);
 const metal=new THREE.MeshStandardMaterial({color:'#c7d1d9',metalness:.87,roughness:.24});
 const dark=new THREE.MeshStandardMaterial({color:'#243846',metalness:.78,roughness:.3});
 const gold=new THREE.MeshStandardMaterial({color:'#a7804c',metalness:.85,roughness:.29});
 const profile=[new THREE.Vector2(.17,-.95),new THREE.Vector2(.22,-.72),new THREE.Vector2(.235,-.4),new THREE.Vector2(.235,.65),new THREE.Vector2(.225,.88),new THREE.Vector2(.17,1.08),new THREE.Vector2(.08,1.28),new THREE.Vector2(0,1.4)];
 const hull=new THREE.Mesh(new THREE.LatheGeometry(profile,48),metal);rocket.add(hull);
 for(const y of [-.65,.70]){const band=new THREE.Mesh(new THREE.TorusGeometry(.237,.018,10,48),dark);band.rotation.x=Math.PI/2;band.position.y=y;rocket.add(band);}
 const window=new THREE.Mesh(new THREE.CircleGeometry(.105,32),new THREE.MeshStandardMaterial({color:'#173e57',metalness:.7,roughness:.08,emissive:'#12354a',emissiveIntensity:.35}));window.position.set(0,.35,.239);rocket.add(window);
 const windowRim=new THREE.Mesh(new THREE.TorusGeometry(.119,.015,10,36),gold);windowRim.position.copy(window.position);rocket.add(windowRim);
 const finShape=new THREE.Shape();finShape.moveTo(.19,-.44);finShape.lineTo(.51,-1.08);finShape.lineTo(.17,-.88);finShape.closePath();
 const finGeometry=new THREE.ExtrudeGeometry(finShape,{depth:.035,bevelEnabled:true,bevelSize:.01,bevelThickness:.01,bevelSegments:2,steps:1});
 for(let i=0;i<3;i++){const fin=new THREE.Mesh(finGeometry,dark);fin.rotation.y=i*Math.PI*2/3;rocket.add(fin);}
 const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(.11,.18,.25,32,1,true),dark);nozzle.position.y=-1.02;rocket.add(nozzle);
 const flame=new THREE.Group();flame.position.y=-1.1;rocket.add(flame);
 const plumeMaterial=new THREE.MeshBasicMaterial({color:'#ffba69',transparent:true,opacity:.38,blending:THREE.AdditiveBlending,depthWrite:false});
 const plume=new THREE.Mesh(new THREE.ConeGeometry(.22,1.7,32,1,true),plumeMaterial);plume.position.y=-.85;flame.add(plume);
 const core=new THREE.Mesh(new THREE.ConeGeometry(.10,1.2,24),new THREE.MeshBasicMaterial({color:'#d4f3ff',transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));core.position.y=-.6;flame.add(core);
 const tetherPositions=new Float32Array(24*3),tetherGeometry=new THREE.BufferGeometry();tetherGeometry.setAttribute('position',new THREE.BufferAttribute(tetherPositions,3));
 const tether=new THREE.Line(tetherGeometry,new THREE.LineBasicMaterial({color:'#d3ac77',transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}));tether.frustumCulled=false;scene.add(tether);
 const glow=new THREE.PointLight('#f5bd78',0,5);glow.position.y=-1.4;rocket.add(glow);
 function update(progress,time,mobile=false){const pose=rocketPose(progress,mobile);
  rocket.position.set(pose.x,pose.y,pose.z);rocket.rotation.z=pose.rotation;
  flame.visible=pose.flame>.01;flame.scale.setScalar(Math.max(.001,pose.flame));flame.scale.y*=1+Math.sin(time*8)*.07;
  glow.intensity=pose.flame*9;rocket.scale.setScalar(mobile?.85:1);
  tether.visible=progress>.12&&progress<.99;
  const anchorY=-2.8+pose.pageLift*5.8;
  for(let i=0;i<24;i++){const t=i/23;tetherPositions[i*3]=pose.x*(1-t)+.35*t+Math.sin(t*Math.PI)*.06;tetherPositions[i*3+1]=(pose.y-.9)*(1-t)+anchorY*t;tetherPositions[i*3+2]=pose.z*(1-t);}
  tetherGeometry.attributes.position.needsUpdate=true;
  return pose;
 }
 return {scene,camera,update};
}
