import * as THREE from '../vendor/three/three.module.min.js';
import { createOrbit, stepOrbit, orbitRange, perceptionPoint, perceptionSamples } from './lab-models.mjs';

const root = document.getElementById('experiment-playground');
const stage = document.getElementById('experiment-stage');
const canvas = document.getElementById('experiment-canvas');
const play = document.getElementById('experiment-play');
const status = document.getElementById('experiment-status');
const metrics = document.getElementById('experiment-metrics');
const controls = [...root.querySelectorAll('button,input')];
let renderer, scene, camera, mode='space', initialized=false, visible=false, playing=false;
let lastTime=0, accumulator=0, lastReadout=0, orbit=createOrbit(), chaser, target, trail, prediction, thrustArrow;
let trailPoints=[], phase=Math.PI/6, direction=1, elapsed=0, points, sampleData=[];
const orbitOptions={thrust:1,target:0,guided:true};
const perception={coherence:1,depth:0};
const setStatus = text => status.textContent=text;
const read = id => document.getElementById(id);

function pause(message) {
    playing=false;
    renderer?.setAnimationLoop(null);
    play.textContent='Play'; play.setAttribute('aria-pressed','false');
    if(message) setStatus(message);
}
function disposeScene() {
    scene?.traverse(obj => {
        obj.geometry?.dispose();
        const materials=Array.isArray(obj.material)?obj.material:[obj.material];
        materials.forEach(material=>{ material?.map?.dispose(); material?.dispose(); });
    });
}
function material(color) { return new THREE.MeshStandardMaterial({color,roughness:.55,metalness:.35}); }
function box(w,h,d,color,x=0,y=0,z=0) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));
    mesh.position.set(x,y,z); return mesh;
}
function satellite(color) {
    const group=new THREE.Group();
    group.add(box(.42,.42,.5,color),box(1.4,.04,.65,0x365f75,-.95),box(1.4,.04,.65,0x365f75,.95));
    const antenna=new THREE.Mesh(new THREE.ConeGeometry(.2,.2,16),material(0xc7d0cb));
    antenna.rotation.x=Math.PI/2; antenna.position.z=-.36; group.add(antenna);
    return group;
}
function line(points,color,dashed=false) {
    const geometry=new THREE.BufferGeometry().setFromPoints(points);
    const result=new THREE.Line(geometry,dashed?new THREE.LineDashedMaterial({color,dashSize:.22,gapSize:.13}):new THREE.LineBasicMaterial({color}));
    if(dashed) result.computeLineDistances(); return result;
}
function replaceLine(object, positions) {
    object.geometry.dispose(); object.geometry=new THREE.BufferGeometry().setFromPoints(positions);
    if(object.material.isLineDashedMaterial) object.computeLineDistances();
}
function label(text,position,color='#9eafab') {
    const c=document.createElement('canvas'); c.width=512;c.height=64;
    const ctx=c.getContext('2d');ctx.font='28px Segoe UI';ctx.fillStyle=color;ctx.fillText(text,8,42);
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));
    sprite.position.copy(position);sprite.scale.set(5,.625,1);scene.add(sprite);
}
const orbitalPosition = p => new THREE.Vector3(p[1]/20,p[2]/20,-p[0]/20);
function buildSpace() {
    scene.add(new THREE.HemisphereLight(0xffead0,0x19232b,2.5));
    const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(1,10,5);scene.add(light);
    const grid=new THREE.GridHelper(20,20,0x3f625d,0x22332f);grid.position.y=-.5;scene.add(grid);
    scene.add(line([new THREE.Vector3(-9,0,0),new THREE.Vector3(9,0,0)],0x657777));
    scene.add(line([new THREE.Vector3(0,0,-9),new THREE.Vector3(0,0,9)],0x657777));
    scene.add(line([new THREE.Vector3(0,0,0),new THREE.Vector3(0,5,0)],0x657777));
    label('y · along-track',new THREE.Vector3(6,-.3,0));
    label('x · radial',new THREE.Vector3(0,-.3,-8));
    label('z · normal',new THREE.Vector3(0,5,0));
    target=satellite(0xe4e7df);scene.add(target);
    chaser=satellite(0xd8aa4f);scene.add(chaser);
    const ring=[];
    for(let i=0;i<=64;i++){const t=i/64*Math.PI*2;ring.push(new THREE.Vector3(Math.cos(t)*.8,0,Math.sin(t)*.8));}
    target.add(line(ring,0x58c7bc));
    trail=line([],0xd8aa4f);prediction=line([],0x58c7bc,true);scene.add(trail,prediction);
    thrustArrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(),1,0xffb96b,.2,.1);scene.add(thrustArrow);
    read('experiment-hud').textContent='LVLH · 20 m / grid unit';
    read('experiment-legend').textContent='Amber: travelled path. Dashed mint: next 300 simulated seconds at current settings. Bright arrow: thrust direction (enlarged).';
    refreshPrediction();
}
function refreshPrediction() {
    if(mode!=='space'||!prediction)return;
    const future=structuredClone(orbit), positions=[orbitalPosition(future.p)];
    for(let i=0;i<600;i++){stepOrbit(future,orbitOptions);if(i%10===0)positions.push(orbitalPosition(future.p));}
    replaceLine(prediction,positions);
}
function updateSpace(record=false) {
    chaser.position.copy(orbitalPosition(orbit.p));
    target.position.copy(orbitalPosition([0,orbitOptions.target,0]));
    const force=orbitalPosition(orbit.force).multiplyScalar(20);
    const magnitude=force.length();
    thrustArrow.position.copy(chaser.position);thrustArrow.visible=magnitude>.001;
    if(magnitude>.001){thrustArrow.setDirection(force.normalize());thrustArrow.setLength(.6+magnitude,.25,.12);}
    if(record) {
        trailPoints.push(chaser.position.clone()); if(trailPoints.length>900)trailPoints.shift();
        replaceLine(trail,trailPoints);
    }
}
function buildPerception() {
    const positions=[],colors=[];
    sampleData=perceptionSamples();
    for(const sample of sampleData) {
        positions.push(0,0,0); colors.push(1,1,1);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    points=new THREE.Points(geometry,new THREE.PointsMaterial({size:.034,vertexColors:true,sizeAttenuation:false}));
    // Point size is in pixels when attenuation is off.
    points.material.size=3;
    scene.add(points);
    read('experiment-hud').textContent='Structure from motion';
    read('experiment-legend').textContent='Same points, different evidence. Depth cues gradually add perspective and front-to-back shading.';
    updatePerception();
}
function updatePerception() {
    const positions=points.geometry.attributes.position,colors=points.geometry.attributes.color;
    const base=new THREE.Color(0x58c7bc),warm=new THREE.Color(0xd8aa4f);
    sampleData.forEach((sample,i)=>{
        const p=perceptionPoint(sample.theta,sample.latitude,phase,perception.depth);
        positions.setXYZ(i,(p.x*perception.coherence+sample.noiseX*(1-perception.coherence))*4.3,(p.y*perception.coherence+sample.noiseY*(1-perception.coherence))*4.3,0);
        const color=base.clone().lerp(warm,(Math.sin(sample.latitude*2)+1)/2).multiplyScalar(p.alpha);
        colors.setXYZ(i,color.r,color.g,color.b);
    });
    positions.needsUpdate=true;colors.needsUpdate=true;
}
function resize() {
    if(!renderer || root.hidden)return;
    const width=Math.max(stage.clientWidth,1),height=Math.max(stage.clientHeight,1),aspect=width/height;
    renderer.setSize(width,height,false);
    const half=mode==='space'?10:6.5;
    camera.left=-half*Math.max(aspect,1);camera.right=half*Math.max(aspect,1);
    camera.top=half/Math.min(aspect,1);camera.bottom=-half/Math.min(aspect,1);
    camera.updateProjectionMatrix();render();
}
function render() {if(renderer&&!root.hidden)renderer.render(scene,camera);}
function updateReadout() {
    if(mode==='space') {
        metrics.innerHTML='<div><dt>Target range</dt><dd>'+orbitRange(orbit,orbitOptions.target).toFixed(1)+' m</dd></div><div><dt>Relative speed</dt><dd>'+Math.hypot(...orbit.v).toFixed(3)+' m/s</dd></div><div><dt>Δv used</dt><dd>'+orbit.deltaV.toFixed(2)+' m/s</dd></div>';
        read('experiment-clock').textContent=Math.round(orbit.time)+' s · 40×';
        root.dataset.simTime=String(orbit.time); root.dataset.range=String(orbitRange(orbit,orbitOptions.target));
    } else {
        metrics.innerHTML='<div><dt>Structure</dt><dd>'+Math.round(perception.coherence*100)+'%</dd></div><div><dt>Depth cues</dt><dd>'+Math.round(perception.depth*100)+'%</dd></div><div><dt>View angle</dt><dd>'+Math.round(phase*180/Math.PI)%360+'°</dd></div>';
        read('experiment-clock').textContent=playing?'Rotating':'Paused';
        root.dataset.phase=String(phase);
    }
}
function configure(nextMode) {
    pause();mode=nextMode;
    root.setAttribute('aria-labelledby', mode==='space'?'experiment-title':'perception-title');
    if(!initialized)return;
    disposeScene();scene=new THREE.Scene();scene.background=new THREE.Color(0x091013);
    camera=new THREE.OrthographicCamera(-10,10,10,-10,.1,100);
    if(mode==='space') {
        camera.position.set(11,13,17);camera.lookAt(0,0,0);buildSpace();updateSpace();
    } else {
        camera.position.set(0,0,20);camera.lookAt(0,0,0);buildPerception();
    }
    controls.forEach(el=>el.disabled=false);
    read('experiment-canvas').setAttribute('aria-label',mode==='space'?'Relative orbital rendezvous simulation. Space toggles play.':'Structure from motion experiment. Space toggles play; arrow keys turn the form.');
    setStatus(mode==='space'?'Rendezvous ready. Choose Play to begin.':'Paused. Turn the form manually or choose Play.');
    updateReadout();resize();
}
function initialize() {
    if(initialized)return;
    try {
        const context=canvas.getContext('webgl2',{antialias:true});
        if(!context)throw new Error('WebGL2 unavailable');
        renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,powerPreference:'low-power'});
        renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
        renderer.outputColorSpace=THREE.SRGBColorSpace;
        initialized=true;canvas.hidden=false;read('experiment-fallback').hidden=true;root.dataset.webgl='available';
        configure(mode);
    } catch {
        controls.forEach(el=>el.disabled=true);root.dataset.webgl='unavailable';
        canvas.hidden=true;read('experiment-fallback').hidden=false;
        setStatus('WebGL unavailable. The explanation remains readable; simulation controls are disabled.');
    }
}
function tick(time) {
    if(!playing||!visible||root.hidden||document.hidden){pause();return;}
    const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;elapsed+=dt;
    if(mode==='space') {
        accumulator+=dt*40;
        while(accumulator>=.5&&!orbit.done){stepOrbit(orbit,orbitOptions);accumulator-=.5;}
        updateSpace();
        if(elapsed-lastReadout>.1){updateSpace(true);refreshPrediction();}
        if(orbit.done)pause('Run stopped at the model time or range limit. Reset to try another approach.');
    } else {
        phase=(phase+dt*.35*direction+Math.PI*2)%(Math.PI*2);updatePerception();
        read('perception-phase').value=String(phase*180/Math.PI);
        read('perception-phase-value').textContent=String(Math.round(phase*180/Math.PI));
    }
    if(elapsed-lastReadout>.1){updateReadout();lastReadout=elapsed;}
    render();
}
function togglePlay() {
    if(!initialized||root.hidden)return;
    if(playing){pause('Paused. Adjust a control or choose Play.');return;}
    if(orbit.done&&mode==='space'){setStatus('Reset the completed run before playing.');return;}
    playing=true;lastTime=0;play.textContent='Pause';play.setAttribute('aria-pressed','true');
    setStatus(mode==='space'?'Running at 40× simulated time.':'Rotating slowly. Pause whenever you like.');
    renderer.setAnimationLoop(tick);
}
play.addEventListener('click',togglePlay);
read('experiment-reset').addEventListener('click',()=>{
    orbit=createOrbit();trailPoints=[];phase=Math.PI/6;elapsed=0;accumulator=0;lastReadout=0;
    read('perception-phase').value='30';read('perception-phase-value').textContent='30';
    configure(mode);
});
for(const name of ['thrust','target'])read('space-'+name).addEventListener('input',event=>{
    orbitOptions[name]=Number(event.target.value);read('space-'+name+'-value').textContent=event.target.value;
    if(initialized){updateSpace();refreshPrediction();updateReadout();render();}
});
read('space-guided').addEventListener('change',event=>{orbitOptions.guided=event.target.checked;refreshPrediction();render();});
read('space-impulse').addEventListener('click',()=>{
    orbit.v[0]+=.12;refreshPrediction();updateReadout();render();setStatus('Added +0.12 m/s radial velocity. Play to follow the response.');
});
for(const name of ['coherence','depth','phase'])read('perception-'+name).addEventListener('input',event=>{
    const value=Number(event.target.value);read('perception-'+name+'-value').textContent=String(value);
    if(name==='phase'){pause('Manual view. Choose Play for motion.');phase=value*Math.PI/180;}
    else perception[name]=value/100;
    updatePerception();updateReadout();render();
});
read('perception-reverse').addEventListener('click',()=>{direction*=-1;setStatus('Rotation reversed. Choose Play to compare the motion.');});
canvas.addEventListener('keydown',event=>{
    if(event.key===' '){event.preventDefault();togglePlay();}
    if(mode==='perception'&&['ArrowLeft','ArrowRight'].includes(event.key)){
        event.preventDefault();pause('Manual view.');phase+=(event.key==='ArrowLeft'?-1:1)*Math.PI/36;
        phase=(phase+Math.PI*2)%(Math.PI*2);read('perception-phase').value=String(phase*180/Math.PI);
        read('perception-phase-value').textContent=String(Math.round(phase*180/Math.PI));updatePerception();updateReadout();render();
    }
});
document.addEventListener('portfolio:lab-change',event=>{
    pause();
    if(!['space','perception'].includes(event.detail)){root.dataset.nearViewport='false';document.dispatchEvent(new Event('portfolio:lab-visibility'));return;}
    configure(event.detail);
});
new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting&&!root.hidden;
    root.dataset.nearViewport=String(visible);document.dispatchEvent(new Event('portfolio:lab-visibility'));
    if(visible)initialize();else pause('Paused offscreen. Choose Play to continue.');
},{rootMargin:'120px 0px'}).observe(stage);
new ResizeObserver(resize).observe(stage);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('Paused while the tab was hidden.');});
if(['space','perception'].includes(document.body.dataset.activeLab))mode=document.body.dataset.activeLab;
