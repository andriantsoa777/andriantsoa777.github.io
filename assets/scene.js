const version=new URL(import.meta.url).search;
const {phaseAt,approach}=await import('./journey-math.js'+version);

const chapters=[...document.querySelectorAll('[data-chapter]')];
const railLinks=[...document.querySelectorAll('.journey-rail a')];
const progress=document.getElementById('rail-progress');
const caption=document.getElementById('scene-label');
const motion=document.getElementById('motion');
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let paused=preference.matches;
let requestFrame=()=>{};
let anchors=chapters.map(c=>c.offsetTop);
let active=-1;

function hud(phase){
  const index=Math.min(chapters.length-1,Math.max(0,Math.floor(phase+.12)));
  progress.style.setProperty('--progress',Math.min(phase/(chapters.length-.25),1));
  if(index===active)return;
  active=index;
  railLinks.forEach((a,i)=>i===index?a.setAttribute('aria-current','step'):a.removeAttribute('aria-current'));
  caption.textContent=railLinks[index].getAttribute('aria-label');
}
function onScroll(){hud(phaseAt(scrollY,anchors));requestFrame();}
addEventListener('scroll',onScroll,{passive:true});
function measure(){anchors=chapters.map(c=>c.offsetTop);onScroll();}
addEventListener('resize',measure);
if(document.fonts)document.fonts.ready.then(measure);

try{
  const THREE=await import('./vendor/three.module.min.js');
  const {createJourney}=await import('./journey-world.js'+version);
  await document.fonts.ready;
  const canvas=document.getElementById('scene');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x071624,0);
  const journey=createJourney(THREE,renderer,()=>requestFrame());
  let phase=phaseAt(scrollY,anchors),last=0,time=0,frameId=0;
  const small=()=>innerWidth<650;
  function resize(){
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,small()?1.25:1.5));
    renderer.setSize(innerWidth,innerHeight,false);
    journey.camera.aspect=innerWidth/innerHeight;journey.camera.updateProjectionMatrix();measure();requestFrame();
  }
  function draw(now){
    frameId=0;if(document.hidden||(document.body.classList.contains('portal-on')||document.body.classList.contains('experience-open')||document.body.classList.contains('desktop-on')))return;
    const dt=Math.min(last?(now-last)/1000:1/60,.1);last=now;
    const target=phaseAt(scrollY,anchors);
    phase=paused?target:approach(phase,target,dt);
    if(!paused)time+=dt;
    journey.update(phase,time,small(),paused);
    renderer.render(journey.scene,journey.camera);
    if(!paused)frameId=requestAnimationFrame(draw);
  }
  requestFrame=()=>{if(!frameId&&!document.hidden)frameId=requestAnimationFrame(draw);};
  function button(){motion.textContent=paused?'Animer la traversée':'Pause de l’animation';motion.setAttribute('aria-pressed',String(paused));requestFrame();}
  motion.hidden=false;motion.addEventListener('click',()=>{paused=!paused;button();});
  preference.addEventListener('change',e=>{paused=e.matches;button();});
  addEventListener('resize',resize);
  document.addEventListener('portalvisibility',()=>requestFrame());
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frameId);frameId=0;}else requestFrame();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frameId);frameId=0;canvas.hidden=true;motion.hidden=true;document.body.classList.remove('scene-ready');document.body.classList.add('no-webgl');});
  resize();button();document.body.classList.add('scene-ready');
}catch(error){
  document.getElementById('scene').hidden=true;motion.hidden=true;document.body.classList.add('no-webgl');
  console.info('La traversée reste lisible sans son décor 3D.',error);
}
onScroll();
