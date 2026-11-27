export const clamp01=x=>Math.max(0,Math.min(1,x));
export const smooth=x=>{x=clamp01(x);return x*x*(3-2*x);};
// All reading precedes this silent transition zone.
export function launchProgress(scroll,zoneTop,zoneHeight,viewport){return clamp01((scroll-zoneTop+viewport*.15)/Math.max(1,(zoneHeight-viewport)*.95));}
export function rocketPose(progress,mobile=false){
 const p=clamp01(progress),fold=smooth((p-.12)/.5),flight=smooth((p-.63)/.37);
 return{x:flight*1.8,y:flight*flight*12,z:flight*.6,fold,scale:1-smooth((p-.18)/.45)*.62,
  rotation:-flight*.36,pitch:fold*.22,yaw:Math.sin(fold*Math.PI)*.18,trail:smooth((p-.58)/.2),
  opacity:smooth(p/.10),pageLift:smooth((p-.08)/.34),pageScale:1-smooth((p-.08)/.34)*.18,pageOpacity:1-smooth((p-.08)/.20)};
}
// Eight connected facets: a flat page becomes one pointed, creased paper rocket.
export function paperVertices(fold){
 const f=smooth(fold),points=[[-1,1.45,0],[0,1.45,0],[1,1.45,0],[-1,0,0],[0,0,0],[1,0,0],[-1,-1.45,0],[0,-1.45,0],[1,-1.45,0]];
 const target=[[-.08,.38,.22],[0,1.65,.1],[.08,.38,.22],[-.84,-1.25,0],[0,-.38,.45],[.84,-1.25,0],[-.32,-.9,.38],[0,-.72,.1],[.32,-.9,.38]];
 const faces=[[0,3,1],[1,3,4],[1,4,5],[1,5,2],[3,6,4],[4,6,7],[4,7,8],[4,8,5]],positions=[],uvs=[];
 for(const face of faces)for(const i of face){points[i].forEach((v,j)=>positions.push(v+(target[i][j]-v)*f));uvs.push((points[i][0]+1)/2,(points[i][1]+1.45)/2.9);}
 return{positions,uvs};
}
export class LaunchSequence{
 constructor(){this.reset();}
 reset(){this.progress=0;this.armedAt=null;this.from=0;this.duration=2100;this.done=false;}
 get armed(){return this.armedAt!==null&&!this.done;}
 delay(ms){if(this.armedAt!==null)this.armedAt+=Math.max(0,ms);}
 update(target,now,dt){
  target=clamp01(target);let finished=false;
  if(this.done)return{progress:this.progress,armed:false,finished:false};
  if(this.armedAt!==null&&target<.75)this.armedAt=null;
  if(this.armedAt===null&&target>=.92){this.armedAt=now;this.from=this.progress;this.duration=Math.max(900,2100*(1-this.progress));}
  if(this.armedAt!==null){const t=clamp01((now-this.armedAt)/this.duration);this.progress=this.from+(1-this.from)*smooth(t);if(t===1){this.done=true;finished=true;}}
  else this.progress+=(target-this.progress)*(1-Math.exp(-Math.max(0,Math.min(dt,.1))*8));
  return{progress:this.progress,armed:this.armed,finished};
 }
}
export class LaunchInput{
 constructor(){this.last=-Infinity;this.manual=false;this.engaged=false;}
 gesture(now){this.last=now;this.manual=false;}
 tab(){this.last=-Infinity;this.manual=true;this.engaged=false;}
 target(raw,now){if(raw<=0)this.engaged=false;if(!this.manual&&raw>0&&now-this.last<1800)this.engaged=true;return this.engaged&&!this.manual?raw:0;}
}
