const {entryPose,burstPhase}=await import('./portal-math.js'+new URL(import.meta.url).search);
// Un ordinateur réellement modélisé. Le décor architectural est une image générée.
export function createComputer(THREE,onReady=()=>{}){
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.06,80);
  const version=new URL(import.meta.url).search;
  // Prêt quand le décor et l'écran sont chargés : l'accueil se dévoile en une fois, sans état intermédiaire.
  let pending=2,resolveReady;const ready=new Promise(r=>{resolveReady=r;});const loaded=()=>{onReady();if(--pending===0)resolveReady();};
  const environment=new THREE.TextureLoader().load('assets/cinema/observatory.webp'+version,loaded,undefined,loaded);
  environment.colorSpace=THREE.SRGBColorSpace;
  const uniforms={photo:{value:environment},zoom:{value:1},aspect:{value:1},dim:{value:.72}};
  const background=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms,depthWrite:false,depthTest:false,toneMapped:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.999,1.);}',
    fragmentShader:`varying vec2 vUv;uniform sampler2D photo;uniform float zoom,aspect,dim;
      void main(){vec2 fit=aspect>16./9.?vec2(1.,(16./9.)/aspect):vec2(aspect/(16./9.),1.);
      vec2 uv=(vUv-.5)*fit/zoom+.5;gl_FragColor=texture2D(photo,uv);
      // Décor en retrait tant que le texte d'accueil est lu ; il s'éclaire quand on descend.
      float vig=smoothstep(1.2,.3,length((vUv-vec2(.62,.5))*vec2(1.25,1.)));gl_FragColor.rgb*=mix(.45,1.,vig)*dim;
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
  let cachedCv=null;
  const cv=new Image();cv.onload=()=>{cachedCv=cv;drawDisplay(cv);samplePixels();loaded();};cv.onerror=loaded;cv.src='cv-preview.png'+version;
  function drawDisplay(image){
    ctx.fillStyle='#132331';ctx.fillRect(0,0,2048,1152);
    ctx.fillStyle='#263c4b';ctx.fillRect(0,0,2048,64);ctx.fillStyle='#e7d7bc';ctx.font='24px sans-serif';ctx.fillText('Nirina  /  Mon bureau',46,42);
    ctx.fillStyle='#fff';ctx.fillRect(90,110,650,920);if(image)ctx.drawImage(image,90,110,650,920);
    ctx.fillStyle='#f2ddbf';ctx.font='54px Georgia';ctx.fillText('Le papier ne dit pas tout.',850,230);
    const names=['JobCopilot','Auto Video Factory','LexPipe','Customer Churn Prediction','My Friends','Nirys','GospelKeys','FireCast','BankLens'];
    ctx.font='32px sans-serif';names.forEach((name,i)=>{ctx.fillStyle='#b88e5c';ctx.fillRect(850,300+i*70,36,28);ctx.fillStyle='#e7e5df';ctx.fillText(name,915,328+i*70);});
    ctx.font='23px sans-serif';ctx.fillStyle='#bdcad2';ctx.fillText('Des questions. Des données. Des projets.',850,1020);displayTexture.needsUpdate=true;
  }
  // L'écran devient une fenêtre : derrière lui, le même fond que le bureau HTML.
  const backdropOpacity={value:1};
  const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(4.43,2.49),new THREE.ShaderMaterial({toneMapped:false,transparent:true,uniforms:{uO:backdropOpacity},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 vUv;uniform float uO;void main(){vec2 d=(vUv-vec2(.75,.8))*vec2(1.,1.25);float r=length(d)/.95;
      vec3 c=r<.6?mix(vec3(.208,.318,.357),vec3(.075,.169,.227),r/.6):mix(vec3(.075,.169,.227),vec3(.063,.137,.204),clamp((r-.6)/.4,0.,1.));
      gl_FragColor=vec4(c,uO);}`}));backdrop.position.set(0,.025,.136);computer.add(backdrop);
  const GLSL_DELAY=`float hash(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
    float delayOf(vec2 uv,float seed){return .15+.38*(uv.x*.65+(1.-uv.y)*.35)+.09*seed;}
    float sweepGlow(float x,float s){return exp(-pow((x-s/.25*1.15+.075)*18.,2.))*(1.-smoothstep(.22,.32,s));}`;
  const W=320,H=180,burst={value:0},pixelScale={value:900};
  const display=new THREE.Mesh(new THREE.PlaneGeometry(4.43,2.49),new THREE.ShaderMaterial({toneMapped:false,transparent:true,
    uniforms:{map:{value:displayTexture},uS:burst},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 vUv;uniform sampler2D map;uniform float uS;${GLSL_DELAY}
      void main(){vec2 cell=floor(vUv*vec2(${W}.,${H}.));vec2 cu=(cell+.5)/vec2(${W}.,${H}.);
      if(uS>delayOf(cu,hash(cell)))discard;
      gl_FragColor=texture2D(map,vUv);gl_FragColor.rgb+=vec3(1.,.78,.5)*sweepGlow(vUv.x,uS)*.55;
      #include <colorspace_fragment>
      }`}));display.position.set(0,.025,.147);display.name='cv-screen';computer.add(display);
  // Un point par pixel de l'écran : ils reprennent sa couleur exacte au moment de partir.
  const count=W*H,positions=new Float32Array(count*3),colors=new Float32Array(count*3),cells=new Float32Array(count*2);
  for(let iy=0;iy<H;iy++)for(let ix=0;ix<W;ix++){const i=iy*W+ix,u=(ix+.5)/W,v=1-(iy+.5)/H;
    positions.set([-2.215+u*4.43,.025-1.245+v*2.49,.147],i*3);cells.set([ix,H-1-iy],i*2);colors.set([.07,.14,.19],i*3);}
  const pixelGeometry=new THREE.BufferGeometry();pixelGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  pixelGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));pixelGeometry.setAttribute('cell',new THREE.BufferAttribute(cells,2));
  const pixels=new THREE.Points(pixelGeometry,new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,
    uniforms:{uS:burst,uScale:pixelScale,uSize:{value:4.43/W*1.08}},
    vertexShader:`attribute vec3 color;attribute vec2 cell;uniform float uS,uScale,uSize;varying vec3 vColor;varying float vAlpha,vT;${GLSL_DELAY}
      void main(){vec2 uv=(cell+.5)/vec2(${W}.,${H}.);float seed=hash(cell);
      float t=clamp((uS-delayOf(uv,seed))/.38,0.,1.),e=t*t;vT=t;
      vec3 p=position;vec2 c=p.xy-vec2(0.,.025);float a=e*(1.2+seed*2.4)*(fract(seed*7.31)>.5?1.:-1.);
      c=mat2(cos(a),sin(a),-sin(a),cos(a))*c*(1.+e*(1.4+seed*2.2));p.xy=c+vec2(0.,.025);p.z+=e*(2.+seed*2.4);
      vec4 mv=modelViewMatrix*vec4(p,1.);float d=-mv.z;
      gl_PointSize=t>0.?min(uSize*(1.+t*1.6)*uScale/max(d,.01),36.):0.;
      vColor=max(mix(color,vec3(1.,.84,.6),t*.6),vec3(.3,.24,.17)*smoothstep(0.,.3,t))+vec3(1.,.8,.5)*sweepGlow(uv.x,uS)*.55;
      float lum=dot(color,vec3(.3,.59,.11));vAlpha=(1.-smoothstep(.7,1.,t))*mix(.45,1.,smoothstep(.1,.5,lum))*smoothstep(.12,.7,d)*step(.0001,t);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:'varying vec3 vColor;varying float vAlpha,vT;void main(){if(vAlpha<.003)discard;vec2 q=gl_PointCoord-.5;float r=dot(q,q);gl_FragColor=vec4(vColor,vAlpha*mix(1.,1.-smoothstep(.08,.25,r),smoothstep(0.,.25,vT)));}'}));
  pixels.frustumCulled=false;pixels.renderOrder=10;computer.add(pixels);
  function samplePixels(){try{const small=document.createElement('canvas');small.width=W;small.height=H;const c=small.getContext('2d');
    c.drawImage(canvas,0,0,W,H);const data=c.getImageData(0,0,W,H)?.data;if(!data)return;
    for(let i=0;i<count;i++)colors.set([data[i*4]/255,data[i*4+1]/255,data[i*4+2]/255],i*3);pixelGeometry.attributes.color.needsUpdate=true;}catch{}}
  drawDisplay();samplePixels();
  const cameraDot=new THREE.Mesh(new THREE.SphereGeometry(.016,12,8),new THREE.MeshBasicMaterial({color:'#637d91'}));cameraDot.position.set(0,1.34,.15);computer.add(cameraDot);
  const keyboard=box(2.0,.055,.65,-.15,-2.00,1.12);keyboard.rotation.x=.06;
  const keys=new THREE.InstancedMesh(new THREE.BoxGeometry(.115,.018,.105),new THREE.MeshStandardMaterial({color:'#293541',roughness:.5}),60);
  const dummy=new THREE.Object3D();for(let i=0;i<60;i++){dummy.position.set(-1+(i%15)*.128,-1.961,.89+Math.floor(i/15)*.143);dummy.updateMatrix();keys.setMatrixAt(i,dummy.matrix);}computer.add(keys);
  const mouse=new THREE.Mesh(new THREE.SphereGeometry(.22,24,16),metal);mouse.scale.set(.75,.24,1.3);mouse.position.set(1.25,-1.97,1.09);computer.add(mouse);
  // Un fin anneau de lumière sur la tranche, pas une géométrie flottante arbitraire.
  const led=new THREE.Mesh(new THREE.BoxGeometry(.52,.012,.012),new THREE.MeshBasicMaterial({color:'#edc99a'}));led.position.set(0,-1.37,.15);computer.add(led);
  // handoff > 0 : l'écran couvre la vue ; seul l'envol des pixels reste dessiné, par-dessus le bureau HTML.
  function update(progress,time,mobile=false,handoff=0){
    const overlay=handoff>0;background.visible=dust.visible=!overlay;computer.children.forEach(c=>{c.visible=!overlay||c===pixels||c===backdrop;});backdropOpacity.value=1-handoff;
    const pose=entryPose(progress,mobile,camera.aspect);computer.position.set(mobile?0:1.5,mobile?-.42:.65,0);
    computer.rotation.set((1-pose.travel)*.018,(1-pose.travel)*-.075,0);
    camera.position.set(pose.x,pose.y,pose.z);camera.lookAt(pose.lookX,pose.lookY,.147);camera.rotation.z+=pose.roll;
    uniforms.aspect.value=camera.aspect;uniforms.dim.value=.72+.28*Math.min(1,Math.max(0,progress/.3));uniforms.zoom.value=1+pose.travel*.12;
    burst.value=burstPhase(progress);led.material.color.setStyle(burst.value>0?'#ffd9a8':'#edc99a');
    shell.material.roughness=.24;dust.rotation.y=pose.travel*.08;warm.intensity=55+pose.travel*8;
    return pose;
  }
  // Taille des pixels à l'écran : dépend de la hauteur réelle du rendu.
  function setPixelHeight(px){pixelScale.value=px/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2));}
  return {scene,camera,update,setPixelHeight,ready};
}
