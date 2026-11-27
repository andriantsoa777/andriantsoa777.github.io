const version=new URL(import.meta.url).search;
const {launchProgress,LaunchSequence}=await import('./launch-math.js'+version);
function offsetWithin(node,root){let top=0;for(let e=node;e&&e!==root;e=e.offsetParent)top+=e.offsetTop;return top;}
export async function mountLaunch(dialog,view,onFinish){
 const zone=view.querySelector('[data-launch-deck]');if(!zone)return()=>{};
 const layer=document.createElement('div');layer.className='launch-layer';layer.hidden=true;layer.setAttribute('aria-hidden','true');
 const canvas=document.createElement('canvas');layer.append(canvas);dialog.append(layer);
 const status=zone.querySelector('[data-launch-status]'),instruction=zone.querySelector('.launch-instruction');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let destroyed=false,frame=0,last=0,time=0,progress=0,hiddenAt=0;
 const sequence=new LaunchSequence();
 let renderer,world,observer;const abort=new AbortController();
 const canMove=()=>innerHeight>=560&&!reduced.matches&&!document.body.classList.contains('motion-paused');
 function mode(){const enabled=canMove()&&!!renderer;zone.toggleAttribute('data-launch-ready',enabled);zone.toggleAttribute('data-launch-disabled',!enabled);
  status.textContent=enabled?'Prêt pour la suite.':'Poursuite sans animation.';
  instruction.textContent=enabled?'Déroulez encore : la fusée emporte ce dossier et rejoint le plan de mission.':'Le plan de mission vous attend sur le même bureau. Vous pouvez continuer directement.';
  if(!enabled){sequence.reset();progress=0;resetStyles();layer.hidden=true;}requestFrame();
 }
 function resetStyles(){dialog.style.setProperty('--launch-lift',0);dialog.style.setProperty('--launch-opacity',1);dialog.style.setProperty('--launch-scale',1);dialog.classList.remove('launch-armed');}
 function target(){return launchProgress(dialog.scrollTop,offsetWithin(zone,dialog),zone.offsetHeight,dialog.clientHeight);}
 function draw(now){frame=0;if(destroyed||document.hidden||!canMove()||!renderer)return;
  const dt=Math.min(last?(now-last)/1000:1/60,.1);last=now;time+=dt;
  const wanted=target();
  const wasArmed=sequence.armed,state=sequence.update(wanted,now,dt);progress=state.progress;
  dialog.classList.toggle('launch-armed',state.armed);
  if(state.armed&&!wasArmed)status.textContent='Décollage. Retour au plan de mission.';
  if(!state.armed&&wasArmed&&!state.finished)status.textContent='Le décollage est en attente.';
  const pose=world.update(progress,time,innerWidth<650);layer.hidden=progress<.005;layer.style.opacity=pose.opacity;
  dialog.style.setProperty('--launch-lift',pose.pageLift);dialog.style.setProperty('--launch-opacity',pose.pageOpacity);dialog.style.setProperty('--launch-scale',pose.pageScale);
  renderer.render(world.scene,world.camera);
  if(state.finished){onFinish();return;}
  if(state.armed||Math.abs(wanted-progress)>.001||wanted>.10)frame=requestAnimationFrame(draw);
 }
 function requestFrame(){if(!frame&&!destroyed)frame=requestAnimationFrame(draw);}
 function resize(){if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight,false);world.camera.aspect=innerWidth/innerHeight;world.camera.updateProjectionMatrix();}mode();}
 function destroy(){if(destroyed)return;destroyed=true;abort.abort();cancelAnimationFrame(frame);observer?.disconnect();resetStyles();layer.remove();
  if(world){const geometries=new Set(),materials=new Set();world.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of (Array.isArray(o.material)?o.material:[o.material]))materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
  renderer?.dispose();renderer?.forceContextLoss();
 }
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;renderer?.dispose();renderer=undefined;sequence.reset();mode();},{signal:abort.signal});
 dialog.addEventListener('scroll',requestFrame,{passive:true,signal:abort.signal});
 addEventListener('resize',resize,{signal:abort.signal});reduced.addEventListener('change',mode,{signal:abort.signal});
 document.addEventListener('motionchange',mode,{signal:abort.signal});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)hiddenAt=performance.now();else{if(hiddenAt)sequence.delay(performance.now()-hiddenAt);hiddenAt=0;requestFrame();}},{signal:abort.signal});
 try{const THREE=await import('./vendor/three.module.min.js');const {createRocket}=await import('./rocket-world.js'+version);
  if(!dialog.open){destroy();return()=>{};}
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'default'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.setClearColor(0,0);
  world=createRocket(THREE);observer=new ResizeObserver(requestFrame);observer.observe(view);resize();mode();
 }catch(error){console.info('La suite reste accessible sans la séquence 3D.',error);renderer?.dispose();renderer?.forceContextLoss();renderer=undefined;world=undefined;mode();}
 return destroy;
}
