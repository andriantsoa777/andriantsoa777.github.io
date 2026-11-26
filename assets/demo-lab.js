// Logique pédagogique locale : aucun modèle, service privé ou donnée personnelle.
export const OFFERS=[
 {id:'a',title:'Stage Data Scientist',skills:['Python','SQL','Machine Learning']},
 {id:'a',title:'Stage Data Scientist (doublon)',skills:['Python','SQL','Machine Learning']},
 {id:'b',title:'Stage Data Engineer',skills:['Python','SQL','ETL']},
 {id:'c',title:'Stage Frontend',skills:['React','CSS']},
];
export function rankOffers(skills){
 return [...new Map(OFFERS.map(o=>[o.id,o])).values()].map(o=>({...o,matches:o.skills.filter(s=>skills.includes(s))}))
 .map(o=>({...o,score:Math.round(o.matches.length/o.skills.length*100)})).sort((a,b)=>b.score-a.score);
}
export const PASSAGES=[
 {id:'DÉMO-A',text:'Dans cet exemple fictif, le contrat de travail prévoit un préavis avant la rupture.'},
 {id:'DÉMO-B',text:'Dans cet exemple fictif, le bail commercial fixe un loyer et la durée de location.'},
 {id:'DÉMO-C',text:'Dans cet exemple fictif, un logiciel doit protéger les données personnelles et la confidentialité.'},
];
export function retrieve(query){
 const stop=new Set(['dans','pour','avec','quel','quelle','quels','comment','avant','apres','doit','sont','une','des','les','est','sur']);
 const terms=[...new Set(query.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z]{3,}/g)||[])].filter(t=>!stop.has(t));
 return PASSAGES.map(p=>{const text=p.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');return {...p,score:terms.filter(t=>text.includes(t)).length};}).filter(p=>p.score>0).sort((a,b)=>b.score-a.score);
}
export const CASES=Array.from({length:30},(_,i)=>({score:((i*17+11)%97)/100,actual:[1,4,8,12,15,19,22,25,28].includes(i)}));
export function evaluate(threshold){
 const t=Math.max(0,Math.min(1,threshold));let tp=0,fp=0,fn=0,tn=0;
 for(const c of CASES){if(c.score>=t){if(c.actual)tp++;else fp++;}else if(c.actual)fn++;else tn++;}
 const precision=tp/(tp+fp)||0,recall=tp/(tp+fn)||0,f2=5*precision*recall/(4*precision+recall)||0;
 return {tp,fp,fn,tn,precision,recall,f2,alerts:tp+fp};
}
export const BANK_ROWS=[{segment:'Particuliers',accounts:120,deposits:860000},{segment:'Professionnels',accounts:35,deposits:420000},{segment:'Associations',accounts:12,deposits:95000}];
export function bankQuery(metric){
 if(!['accounts','deposits'].includes(metric))throw new Error('Indicateur inconnu');
 return [...BANK_ROWS].sort((a,b)=>b[metric]-a[metric]);
}
