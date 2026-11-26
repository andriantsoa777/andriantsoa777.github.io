// Scènes procédurales : géométrie réelle en profondeur, aucun média distant.
// Le contenu HTML ne dépend jamais du chargement de WebGL ou de ce module.
const canvas = document.getElementById('scene');
const motion = document.getElementById('motion');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let paused = preference.matches;
let selected = 'hero';
const sections = [...document.querySelectorAll('[data-world]')];
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio);
  if (visible[0]) { selected = visible[0].target.dataset.world; requestFrame(); }
}, {rootMargin:'-15% 0px -15% 0px', threshold:[0,.1,.3,.5,.7]});
sections.forEach(s => observer.observe(s));
let requestFrame = () => {};
try {
  const THREE = await import('./vendor/three.module.min.js');
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'});
  renderer.setClearColor(0x080e19,0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,100);
  camera.position.z=12;
  const group = new THREE.Group(); scene.add(group);
  const count = innerWidth < 600 ? 420 : 840;
  const pos = new Float32Array(count*3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const dots = new THREE.Points(geometry,new THREE.PointsMaterial({color:0xa2eee0,size:.027,transparent:true,opacity:.85,depthWrite:false}));
  group.add(dots);
  const shapes = {};
  const tau = Math.PI*2;
  function shape(name) {
    if (shapes[name]) return shapes[name];
    const a = new Float32Array(count*3);
    for(let i=0;i<count;i++) {
      const t=i/count, angle=i*2.3999632297;
      let x,y,z;
      if(name==='lexpipe') { const theta=t*tau*7; x=Math.cos(theta)*1.75; z=Math.sin(theta)*1.75; y=(t-.5)*5; }
      else if(name==='nirys'||name==='gospelkeys') { const band=i%48; x=(band/47-.5)*6; const wave=Math.sin(band*.36)*.7+1; y=((Math.floor(i/48)/(count/48))-.5)*wave*3; z=Math.sin(t*tau*3)*.6; }
      else if(name==='factory') { const frame=i%5; const q=Math.floor(i/5)/(count/5)*4; const u=q%1; const side=Math.floor(q); x=(side===0?-1.7+u*3.4:side===1?1.7:side===2?1.7-u*3.4:-1.7); y=(side===0?-1:side===1?-1+u*2:side===2?1:1-u*2); z=(frame-2)*.85; }
      else if(name==='firecast') { const col=i%35, row=Math.floor(i/35); x=(col/34-.5)*6; z=(row/(count/35)-.5)*4; y=Math.sin(x*1.1)*Math.cos(z*1.5)*.8-.4; }
      else if(name==='friends') { const friend=i%6; const theta=friend/6*tau; const local=angle; const r=.35; x=Math.cos(theta)*2+Math.cos(local)*r; y=Math.sin(theta)*2+Math.sin(local)*r; z=Math.sin(i*.7)*.5; }
      else if(name==='jobcopilot') { const ring=i%3; const theta=t*tau*3; x=Math.cos(theta)*(1.3+ring*.45); y=Math.sin(theta)*(1.3+ring*.45); z=Math.sin(theta*3)*.6+(ring-1)*.7; }
      else { y=1-2*t; const r=Math.sqrt(1-y*y); x=Math.cos(angle)*r*2.3; z=Math.sin(angle)*r*2.3; y*=2.3; }
      a.set([x,y,z],i*3);
    }
    shapes[name]=a;return a;
  }
  pos.set(shape('hero'));
  const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25,1),new THREE.MeshBasicMaterial({color:0x6ccfca,wireframe:true,transparent:true,opacity:.13}));
  group.add(sphere);
  const ringMaterial=new THREE.MeshBasicMaterial({color:0x9ee6dc,transparent:true,opacity:.22});
  for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(2.65+i*.2,.004,4,100),ringMaterial);ring.rotation.set(.6+i*.5,.2+i*.4,0);group.add(ring);}
  const starsPos=new Float32Array(180*3);
  // Déterministe : pas de différence aléatoire entre deux chargements.
  for(let i=0;i<starsPos.length;i++)starsPos[i]=(Math.sin(i*127.1)*43758.5453%1)*16;
  const starsGeometry=new THREE.BufferGeometry();starsGeometry.setAttribute('position',new THREE.BufferAttribute(starsPos,3));
  scene.add(new THREE.Points(starsGeometry,new THREE.PointsMaterial({color:0x94b4cf,size:.012,transparent:true,opacity:.45})));
  const pointer={x:0,y:0};
  let frameId=0,last=0,time=0,initialized=false;
  function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();group.position.x=innerWidth>900?2.5:.6;group.scale.setScalar(innerWidth>600?1:.8);requestFrame();}
  function draw(now){
    frameId=0;if(document.hidden)return;
    const dt=Math.min(last?(now-last)/1000:1/60,.05);last=now;
    if(!paused)time+=dt;
    const target=shape(selected);
    const instant=paused||!initialized;
    for(let i=0;i<pos.length;i++)pos[i]+=(target[i]-pos[i])*(instant?1:Math.min(1,dt*3));
    geometry.attributes.position.needsUpdate=true;
    group.rotation.y=paused?.25:time*.09+pointer.x*.12;
    group.rotation.x=selected==='firecast'?.5:-.1+(paused?0:pointer.y*.08);
    sphere.rotation.y=time*.12;
    sphere.material.opacity=selected==='hero'?.13:.035;
    renderer.render(scene,camera);initialized=true;
    if(!paused)frameId=requestAnimationFrame(draw);
  }
  requestFrame=()=>{if(!frameId&&!document.hidden)frameId=requestAnimationFrame(draw);};
  function syncButton(){motion.textContent=paused?'Activer l’animation 3D':'Mettre l’animation en pause';motion.setAttribute('aria-pressed',String(paused));requestFrame();}
  motion.hidden=false;motion.addEventListener('click',()=>{paused=!paused;syncButton();});
  preference.addEventListener('change',e=>{paused=e.matches;syncButton();});
  addEventListener('pointermove',e=>{if(!paused){pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5;}},{passive:true});
  addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frameId);frameId=0;}else requestFrame();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frameId);frameId=0;canvas.hidden=true;motion.hidden=true;});
  resize();syncButton();
} catch(error) {
  canvas.hidden=true;motion.hidden=true;
  // Repli intentionnel sur l’atmosphère CSS. Les liens et textes restent disponibles.
  console.info('Décor 3D indisponible ; portfolio en mode statique.');
}
