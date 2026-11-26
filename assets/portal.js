const version=new URL(import.meta.url).search;
const entry=document.getElementById('depart'),canvas=document.getElementById('portal-scene');
const copy=document.querySelector('.portal-copy'),pause=document.getElementById('portal-pause');
const preference=matchMedia('(prefers-reduced-motion: reduce)');let paused=preference.matches;
let requestFrame=()=>{},isInside=true;
function visibility(){
  const inside=scrollY<entry.offsetTop+entry.offsetHeight-innerHeight*.08;
  const desktop=document.getElementById('desktop');
  document.body.classList.toggle('desktop-on',scrollY>=desktop.offsetTop-innerHeight*.08&&scrollY<desktop.offsetTop+desktop.offsetHeight-innerHeight*.15);
  if(inside!==isInside){isInside=inside;document.dispatchEvent(new Event('portalvisibility'));}
  document.body.classList.toggle('portal-on',inside&&scrollY<entry.offsetHeight-innerHeight*.93);
  canvas.hidden=!inside;requestFrame();
}
document.addEventListener('portalvisibility',()=>requestFrame());
addEventListener('scroll',visibility,{passive:true});
addEventListener('resize',visibility);
try{
  const THREE=await import('./vendor/three.module.min.js');
  const {createComputer}=await import('./portal-world.js'+version);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'default'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const world=createComputer(THREE,()=>requestFrame());let frame=0,last=0,time=0;
  function draw(now){frame=0;if(document.hidden||!isInside||document.body.classList.contains('experience-open'))return;
    const dt=Math.min(last?(now-last)/1000:1/60,.1);last=now;if(!paused)time+=dt;
    const progress=Math.max(0,Math.min(1,(scrollY-entry.offsetTop)/(entry.offsetHeight-innerHeight)));
    if(progress>=1){canvas.style.opacity=0;copy.style.opacity=0;return;}
    const pose=world.update(progress,time,innerWidth<650);
    canvas.style.opacity=pose.opacity;copy.style.opacity=pose.copyOpacity;
    // La caméra est pilotée directement par le défilement, même en pause.
    renderer.render(world.scene,world.camera);if(!paused)frame=requestAnimationFrame(draw);
  }
  requestFrame=()=>{if(!frame&&isInside&&!document.hidden)frame=requestAnimationFrame(draw);};
  function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight,false);world.camera.aspect=innerWidth/innerHeight;world.camera.updateProjectionMatrix();requestFrame();}
  function button(){pause.textContent=paused?'Animer le décor':'Pause du décor';pause.setAttribute('aria-pressed',String(paused));requestFrame();}
  pause.hidden=false;pause.addEventListener('click',()=>{paused=!paused;button();});
  preference.addEventListener('change',e=>{paused=e.matches;button();});
  document.addEventListener('visibilitychange',()=>{last=0;requestFrame();});
  addEventListener('resize',resize);
  canvas.addEventListener('webglcontextlost',()=>{cancelAnimationFrame(frame);canvas.hidden=true;pause.hidden=true;document.body.classList.remove('portal-ready','portal-on');});
  resize();button();document.body.classList.add('portal-ready');
}catch(error){canvas.hidden=true;pause.hidden=true;document.body.classList.add('portal-failed');console.info('Le bureau reste accessible sans WebGL.',error);}
visibility();
