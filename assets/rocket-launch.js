const version=new URL(import.meta.url).search;
const {launchProgress,LaunchSequence,LaunchInput}=await import('./launch-math.js'+version);
function offsetWithin(node,root){let top=0;for(let e=node;e&&e!==root;e=e.offsetParent)top+=e.offsetTop;return top;}
export async function mountLaunch(dialog,view,onFinish){
 const zone=view.querySelector('[data-launch-deck]');if(!zone)return()=>{};
 const layer=document.createElement('div');layer.className='launch-layer';layer.hidden=true;layer.setAttribute('aria-hidden','true');
 const canvas=document.createElement('canvas');layer.append(canvas);dialog.append(layer);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let destroyed=false,frame=0,last=0,time=0,progress=0,hiddenAt=0;
 const sequence=new LaunchSequence(),input=new LaunchInput();
 let renderer,world,observer;const abort=new AbortController();
 const canMove=()=>innerHeight>=560&&!reduced.matches&&!document.body.classList.contains('motion-paused');
 function mode(){const enabled=canMove()&&!!renderer;zone.toggleAttribute('data-launch-ready',enabled);zone.toggleAttribute('data-launch-disabled',!enabled);
  zone.toggleAttribute('data-launch-manual',input.manual);
  if(!enabled){sequence.reset();progress=0;resetStyles();layer.hidden=true;}requestFrame();
 }
 function resetStyles(){dialog.style.setProperty('--launch-lift',0);dialog.style.setProperty('--launch-opacity',1);dialog.style.setProperty('--launch-scale',1);dialog.classList.remove('launch-armed');}
 function target(){return launchProgress(dialog.scrollTop,offsetWithin(zone,dialog),zone.offsetHeight,dialog.clientHeight);}
 function draw(now){frame=0;if(destroyed||document.hidden||!canMove()||!renderer)return;
  const dt=Math.min(last?(now-last)/1000:1/60,.1);last=now;time+=dt;
  const wanted=input.target(target(),now);
  const state=sequence.update(wanted,now,dt);progress=state.progress;
  dialog.classList.toggle('launch-armed',state.armed);
  const pose=world.update(progress,time,innerWidth<650);layer.hidden=progress<.005;layer.style.opacity=pose.opacity;
  dialog.style.setProperty('--launch-lift',pose.pageLift);dialog.style.setProperty('--launch-opacity',pose.pageOpacity);dialog.style.setProperty('--launch-scale',pose.pageScale);
  renderer.render(world.scene,world.camera);
  if(state.finished){onFinish();return;}
  if(state.armed||Math.abs(wanted-progress)>.001||wanted>.10)frame=requestAnimationFrame(draw);
 }
 function requestFrame(){if(!frame&&!destroyed)frame=requestAnimationFrame(draw);}
 function resize(){if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight,false);world.camera.aspect=innerWidth/innerHeight;world.camera.updateProjectionMatrix();}mode();}
 function destroy(){if(destroyed)return;destroyed=true;abort.abort();cancelAnimationFrame(frame);observer?.disconnect();resetStyles();layer.remove();
  if(world){world.dispose?.();const geometries=new Set(),materials=new Set();world.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of (Array.isArray(o.material)?o.material:[o.material]))materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
  renderer?.dispose();renderer?.forceContextLoss();
 }
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;renderer?.dispose();renderer=undefined;sequence.reset();mode();},{signal:abort.signal});
 function gesture(event){if(event.isTrusted){input.gesture(performance.now());zone.removeAttribute('data-launch-manual');requestFrame();}}
 dialog.addEventListener('wheel',gesture,{passive:true,signal:abort.signal});
 dialog.addEventListener('touchmove',gesture,{passive:true,signal:abort.signal});
 dialog.addEventListener('keydown',event=>{
  if(event.key==='Tab'){input.tab();zone.setAttribute('data-launch-manual','');sequence.reset();progress=0;resetStyles();requestFrame();return;}
  const editing=event.target.closest?.('input,textarea,select,video');
  const controlSpace=event.key===' '&&event.target.closest?.('a,button,summary');
  if(!editing&&!controlSpace&&['PageDown','End','ArrowDown',' '].includes(event.key))gesture(event);
 },{signal:abort.signal});
 dialog.addEventListener('focusin',event=>{if(event.target.closest?.('.launch-actions')){input.tab();zone.setAttribute('data-launch-manual','');sequence.reset();progress=0;resetStyles();requestFrame();}},{signal:abort.signal});
 dialog.addEventListener('scroll',event=>{if(event.isTrusted&&!input.manual){input.gesture(performance.now());zone.removeAttribute('data-launch-manual');}requestFrame();},{passive:true,signal:abort.signal});
 addEventListener('resize',resize,{signal:abort.signal});reduced.addEventListener('change',mode,{signal:abort.signal});
 document.addEventListener('motionchange',mode,{signal:abort.signal});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)hiddenAt=performance.now();else{if(hiddenAt)sequence.delay(performance.now()-hiddenAt);hiddenAt=0;requestFrame();}},{signal:abort.signal});
 try{const THREE=await import('./vendor/three.module.min.js');const {createRocket}=await import('./rocket-world.js'+version);
  if(!dialog.open){destroy();return()=>{};}
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'default'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.setClearColor(0,0);
  world=createRocket(THREE,{title:view.dataset.projectName,text:view.querySelector('.case-results>p:not(.eyebrow)')?.textContent||view.querySelector('.project-role')?.textContent||''});observer=new ResizeObserver(requestFrame);observer.observe(view);resize();mode();
 }catch(error){console.info('La suite reste accessible sans la séquence 3D.',error);renderer?.dispose();renderer?.forceContextLoss();renderer=undefined;world=undefined;mode();}
 return destroy;
}
