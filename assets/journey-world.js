// Cinéma photographique : images mises en scène, profondeur par parallaxe,
// brume volumétrique calculée et lumière 3D continue. Ce n’est pas une scène
// photogrammétrique ni une capture des applications présentées.
export const SHOTS=['observatory','observatory'];
export function shotAt(phase){
  const frame=Math.max(0,Math.min(SHOTS.length-1,Math.floor(phase)));
  const t=Math.max(0,Math.min(1,(phase-frame-.60)/.40));
  return {frame,next:Math.min(frame+1,SHOTS.length-1),blend:t*t*(3-2*t)};
}
export function createJourney(THREE,renderer,onReady=()=>{}){
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(40,1,.1,50);camera.position.z=6;
  const textures=[],loaded=[];const loader=new THREE.TextureLoader();
  const version=new URL(import.meta.url).search;
  const uniforms={photoA:{value:null},photoB:{value:null},mixAmount:{value:0},time:{value:0},
    resolution:{value:new THREE.Vector2(1440,900)},mouse:{value:new THREE.Vector2()},
    zoom:{value:1.04},shot:{value:0},ready:{value:0},travel:{value:0}};
  function load(i){
    if(textures[i])return textures[i];
    textures[i]=loader.load(`assets/cinema/${SHOTS[i]}.webp${version}`,texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;
      loaded[i]=true;onReady();
    },undefined,()=>{loaded[i]=false;console.info('Décor indisponible : '+SHOTS[i]);onReady();});
    return textures[i];
  }
  load(0);load(1);
  const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,depthTest:false,toneMapped:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.);}',
    fragmentShader:`
      precision highp float;
      varying vec2 vUv;uniform sampler2D photoA,photoB;
      uniform float mixAmount,time,zoom,shot,ready,travel;uniform vec2 resolution,mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
      float mist(vec2 p){return noise(p)*.57+noise(p*2.07)*.28+noise(p*4.13)*.15;}
      vec2 cover(vec2 uv,float z){float aspect=resolution.x/resolution.y,ratio=16./9.;
        vec2 scale=aspect>ratio?vec2(1.,ratio/aspect):vec2(aspect/ratio,1.);
        float anchor=aspect<.85?.70:.5;
        return (uv-.5)*scale/z+vec2(anchor,.5);}
      vec3 photograph(sampler2D photo,vec2 uv){
        vec2 q=cover(uv,zoom);vec3 base=texture2D(photo,q).rgb;
        float depth=smoothstep(.24,.86,q.x)*(.6+.4*dot(base,vec3(.2126,.7152,.0722)));
        vec2 camera=mouse*.008+vec2(sin(time*.12)*.003,cos(time*.10)*.0016);
        q+=camera*(depth-.22);return texture2D(photo,clamp(q,.001,.999)).rgb;
      }
      void main(){
        vec3 a=photograph(photoA,vUv),b=photograph(photoB,vUv);
        float field=mist(vUv*vec2(3.,1.9)+vec2(time*.025,time*.006));
        float transition=smoothstep(field-.19,field+.19,mixAmount*1.4-.2);
        vec3 col=mix(a,b,transition);
        float edge=1.-abs(transition*2.-1.);
        col=mix(col,vec3(.49,.55,.55),edge*.25);
        float haze=mist(vUv*vec2(2.,1.1)+vec2(time*.013,0.));
        float hazeMask=smoothstep(.3,.9,vUv.y)*smoothstep(.38,.9,vUv.x);
        col+=vec3(.14,.17,.17)*smoothstep(.46,.95,haze)*hazeMask*.11;
        float callGlow=exp(-dot((cover(vUv,zoom)-vec2(.76,.55))*vec2(1.,1.5),(cover(vUv,zoom)-vec2(.76,.55))*vec2(1.,1.5))*700.);
        if(shot>2.5&&shot<3.5)col+=vec3(.12,.07,.23)*callGlow*(.35+.25*sin(time*1.8));
        float light=pow(max(0.,sin(vUv.x*4.+vUv.y*1.2-time*.15)),16.);
        col+=vec3(.16,.095,.04)*light*.035;
        vec2 vignette=vUv-.5;col*=1.-dot(vignette,vignette)*.35;
        col+=(hash(vUv*resolution+floor(time*18.))-.5)*.011;
        // Les textures sRGB sont échantillonnées en linéaire puis réencodées pour l’écran.
        gl_FragColor=vec4(col,ready);
        #include <colorspace_fragment>
      }`});
  const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);backdrop.frustumCulled=false;backdrop.renderOrder=-10;scene.add(backdrop);

  // Un même fil ambré traverse les plans en espace 3D. Il se resserre pour la
  // voix, devient vibration pour la musique, puis s’ouvre à l’arrivée.
  const count=150,positions=new Float32Array(count*3),geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const thread=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:'#e4b478',transparent:true,opacity:.20,blending:THREE.AdditiveBlending,depthWrite:false}));thread.renderOrder=2;thread.frustumCulled=false;scene.add(thread);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
  const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'#fff0d5');gradient.addColorStop(.15,'#f2c18fbb');gradient.addColorStop(1,'#e0a36200');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const glowTexture=new THREE.CanvasTexture(canvas);glowTexture.colorSpace=THREE.SRGBColorSpace;
  const light=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,transparent:true,depthWrite:false,opacity:.45,blending:THREE.AdditiveBlending}));light.scale.set(.35,.35,1);scene.add(light);
  const dustPositions=new Float32Array(100*3);
  for(let i=0;i<100;i++){dustPositions[i*3]=Math.sin(i*52.13)*5;dustPositions[i*3+1]=Math.sin(i*13.71)*3;dustPositions[i*3+2]=Math.cos(i*31.1)*2;}
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({map:glowTexture,color:'#e5bf95',size:.045,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(dust);
  const pointer=new THREE.Vector2();
  const pointerMove=e=>pointer.set(e.clientX/innerWidth-.5,.5-e.clientY/innerHeight);
  if(typeof addEventListener==='function')addEventListener('pointermove',pointerMove,{passive:true});
  function point(t,phase,time,mobile){
    const arrival=Math.max(0,Math.min(1,phase-1));
    const wave=Math.sin(t*9.+time*.45)*.04*(1-arrival);
    return [mobile?.8:1.4+Math.sin(t*5.+phase*.7)*.75,
      -.45+Math.sin(t*5.7+phase*.5)*(.3+arrival*.14)+wave,
      Math.cos(t*5.+phase*.3)*.65];
  }
  function update(phase,time,mobile,still=false){
    const state=shotAt(phase);load(state.frame);load(state.next);
    if(state.next<SHOTS.length-1)load(state.next+1);
    const a=loaded[state.frame]?state.frame:loaded[0]?0:null;
    const b=loaded[state.next]?state.next:a;
    if(a!==null){uniforms.photoA.value=textures[a];uniforms.photoB.value=textures[b];uniforms.ready.value=1;}
    uniforms.mixAmount.value=b===a?0:state.blend;uniforms.time.value=time;uniforms.shot.value=state.frame;
    uniforms.resolution.value.set(innerWidth,innerHeight);uniforms.mouse.value.lerp(still?new THREE.Vector2():pointer,.06);
    uniforms.zoom.value=still?1.04:1.035+(phase-state.frame)*.065;uniforms.travel.value=phase;
    camera.position.set(still?0:Math.sin(time*.11)*.03,0,6);camera.lookAt(0,0,0);
    for(let i=0;i<count;i++)positions.set(point(i/(count-1),phase,time,mobile),i*3);
    geometry.attributes.position.needsUpdate=true;
    const head=point((time*.025)%1,phase,time,mobile);light.position.set(...head);
    thread.material.opacity=mobile?.10:.17;
    dust.rotation.z=time*.004;dust.position.y=Math.sin(time*.09)*.08;
    dust.material.opacity=state.frame===2?.20:.10;
    return {phase,...state,day:Math.max(0,Math.min(1,phase-1))};
  }
  return {scene,camera,update};
}
