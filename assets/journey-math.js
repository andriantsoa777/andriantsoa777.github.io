export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function phaseAt(scroll,anchors,finalPhase=7.75){
  if(!anchors.length)return 0;
  let i=0;
  for(let k=1;k<anchors.length;k++)if(scroll>=anchors[k])i=k;
  const span=i+1<anchors.length?anchors[i+1]-anchors[i]:(anchors[i]-anchors[i-1]||1);
  return clamp(i+(scroll-anchors[i])/Math.max(span,1),0,finalPhase);
}
export function approach(current,target,dt){return current+(target-current)*(1-Math.exp(-Math.min(dt,.1)*6));}
