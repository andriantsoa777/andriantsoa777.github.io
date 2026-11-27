export const clamp01=x=>Math.min(1,Math.max(0,x));
export const smooth=x=>{x=clamp01(x);return x*x*(3-2*x);};
export function entryPose(progress,mobile=false){
  const p=clamp01(progress),travel=smooth(mobile?(p-.32)/.66:(p-.08)/.88);
  return {travel,z:(mobile?15:9)*(1-travel)+(mobile?4.2:2.75)*travel,
    x:(mobile?-1.3:.2)*travel,y:mobile?-.42:.15+.5*travel,
    opacity:1-smooth((p-.91)/.09),copyOpacity:1-smooth(mobile?(p-.28)/.28:(p-.04)/.23)};
}

export function missionProgress(scroll,top,height,viewport){return clamp01((scroll-top)/Math.max(1,height-viewport));}
