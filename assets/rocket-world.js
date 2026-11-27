const {rocketPose,paperVertices}=await import('./launch-math.js'+new URL(import.meta.url).search);
// The document itself folds into a paper rocket. No separate vehicle.
export function createRocket(THREE,{title='Nirina / Projets',text='',texture=null}={}){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,80);camera.position.set(0,0,8);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight('#e1efff','#163543',2.4));
 const key=new THREE.DirectionalLight('#ffecd0',3);key.position.set(-3,4,6);scene.add(key);
 const fill=new THREE.DirectionalLight('#8ac4ed',1.5);fill.position.set(3,-1,4);scene.add(fill);
 let ownedTexture=null;
 if(!texture&&typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1400;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#f4eee2';ctx.fillRect(0,0,1024,1400);ctx.fillStyle='#b99057';ctx.fillRect(72,72,880,3);
  ctx.fillStyle='#5c7480';ctx.font='24px sans-serif';ctx.fillText('NIRINA ANDRIANTSOA / PROJETS',72,120);
  function lines(value,font,y,max=860,lineHeight=42){ctx.font=font;let line='';for(const word of value.split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width>max&&line){ctx.fillText(line,72,y);y+=lineHeight;line=word;}else line=next;}ctx.fillText(line,72,y);return y+lineHeight;}
  ctx.fillStyle='#18384a';let y=lines(title,'64px Georgia',235,860,76)+65;
  ctx.fillStyle='#3f5965';lines(text,'30px sans-serif',y,860,48);
  ctx.strokeStyle='#b1b8af';ctx.lineWidth=1;for(let y=1080;y<1290;y+=44){ctx.beginPath();ctx.moveTo(72,y);ctx.lineTo(952,y);ctx.stroke();}
  ownedTexture=new THREE.CanvasTexture(canvas);ownedTexture.colorSpace=THREE.SRGBColorSpace;texture=ownedTexture;
 }
 const geometry=new THREE.BufferGeometry();const initial=paperVertices(0);geometry.setAttribute('position',new THREE.Float32BufferAttribute(initial.positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(initial.uvs,2));geometry.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({color:'#fffaf0',map:texture,roughness:.82,metalness:0,side:THREE.DoubleSide});
 const paper=new THREE.Mesh(geometry,material);paper.name='folding-document';scene.add(paper);
 const creaseGeometry=new THREE.BufferGeometry();const creasePositions=new Float32Array(12);creaseGeometry.setAttribute('position',new THREE.BufferAttribute(creasePositions,3));
 const crease=new THREE.LineSegments(creaseGeometry,new THREE.LineBasicMaterial({color:'#bf955c',transparent:true,opacity:.35}));paper.add(crease);
 const trailGeometry=new THREE.BufferGeometry(),trailPoints=new Float32Array(24*3);trailGeometry.setAttribute('position',new THREE.BufferAttribute(trailPoints,3));
 const trailMaterial=new THREE.LineBasicMaterial({color:'#eecb91',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});const trail=new THREE.Line(trailGeometry,trailMaterial);scene.add(trail);
 function update(progress,time,mobile=false){const pose=rocketPose(progress,mobile),shape=paperVertices(pose.fold);geometry.attributes.position.array.set(shape.positions);geometry.attributes.position.needsUpdate=true;geometry.computeVertexNormals();
  const viewportHeight=2*Math.tan(camera.fov*Math.PI/360)*camera.position.z;
  const scale=Math.min(viewportHeight*.78/2.9,viewportHeight*camera.aspect*.8/2);
  paper.position.set(pose.x,pose.y,pose.z);paper.rotation.set(pose.pitch,pose.yaw,pose.rotation);paper.scale.setScalar(scale*pose.scale);
  const b=pose.fold;creasePositions.set([0,1.45,.014,0,-1.45+b*.73,.02+b*.45,-1+ b*.16,-b*1.25,.015,1-b*.16,-b*1.25,.015]);creaseGeometry.attributes.position.needsUpdate=true;
  trailMaterial.opacity=pose.trail*.65;for(let i=0;i<24;i++){const t=i/23;trailPoints[i*3]=pose.x-t*.65;trailPoints[i*3+1]=pose.y-t*(2+pose.trail*3);trailPoints[i*3+2]=pose.z-.15;}trailGeometry.attributes.position.needsUpdate=true;
  return pose;
 }
 return{scene,camera,update,dispose(){ownedTexture?.dispose();}};
}
