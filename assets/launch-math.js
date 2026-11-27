export const clamp01=x=>Math.max(0,Math.min(1,x));
export const smooth=x=>{x=clamp01(x);return x*x*(3-2*x);};
// The launch zone follows all content. Ordinary reading can never arm it.
export function launchProgress(scroll,zoneTop,zoneHeight,viewport){
 return clamp01((scroll-zoneTop+viewport*.15)/Math.max(1,(zoneHeight-viewport)*.95));
}
export function rocketPose(progress,mobile=false){
 const p=clamp01(progress),flight=smooth((p-.28)/.72),lift=smooth((p-.48)/.52);
 return {x:(mobile?.2:1.15)+flight*.35,y:(mobile?.8:-1.05)+flight*flight*11,z:flight*.45,
  rotation:-.035-flight*.17,flame:smooth((p-.08)/.25),opacity:smooth(p/.12),
  pageLift:lift,pageScale:1-lift*.07,pageOpacity:1-smooth((p-.70)/.30)};
}

export class LaunchSequence{
 constructor(){this.reset();}
 reset(){this.progress=0;this.armedAt=null;this.from=0;this.duration=1250;this.done=false;}
 get armed(){return this.armedAt!==null&&!this.done;}
 delay(ms){if(this.armedAt!==null)this.armedAt+=Math.max(0,ms);}
 update(target,now,dt){
  target=clamp01(target);let finished=false;
  if(this.done)return{progress:this.progress,armed:false,finished:false};
  if(this.armedAt!==null&&target<.75)this.armedAt=null;
  if(this.armedAt===null&&target>=.92){this.armedAt=now;this.from=this.progress;this.duration=Math.max(280,1250*(1-this.progress));}
  if(this.armedAt!==null){const t=clamp01((now-this.armedAt)/this.duration);this.progress=this.from+(1-this.from)*smooth(t);if(t===1){this.done=true;finished=true;}}
  else this.progress+=(target-this.progress)*(1-Math.exp(-Math.max(0,Math.min(dt,.1))*8));
  return{progress:this.progress,armed:this.armed,finished};
 }
}
