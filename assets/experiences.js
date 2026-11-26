const version=new URL(import.meta.url).search;
const {rankOffers,retrieve,CASES,evaluate,bankQuery}=await import('./demo-lab.js'+version);
const links=[...document.querySelectorAll('[data-experience]')];
if(typeof HTMLDialogElement!=='undefined'){
 const dialog=document.createElement('dialog');dialog.className='experience';dialog.setAttribute('aria-labelledby','experience-title');
 dialog.innerHTML='<div class="experience-background"></div><div class="experience-top"><span>Un projet, de l’intérieur</span><button type="button" class="dialog-close">Fermer l’atelier</button></div><div class="experience-body"><p class="eyebrow">Atelier interactif</p><h2 id="experience-title"></h2><p class="demo-notice">Démonstration illustrative exécutée dans ton navigateur. Données fictives, aucun appel au service réel. Ce n’est pas une mesure des performances du projet.</p><div id="lab"></div></div>';
 document.body.append(dialog);const title=dialog.querySelector('h2'),lab=dialog.querySelector('#lab'),close=dialog.querySelector('.dialog-close');
 let cleanup=()=>{},previous=null;
 close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.classList.remove('experience-open');document.dispatchEvent(new Event('portalvisibility'));cleanup();cleanup=()=>{};previous?.focus();});
 const button=(label,action)=>{const b=document.createElement('button');b.type='button';b.className='lab-button';b.textContent=label;b.addEventListener('click',action);return b;};
 function text(parent,tag,value,cls){const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;parent.append(e);return e;}
 function show(id){
  cleanup();cleanup=()=>{};lab.replaceChildren();
  const shot=['churn','banklens'].includes(id)?'firecast':id==='gospelkeys'?'nirys':id;
  dialog.style.setProperty('--experience-photo',`url("assets/cinema/${shot}.webp${version}")`);
  const handlers={jobcopilot:agent,lexpipe:rag,friends:phone,nirys:music,gospelkeys:music,factory:factory,firecast:()=>prediction(false),churn:()=>prediction(true),banklens:bank};
  (handlers[id]||agent)();
  document.body.classList.add('experience-open');if(!dialog.open)dialog.showModal();close.focus();
 }
 links.forEach(b=>{b.hidden=false;b.setAttribute('aria-haspopup','dialog');b.addEventListener('click',event=>{event.preventDefault();previous=b;show(b.dataset.experience);});});
 function agent(){
  title.textContent='Apprendre à un agent quand s’arrêter.';
  text(lab,'p','Choisis le profil : le classement est calculé ici, puis l’envoi reste bloqué sans validation humaine.');
  const form=document.createElement('fieldset');form.className='lab-choices';text(form,'legend','Compétences du profil de démonstration');
  ['Python','SQL','Machine Learning','ETL','React'].forEach(s=>{const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=s;input.checked=['Python','SQL','Machine Learning'].includes(s);label.append(input,document.createTextNode(s));form.append(label);});lab.append(form);
  const out=document.createElement('div');out.className='agent-output';out.setAttribute('aria-live','polite');
  lab.append(button('Exécuter le workflow',()=>{out.replaceChildren();const skills=[...form.querySelectorAll('input:checked')].map(e=>e.value);const offers=rankOffers(skills);
   text(out,'p','Collecte : 4 offres fictives. Après dédoublonnage par identifiant : 3 offres.','lab-caption');
   offers.forEach(o=>{const row=document.createElement('div');row.className='offer-row';text(row,'strong',o.title.replace(' (doublon)',''));text(row,'span',o.score+' % · '+(o.matches.join(', ')||'aucune correspondance'));out.append(row);});
   text(out,'p','Score pédagogique = proportion de compétences de l’offre retrouvées dans le profil. Ce n’est pas le scoring réel de JobCopilot.','lab-caption');
   text(out,'p','Dossier préparé → VALIDATION HUMAINE REQUISE. Aucun email ne peut partir depuis cette démonstration.','gate');
  }),out);
 }
 function rag(){
  title.textContent='Une réponse qui permet de remonter à la source.';
  text(lab,'p','Dans LexPipe, le RAG combine recherche et réponse sourcée. Ici, observe seulement la récupération lexicale de trois documents fictifs et l’abstention : ni embeddings ni LLM ne tournent dans cet atelier.');
  const form=document.createElement('form');form.className='lab-search';const label=document.createElement('label');label.textContent='Question sur le mini-corpus fictif';const input=document.createElement('input');input.name='question';input.value='contrat de travail et préavis';input.maxLength=180;label.append(input);const go=document.createElement('button');go.className='lab-button';go.textContent='Retrouver les passages';form.append(label,go);lab.append(form);
  const out=document.createElement('div');out.className='source-output';out.setAttribute('aria-live','polite');lab.append(out);
  const search=()=>{out.replaceChildren();const results=retrieve(input.value);if(!results.length){text(out,'p','Aucun passage pertinent retrouvé. Je préfère ne pas répondre.','gate');return;}
   text(out,'p','Extrait retrouvé, pas une réponse juridique générée.','lab-caption');
   results.forEach(p=>{const article=document.createElement('article');text(article,'p',p.text);text(article,'small',p.id+' · '+p.score+' terme(s) retrouvé(s) · document fictif');out.append(article);});};
  form.addEventListener('submit',e=>{e.preventDefault();search();});search();
 }
 function phone(){
  title.textContent='Une rencontre, une voix, une mémoire.';
  text(lab,'p','Les vrais personnages My Friends sont fictifs. Ce téléphone montre un scénario écrit à l’avance, pas une conversation avec un LLM ni un appel CallKit.');
  const phone=document.createElement('div');phone.className='lab-phone';text(phone,'small','Scénario local');text(phone,'h3','Alex');text(phone,'p','Incoming practice call…');
  const messages=document.createElement('div');messages.className='phone-chat';messages.setAttribute('aria-live','polite');const answer=button('Décrocher la démo',()=>{answer.remove();messages.replaceChildren();text(messages,'p','Hi Nirina! What did you build today?');
   const replies=document.createElement('div');replies.className='phone-replies';
   ['A search engine that cites its sources.','A music recommendation system.'].forEach(reply=>replies.append(button(reply,()=>{replies.remove();text(messages,'p',reply,'user-reply');text(messages,'p','That sounds interesting. What was the hardest part?');text(memory,'p','Mémoire du scénario : '+(reply.includes('search')?'recherche sourcée':'recommandation musicale'));})));messages.append(replies);});
  phone.append(answer,messages);lab.append(phone);const memory=document.createElement('div');memory.className='memory-note';text(memory,'strong','Ce qu’une mémoire peut conserver');text(memory,'p','Aucun échange n’est enregistré. Fermer cet atelier efface le scénario.');lab.append(memory);
 }
 function music(){
  title.textContent='D’une ambiance à une vibration.';
  text(lab,'p','Choisis une ambiance et joue une esquisse harmonique. Les accords sont synthétisés localement : ce ne sont ni des titres recommandés par Nirys, ni une transcription calculée par GospelKeys.');
  const palettes=[{name:'Aube calme',notes:[261.63,329.63,392],words:'Lumineux · acoustique · calme',photo:'contact'},{name:'Nuit urbaine',notes:[220,261.63,329.63],words:'Nocturne · feutré · électronique',photo:'jobcopilot'},{name:'Forêt',notes:[293.66,349.23,440],words:'Organique · ample · contemplatif',photo:'firecast'}];let selected=palettes[0],audio=null;
  const art=document.createElement('div');art.className='record-art';const choices=document.createElement('div');choices.className='lab-choices';
  const caption=text(art,'p',selected.words);const select=p=>{selected=p;caption.textContent=p.words;art.style.backgroundImage=`linear-gradient(#06131a22,#06131aaa),url("assets/cinema/${p.photo}.webp${version}")`;};
  palettes.forEach(p=>{const b=button(p.name,()=>{select(p);[...choices.children].forEach(c=>c.setAttribute('aria-pressed',String(c===b)));});b.setAttribute('aria-pressed',String(p===selected));choices.append(b);});select(selected);lab.append(choices,art);
  const play=button('Écouter l’esquisse · 2 secondes',async()=>{play.disabled=true;try{cleanup();const C=window.AudioContext||window.webkitAudioContext;if(!C){play.textContent='Audio non pris en charge par ce navigateur';return;}audio=new C();await audio.resume();if(!dialog.open){await audio.close();audio=null;return;}const t=audio.currentTime;
   selected.notes.forEach(f=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.075,t+.08);g.gain.exponentialRampToValueAtTime(.0001,t+1.9);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+2);});
   cleanup=()=>{if(audio){audio.close().catch(()=>{});audio=null;}};
  }catch{play.textContent='Audio indisponible ; les ambiances restent consultables.';}finally{play.disabled=false;}});lab.append(play);
 }
 function factory(){
  title.textContent='La scène est-elle vraiment prête ?';
  text(lab,'p','Orchestre une petite revue qualité : un contrôle manquant doit bloquer la publication. Ce scénario ne génère aucune vidéo et ne consulte aucune source scientifique.');
  const checklist=document.createElement('div');checklist.className='review-list';
  ['Source vérifiée par un humain','Affirmation reliée à la source','Scène relue et erreur de montage corrigée','Validation humaine finale'].forEach((s,i)=>{const label=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=i<2;label.append(c,document.createTextNode(s));checklist.append(label);});lab.append(checklist);
  const status=text(lab,'p','Revue incomplète.','gate');status.setAttribute('aria-live','polite');lab.append(button('Contrôler le pipeline',()=>{const n=checklist.querySelectorAll('input:checked').length;status.textContent=n===4?'4 contrôles sur 4. Le scénario est prêt pour une publication manuelle — aucune diffusion réelle.':`${n} contrôles sur 4. Publication bloquée : les étapes non cochées restent à traiter.`;}));
 }
 function prediction(churn){
  title.textContent=churn?'Prédire ne suffit pas. Il faut choisir une décision.':'Un seuil change le sens d’une alerte.';
  text(lab,'p',churn?'Le vrai projet Churn prédit l’attrition et règle un seuil de décision. Ici, 30 cas entièrement synthétiques montrent le compromis entre faux positifs et cas manqués. Aucun modèle Telco n’est exécuté.':'Dans FireCast, les scores se lisent avec le protocole temporel. Ici, 30 cas entièrement synthétiques permettent de manipuler un seuil. Ce n’est pas une prévision d’incendie.');
  const label=document.createElement('label');label.className='threshold-label';label.textContent='Seuil de décision ';const range=document.createElement('input');range.type='range';range.min=0;range.max=100;range.value=50;const value=document.createElement('output');label.append(range,value);lab.append(label);
  const dots=document.createElement('div');dots.className='case-plot';dots.setAttribute('aria-hidden','true');CASES.forEach(c=>{const dot=document.createElement('i');dot.style.left=(c.score*95)+'%';dot.style.top=(c.actual?25:70)+'%';dot.className=c.actual?'actual':'';dots.append(dot);});lab.append(dots);text(lab,'small','Ligne haute : événements positifs. Ligne basse : événements négatifs. Tous les cas sont synthétiques.','lab-caption');
  const metrics=document.createElement('div');metrics.className='metric-line';metrics.setAttribute('aria-live','polite');const explain=text(lab,'p','');lab.append(metrics);
  function update(){const t=Number(range.value)/100,m=evaluate(t);value.value=t.toFixed(2);range.setAttribute('aria-valuetext','Seuil '+t.toFixed(2));dots.style.setProperty('--threshold',(t*95)+'%');metrics.replaceChildren();
   [['Précision',m.precision],['Rappel',m.recall],['F2',m.f2]].forEach(([name,v])=>{const e=document.createElement('div');text(e,'strong',(v*100).toFixed(0)+' %');text(e,'span',name);metrics.append(e);});
   explain.textContent=`${m.alerts} cas signalés : ${m.tp} vrais positifs, ${m.fp} faux positifs. ${m.fn} positifs manqués. Changer le seuil change la décision, pas les scores des cas.`;
  }range.addEventListener('input',update);update();
  if(!churn){const a=document.createElement('a');a.className='proof-link';a.href='https://andriantsoa777.github.io/feux-de-foret-resultats/';a.target='_blank';a.rel='noopener noreferrer';a.textContent='Consulter les vrais résultats de FireCast';lab.append(a);}
 }
 function bank(){
  title.textContent='Relier une question métier à une requête.';
  text(lab,'p','BankLens relie ETL, qualité, modèle en étoile et analyses SQL. Ce mini-jeu contient seulement trois segments inventés ; aucun chiffre ci-dessous ne vient du corpus bancaire réel. La requête SQL illustre le calcul ; le tri est exécuté en JavaScript.');
  const label=document.createElement('label');label.textContent='Question métier ';const select=document.createElement('select');select.innerHTML='<option value="deposits">Quels segments concentrent les dépôts ?</option><option value="accounts">Quels segments ont le plus de comptes ?</option>';label.append(select);lab.append(label);
  const sql=document.createElement('pre');sql.className='sql-query';const table=document.createElement('table');table.className='bank-table';lab.append(sql,table);
  function update(){const metric=select.value;sql.textContent=`SELECT segment, SUM(${metric})\nFROM demo_accounts\nGROUP BY segment\nORDER BY SUM(${metric}) DESC;`;table.replaceChildren();const caption=document.createElement('caption');caption.textContent='Données fictives, agrégats calculés localement';table.append(caption);const head=document.createElement('thead');const tr=document.createElement('tr');text(tr,'th','Segment');text(tr,'th',metric==='accounts'?'Comptes':'Dépôts fictifs (€)');head.append(tr);table.append(head);const body=document.createElement('tbody');bankQuery(metric).forEach(row=>{const r=document.createElement('tr');text(r,'td',row.segment);text(r,'td',row[metric].toLocaleString('fr-FR'));body.append(r);});table.append(body);}select.addEventListener('change',update);update();
 }
}
