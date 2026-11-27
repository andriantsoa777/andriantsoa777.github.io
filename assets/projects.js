// Dossiers explicatifs : contenu HTML sourcé, aucune simulation d’application.
const version=new URL(import.meta.url).search;
const {assetUrl}=await import('./journey-math.js'+version);
const sheets=new Map([...document.querySelectorAll('[data-project-sheet]')].map(el=>[el.dataset.projectSheet,el]));
if(typeof HTMLDialogElement!=='undefined'){
 const dialog=document.createElement('dialog');dialog.className='experience project-window';dialog.setAttribute('aria-labelledby','project-window-heading');
 dialog.innerHTML='<div class="experience-background" aria-hidden="true"></div><header class="experience-top"><span class="project-path">Nirina / Projets</span><button type="button" class="project-index-button">Les dossiers</button><button type="button" class="dialog-close">Fermer le dossier</button></header><div class="project-window-content"></div>';
 const content=dialog.querySelector('.project-window-content'),back=dialog.querySelector('.project-index-button'),close=dialog.querySelector('.dialog-close');
 let previous=null,releaseLaunch=()=>{},generation=0,releaseHandoff=()=>{};
 document.body.append(dialog);document.body.classList.add('ui-ready');
 function stopVideo(){content.querySelectorAll('video').forEach(v=>{v.pause();v.querySelectorAll('source').forEach(s=>s.remove());v.removeAttribute('src');v.load();});}
 function open(id){
  const sheet=id?sheets.get(id):null;if(id&&!sheet)return;
  releaseHandoff();const token=++generation;releaseLaunch();releaseLaunch=()=>{};stopVideo();content.replaceChildren();
  const view=sheet?sheet.cloneNode(true):document.getElementById('project-index').content.firstElementChild.cloneNode(true);
  // Remove duplicate anchors from the cloned sheet; keep its local scroll link.
  const localIds=new Map();[view,...view.querySelectorAll('[id]')].forEach(e=>{if(e.id){localIds.set(e.id,e.id+'-open');e.id+='-open';}});
  view.querySelectorAll('a[href^="#"]').forEach(a=>{const target=a.getAttribute('href').slice(1);if(localIds.has(target))a.href='#'+localIds.get(target);});
  view.querySelector('.project-title').id='project-window-heading';content.append(view);
  dialog.querySelector('.project-path').textContent=sheet?'Nirina / Projets / '+sheet.dataset.projectName:'Nirina / Les dossiers';
  dialog.style.setProperty('--experience-photo',`url("${assetUrl('cinema/observatory.webp',import.meta.url)}")`);
  dialog.style.setProperty('--project-travel',0);back.hidden=!sheet;
  document.body.classList.add('experience-open');if(!dialog.open)dialog.showModal();dialog.scrollTop=0;close.focus();
  if(sheet)import('./rocket-launch.js'+version).then(({mountLaunch})=>{if(token!==generation||!dialog.open)return;return mountLaunch(dialog,view,()=>finishStory(true));}).then(release=>{if(!release)return;if(token!==generation||!dialog.open)release();else releaseLaunch=release;}).catch(error=>console.info('La suite reste accessible par son lien.',error));
 }
 function shut(){dialog.close();}
 function settleHandoff(){
  releaseHandoff();const stop=new AbortController();
  // Consume the tail of the gesture that launched the sheet, not the next chapter.
  const block=e=>e.preventDefault();
  addEventListener('wheel',block,{capture:true,passive:false,signal:stop.signal});
  addEventListener('touchmove',block,{capture:true,passive:false,signal:stop.signal});
  addEventListener('keydown',e=>{if(e.repeat&&['PageDown','End','ArrowDown',' '].includes(e.key))e.preventDefault();},{capture:true,signal:stop.signal});
  const timer=setTimeout(()=>stop.abort(),900);releaseHandoff=()=>{clearTimeout(timer);stop.abort();};
 }
 function finishStory(animated=false){if(animated)settleHandoff();previous=null;releaseLaunch();releaseLaunch=()=>{};dialog.close();document.body.classList.remove('experience-open');history.replaceState(null,'','#contact');const target=document.getElementById('contact');scrollTo({top:target.offsetTop,behavior:'auto'});document.dispatchEvent(new Event('story-handoff'));document.getElementById('contact-title')?.focus({preventScroll:true});}
 close.addEventListener('click',shut);back.addEventListener('click',()=>open());
 dialog.addEventListener('close',()=>{generation++;releaseLaunch();releaseLaunch=()=>{};stopVideo();content.replaceChildren();document.body.classList.remove('experience-open');document.dispatchEvent(new Event('portalvisibility'));previous?.focus();});
 dialog.addEventListener('click',event=>{const a=event.target.closest?.('.project-read,.case-navigation a');if(a){const target=content.querySelector(a.getAttribute('href'));if(target){event.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}}});
 dialog.addEventListener('scroll',()=>{const span=dialog.scrollHeight-dialog.clientHeight;dialog.style.setProperty('--project-travel',span>0?Math.min(dialog.scrollTop/span,1):0);},{passive:true});
 document.addEventListener('click',event=>{
  const a=event.target.closest?.('[data-open-project],[data-open-dossier],[data-close-project],[data-story-handoff]');if(!a)return;
  if(a.hasAttribute('data-story-handoff')){event.preventDefault();finishStory();return;}
  if(a.hasAttribute('data-close-project')){previous=null;if(dialog.open)shut();return;}
  const id=a.dataset.openProject;if(id&&!sheets.has(id))return;
  event.preventDefault();if(!dialog.contains(a))previous=a;open(id);
 });
 function fromHash(){if(location.hash==='#jobcopilot'){history.replaceState(null,'','#desktop');document.getElementById('desktop').scrollIntoView();return;}const id=location.hash.replace(/^#projet-/,'');if(sheets.has(id)){document.getElementById('desktop').scrollIntoView();open(id);}else if(['#dossier','#projects'].includes(location.hash))open();}
 addEventListener('hashchange',fromHash);fromHash();
 document.addEventListener('visibilitychange',()=>{if(document.hidden)content.querySelectorAll('video').forEach(v=>v.pause());});
 document.querySelectorAll('[data-open-project],[data-open-dossier]').forEach(a=>a.setAttribute('aria-haspopup','dialog'));
}
