const version=new URL(import.meta.url).search;
const {missionProgress,smooth}=await import('./portal-math.js'+version);
const entry=document.getElementById('depart'),canvas=document.getElementById('portal-scene'),mission=document.getElementById('jobcopilot');
const copy=document.querySelector('.portal-copy'),pause=document.getElementById('portal-pause');
const opening=mission.querySelector('.mission-opening'),blueprint=mission.querySelector('.mission-blueprint');
const preference=matchMedia('(prefers-reduced-motion: reduce)');let paused=preference.matches;
let requestFrame=()=>{},isInside=true,missionVisible=false;
function visibility(){
  const wasInside=isInside,wasCovered=document.body.classList.contains('mission-cover');
  const inEntry=scrollY<entry.offsetTop+entry.offsetHeight-innerHeight*.08;
  const top=mission.offsetTop,end=top+mission.offsetHeight;
  missionVisible=scrollY>=top-innerHeight*.22&&scrollY<end-innerHeight*.04;
  isInside=inEntry||missionVisible;
  const p=missionProgress(scrollY,top,mission.offsetHeight,innerHeight);
  const hero=1-smooth((p-.22)/.13),reveal=smooth((p-.37)/.13);
  mission.style.setProperty('--mission-hero',hero);mission.style.setProperty('--mission-reveal',reveal);
  const stacked=innerWidth>=800&&innerHeight>=850&&!preference.matches;opening.inert=stacked&&hero<.1;blueprint.inert=stacked&&reveal<.1;
  const step=Math.min(3,Math.max(0,Math.floor((p-.35)/.6*4)));
  mission.querySelectorAll('[data-mission-step]').forEach((el,i)=>el.toggleAttribute('data-current',i===step));
  const alpha=Math.min(smooth((scrollY-top+innerHeight*.22)/(innerHeight*.22)),1-smooth((scrollY-end+innerHeight*.8)/(innerHeight*.76)));
  canvas.style.opacity=missionVisible?alpha:1;
  const desktop=document.getElementById('desktop');
  document.body.classList.toggle('desktop-on',scrollY>=desktop.offsetTop-innerHeight*.08&&scrollY<desktop.offsetTop+desktop.offsetHeight-innerHeight*.15);
  document.body.classList.toggle('portal-on',inEntry&&scrollY<entry.offsetHeight-innerHeight*.93);
  document.body.classList.toggle('mission-on',missionVisible);
  document.body.classList.toggle('mission-cover',missionVisible&&alpha>.995&&document.body.classList.contains('portal-ready'));
  canvas.hidden=!isInside;requestFrame();
  if(wasInside!==isInside||wasCovered!==document.body.classList.contains('mission-cover'))document.dispatchEvent(new Event('portalvisibility'));
}
document.addEventListener('portalvisibility',()=>requestFrame());
document.addEventListener('mission-handoff',visibility);
addEventListener('scroll',visibility,{passive:true});addEventListener('resize',visibility);
preference.addEventListener('change',visibility);if(document.fonts)document.fonts.ready.then(visibility);document.body.classList.add('mission-ready');
try{
 const THREE=await import('./vendor/three.module.min.js');
 const {createComputer}=await import('./portal-world.js'+version);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'default'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const world=createComputer(THREE,()=>requestFrame());let frame=0,last=0,time=0;
 function draw(now){frame=0;if(document.hidden||!isInside||document.body.classList.contains('experience-open'))return;
  const dt=Math.min(last?(now-last)/1000:1/60,.1);last=now;if(!paused)time+=dt;
  if(missionVisible){const p=missionProgress(scrollY,mission.offsetTop,mission.offsetHeight,innerHeight);world.updateMission(p,time,innerWidth<800);}
  else{const progress=Math.max(0,Math.min(1,(scrollY-entry.offsetTop)/(entry.offsetHeight-innerHeight)));
   if(progress>=1){canvas.style.opacity=0;copy.style.opacity=0;return;}
   const pose=world.update(progress,time,innerWidth<650);canvas.style.opacity=pose.opacity;copy.style.opacity=pose.copyOpacity;
  }
  renderer.render(world.scene,world.camera);if(!paused)frame=requestAnimationFrame(draw);
 }
 requestFrame=()=>{if(!frame&&isInside&&!document.hidden)frame=requestAnimationFrame(draw);};
 function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight,false);world.camera.aspect=innerWidth/innerHeight;world.camera.updateProjectionMatrix();visibility();}
 function button(){pause.textContent=paused?'Animer le décor':'Pause du décor';pause.setAttribute('aria-pressed',String(paused));document.body.classList.toggle('motion-paused',paused);requestFrame();}
 pause.hidden=false;pause.addEventListener('click',()=>{paused=!paused;button();document.dispatchEvent(new CustomEvent('motionchange',{detail:{paused}}));});
 document.addEventListener('motionchange',e=>{paused=e.detail.paused;button();});
 preference.addEventListener('change',e=>{paused=e.matches;button();});
 document.addEventListener('visibilitychange',()=>{last=0;requestFrame();});addEventListener('resize',resize);
 canvas.addEventListener('webglcontextlost',()=>{cancelAnimationFrame(frame);canvas.hidden=true;pause.hidden=true;document.body.classList.remove('portal-ready','mission-cover');});
 resize();button();document.body.classList.add('portal-ready');
}catch(error){canvas.hidden=true;pause.hidden=true;document.body.classList.add('portal-failed');console.info('Le bureau reste accessible sans WebGL.',error);}
visibility();
