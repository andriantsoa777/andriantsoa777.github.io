export const clamp01=x=>Math.min(1,Math.max(0,x));
export const smooth=x=>{x=clamp01(x);return x*x*(3-2*x);};
export const glide=x=>{x=clamp01(x);return clamp01(x*x*x*(x*(x*6-15)+10));};
// Approach the physical display, align with its optical axis, then cross its bezel.
export function entryPose(progress,mobile=false,aspect=mobile?390/740:16/9){
 const p=clamp01(progress),travel=glide((p-(mobile?.18:.06))/(mobile?.78:.90));
 const centerX=mobile?0:1.5,centerY=mobile?-.395:.675;
 const distance=Math.min(2.49/(2*Math.tan(Math.PI/9)),4.43/(2*Math.tan(Math.PI/9)*Math.max(.2,aspect)))*.84+.147;
 const arc=Math.sin(travel*Math.PI)*(1-travel);
 return{travel,z:(mobile?15:10.6)*(1-travel)+distance*travel,
  x:(mobile?-.35:-.25)*(1-travel)+centerX*travel+arc*.45,
  y:(mobile?.25:.37)*(1-travel)+centerY*travel,
  lookX:(mobile?0:.1)*(1-travel)+centerX*travel,lookY:(mobile?.05:.20)*(1-travel)+centerY*travel,
  roll:arc*.015,focus:smooth((p-.4)/.5),opacity:1-smooth((p-.96)/.04),
  copyOpacity:1-smooth(mobile?(p-.14)/.24:(p-.03)/.24),copyOffset:-smooth(p/.35)*32};
}
