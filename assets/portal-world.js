const {entryPose}=await import('./portal-math.js'+new URL(import.meta.url).search);
// Un ordinateur réellement modélisé. Le décor architectural est une image générée.
export function createComputer(THREE,onReady=()=>{}){
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.06,80);
  const version=new URL(import.meta.url).search;
  const environment=new THREE.TextureLoader().load('assets/cinema/observatory.webp'+version,onReady);
  environment.colorSpace=THREE.SRGBColorSpace;
  const uniforms={photo:{value:environment},zoom:{value:1},aspect:{value:1}};
  const background=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms,depthWrite:false,depthTest:false,toneMapped:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.999,1.);}',
    fragmentShader:`varying vec2 vUv;uniform sampler2D photo;uniform float zoom,aspect;
      void main(){vec2 fit=aspect>16./9.?vec2(1.,(16./9.)/aspect):vec2(aspect/(16./9.),1.);
      vec2 uv=(vUv-.5)*fit/zoom+.5;gl_FragColor=texture2D(photo,uv);
      #include <colorspace_fragment>
      }`}));background.renderOrder=-100;background.frustumCulled=false;scene.add(background);
  scene.add(new THREE.HemisphereLight('#d2e8ff','#412b17',2.2));
  const key=new THREE.DirectionalLight('#eaf3ff',4.3);key.position.set(-3,5,7);scene.add(key);
  const warm=new THREE.PointLight('#ffb66b',55,20);warm.position.set(5,2,2);scene.add(warm);
  const blue=new THREE.PointLight('#80b6fa',32,20);blue.position.set(-4,1,3);scene.add(blue);
  const computer=new THREE.Group();scene.add(computer);
  const dustGeometry=new THREE.BufferGeometry(),dustPositions=new Float32Array(100*3);
  for(let i=0;i<100;i++){dustPositions[i*3]=Math.sin(i*53.3)*7;dustPositions[i*3+1]=Math.cos(i*19.2)*4;dustPositions[i*3+2]=Math.sin(i*12.1)*4;}
  dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:'#e8c79a',size:.018,transparent:true,opacity:.33,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(dust);
  const metal=new THREE.MeshStandardMaterial({color:'#929da6',metalness:.84,roughness:.24});
  const dark=new THREE.MeshStandardMaterial({color:'#121b25',metalness:.7,roughness:.27});
  function box(w,h,d,x,y,z,mat=metal){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);computer.add(m);return m;}
  function rounded(w,h,r,depth){const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
    return new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.018,bevelThickness:.018,curveSegments:10});}
  const shell=new THREE.Mesh(rounded(4.78,2.94,.13,.13),metal);shell.position.z=-.05;computer.add(shell);
  const bezel=new THREE.Mesh(rounded(4.66,2.80,.10,.025),dark);bezel.position.z=.09;computer.add(bezel);
  box(.33,.62,.20,0,-1.72,-.02);box(1.25,.07,.78,0,-2.04,.15);
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1152;
  const ctx=canvas.getContext('2d');
  const displayTexture=new THREE.CanvasTexture(canvas);displayTexture.colorSpace=THREE.SRGBColorSpace;
  let displayMode='cv',cachedCv=null,missionStep=-1;
  const cv=new Image();cv.onload=()=>{cachedCv=cv;if(displayMode==='cv')drawDisplay(cv);else missionStep=-1;onReady();};cv.src='cv-preview.png'+version;
  function drawDisplay(image){
    ctx.fillStyle='#132331';ctx.fillRect(0,0,2048,1152);
    ctx.fillStyle='#263c4b';ctx.fillRect(0,0,2048,64);ctx.fillStyle='#e7d7bc';ctx.font='24px sans-serif';ctx.fillText('Nirina  /  Mon bureau',46,42);
    ctx.fillStyle='#fff';ctx.fillRect(90,110,650,920);if(image)ctx.drawImage(image,90,110,650,920);
    ctx.fillStyle='#f2ddbf';ctx.font='54px Georgia';ctx.fillText('Le papier ne dit pas tout.',850,230);
    const names=['JobCopilot','Auto Video Factory','LexPipe','Customer Churn Prediction','My Friends','Nirys','GospelKeys','FireCast','BankLens'];
    ctx.font='32px sans-serif';names.forEach((name,i)=>{ctx.fillStyle='#b88e5c';ctx.fillRect(850,300+i*70,36,28);ctx.fillStyle='#e7e5df';ctx.fillText(name,915,328+i*70);});
    ctx.font='23px sans-serif';ctx.fillStyle='#bdcad2';ctx.fillText('Des questions. Des données. Des projets.',850,1020);displayTexture.needsUpdate=true;
  }
  function drawMission(step){
    ctx.fillStyle='#102432';ctx.fillRect(0,0,2048,1152);
    ctx.fillStyle='#273e4c';ctx.fillRect(0,0,2048,64);ctx.fillStyle='#dec9aa';ctx.font='24px sans-serif';ctx.fillText('Nirina  /  De la candidature au système',46,42);
    ctx.fillStyle='#f4dec0';ctx.font='72px Georgia';ctx.fillText('Le CV devient un plan d’action.',100,205);
    ctx.fillStyle='#b9cbd4';ctx.font='28px sans-serif';ctx.fillText('Une architecture. Quatre responsabilités.',105,267);
    ctx.fillStyle='#eee5d6';ctx.fillRect(110,360,370,525);if(cachedCv)ctx.drawImage(cachedCv,110,360,370,525);
    ctx.fillStyle='#a9bdc8';ctx.font='26px sans-serif';ctx.fillText('Les faits du profil',110,935);
    ctx.strokeStyle='#ae8e5b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(480,620);ctx.lineTo(650,620);ctx.lineTo(650,422);ctx.lineTo(650,920);ctx.stroke();
    const flow=[['Collecter et structurer','Sources, normalisation, doublons'],['Évaluer la pertinence','Profil, critères, score expliqué'],['Préparer le dossier','Documents et interaction navigateur'],['Valider et suivre','Contrôle humain, traces, SMTP / IMAP']];
    flow.forEach(([label,detail],i)=>{const y=410+i*155;ctx.fillStyle=i===step?'#f2cc95':'#829eae';ctx.beginPath();ctx.arc(650,y+15,i===step?12:7,0,Math.PI*2);ctx.fill();ctx.font='42px Georgia';ctx.fillText(label,710,y+20);ctx.fillStyle='#b2c6d1';ctx.font='25px sans-serif';ctx.fillText(detail,712,y+65);});
    ctx.fillStyle='#cbb493';ctx.font='25px sans-serif';ctx.fillText('Concevoir le workflow, pas seulement générer du texte.',105,1050);displayTexture.needsUpdate=true;
  }
  function setMode(mode){if(displayMode===mode)return;displayMode=mode;missionStep=-1;if(mode==='cv')drawDisplay(cachedCv);}
  drawDisplay();const display=new THREE.Mesh(new THREE.PlaneGeometry(4.43,2.49),new THREE.MeshBasicMaterial({map:displayTexture,toneMapped:false}));display.position.set(0,.025,.147);display.name='cv-screen';computer.add(display);
  const cameraDot=new THREE.Mesh(new THREE.SphereGeometry(.016,12,8),new THREE.MeshBasicMaterial({color:'#637d91'}));cameraDot.position.set(0,1.34,.15);computer.add(cameraDot);
  const keyboard=box(2.0,.055,.65,-.15,-2.00,1.12);keyboard.rotation.x=.06;
  const keys=new THREE.InstancedMesh(new THREE.BoxGeometry(.115,.018,.105),new THREE.MeshStandardMaterial({color:'#293541',roughness:.5}),60);
  const dummy=new THREE.Object3D();for(let i=0;i<60;i++){dummy.position.set(-1+(i%15)*.128,-1.961,.89+Math.floor(i/15)*.143);dummy.updateMatrix();keys.setMatrixAt(i,dummy.matrix);}computer.add(keys);
  const mouse=new THREE.Mesh(new THREE.SphereGeometry(.22,24,16),metal);mouse.scale.set(.75,.24,1.3);mouse.position.set(1.25,-1.97,1.09);computer.add(mouse);
  // Un fin anneau de lumière sur la tranche, pas une géométrie flottante arbitraire.
  const led=new THREE.Mesh(new THREE.BoxGeometry(.52,.012,.012),new THREE.MeshBasicMaterial({color:'#edc99a'}));led.position.set(0,-1.37,.15);computer.add(led);
  function update(progress,time,mobile=false){
    setMode('cv');computer.rotation.set(0,0,0);
    const pose=entryPose(progress,mobile);computer.position.set(mobile?0:1.5,mobile?-.42:.65,0);
    const targetY=pose.y+(mobile?.3:0)*(1-pose.travel);
    camera.position.set(pose.x,targetY+.14*(1-pose.travel),pose.z);camera.lookAt(pose.x,targetY,0);
    uniforms.aspect.value=camera.aspect;uniforms.zoom.value=1+pose.travel*.10;
    shell.material.roughness=.24+Math.sin(time*.25)*.01;
    dust.rotation.y=time*.005;warm.intensity=55+Math.sin(time*.3)*3;
    return pose;
  }
  function updateMission(progress,time,mobile=false){
    const p=Math.max(0,Math.min(1,progress));setMode('mission');
    const step=Math.min(3,Math.max(0,Math.floor((p-.35)/.6*4)));if(step!==missionStep){missionStep=step;drawMission(step);}
    computer.position.set(mobile?0:1.5,mobile?-.42:.65,0);computer.rotation.set(0,-.045-p*.065,0);
    const x=mobile?0:p*.35,y=mobile?-1.92:.9,z=mobile?15:9-p*.7;
    camera.position.set(x,y+.12,z);camera.lookAt(x,y,0);
    uniforms.aspect.value=camera.aspect;uniforms.zoom.value=1.015+p*.05;
    dust.rotation.y=time*.005;warm.intensity=55+Math.sin(time*.3)*3;
    return {progress:p,step};
  }
  return {scene,camera,update,updateMission};
}
