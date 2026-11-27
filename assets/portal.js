const version=new URL(import.meta.url).search;
const {smooth,glide}=await import('./portal-math.js'+version);
const entry=document.getElementById('depart'),canvas=document.getElementById('portal-scene'),desktop=document.getElementById('desktop');
const copy=document.querySelector('.portal-copy'),preference=matchMedia('(prefers-reduced-motion: reduce)');
let requestFrame=()=>{},isInside=true;
function target(){return Math.max(0,Math.min(1,(scrollY-entry.offsetTop)/Math.max(1,entry.offsetHeight-innerHeight)));}
function visibility(){
 const before=isInside;isInside=scrollY<entry.offsetTop+entry.offsetHeight-innerHeight*.08;
 document.body.classList.toggle('desktop-on',scrollY>=desktop.offsetTop-innerHeight*.08&&scrollY<desktop.offsetTop+desktop.offsetHeight-innerHeight*.15);
 document.body.classList.toggle('portal-on',isInside&&scrollY<entry.offsetHeight-innerHeight*.93);
 document.body.classList.toggle('motion-paused',preference.matches);
 canvas.hidden=!isInside||document.body.classList.contains('portal-failed');requestFrame();
 if(before!==isInside)document.dispatchEvent(new Event('portalvisibility'));
}
addEventListener('scroll',visibility,{passive:true});addEventListener('resize',visibility);
document.addEventListener('portalvisibility',()=>requestFrame());document.addEventListener('story-handoff',visibility);
preference.addEventListener('change',visibility);document.fonts?.ready.then(visibility);
// The invitation is a camera move, not an instant jump past the prologue.
let cancelEntry=()=>{};
entry.querySelector('.begin').addEventListener('click',event=>{
 if(preference.matches||!document.body.classList.contains('portal-ready'))return;
 event.preventDefault();cancelEntry();
 const abort=new AbortController(),start=performance.now(),from=scrollY,to=desktop.offsetTop;let frame=0;
 function cancel(){cancelAnimationFrame(frame);abort.abort();}
 cancelEntry=cancel;
 for(const name of ['wheel','touchstart','pointerdown','keydown','resize'])addEventListener(name,cancel,{passive:true,signal:abort.signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();},{signal:abort.signal});
 preference.addEventListener('change',cancel,{signal:abort.signal});
 function advance(now){const p=Math.max(0,Math.min(1,(now-start)/1800));scrollTo({top:from+(to-from)*glide(p),behavior:'auto'});
  if(p<1)frame=requestAnimationFrame(advance);
  else{cancel();history.replaceState(null,'','#desktop');document.getElementById('desktop-title')?.focus({preventScroll:true});}
 }
 frame=requestAnimationFrame(advance);
});
try{
 const THREE=await import('./vendor/three.module.min.js');
 const {createComputer}=await import('./portal-world.js'+version);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'default'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const world=createComputer(THREE,()=>requestFrame());let frame=0,last=0,current=target(),lost=false;
 function draw(now){frame=0;if(lost||document.hidden||!isInside||document.body.classList.contains('experience-open')){last=0;return;}
  const wanted=target(),dt=Math.min(last?(now-last)/1000:1/60,.1);last=now;
  current=preference.matches?wanted:current+(wanted-current)*(1-Math.exp(-dt*13));
  if(current>.9995){canvas.style.opacity=0;copy.style.opacity=0;return;}
  const pose=world.update(preference.matches?0:current,0,innerWidth<650);
  canvas.style.opacity=preference.matches?1-smooth((current-.8)/.2):pose.opacity;
  copy.style.opacity=preference.matches?1:pose.copyOpacity;copy.style.transform=preference.matches?'none':`translateY(${pose.copyOffset}px)`;
  entry.style.setProperty('--portal-focus',preference.matches?0:pose.focus);
  renderer.render(world.scene,world.camera);
  // No ambient loop. Only the visitor's gesture and its short easing move the camera.
  if(!preference.matches&&Math.abs(wanted-current)>.0003)frame=requestAnimationFrame(draw);
 }
 requestFrame=()=>{if(!frame&&isInside&&!document.hidden)frame=requestAnimationFrame(draw);};
 function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight,false);world.camera.aspect=innerWidth/innerHeight;world.camera.updateProjectionMatrix();visibility();}
 document.addEventListener('visibilitychange',()=>{last=0;requestFrame();});addEventListener('resize',resize);
 canvas.addEventListener('webglcontextlost',()=>{lost=true;cancelAnimationFrame(frame);canvas.hidden=true;copy.style.opacity=1;copy.style.transform='none';document.body.classList.remove('portal-ready');document.body.classList.add('portal-failed');});
 resize();document.body.classList.add('portal-ready');
}catch(error){canvas.hidden=true;document.body.classList.add('portal-failed');console.info('Le bureau reste accessible sans WebGL.',error);}
visibility();
