import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Load the browser ESM vendor files without changing this repository's CommonJS package.
const moduleUrl = text => 'data:text/javascript;base64,' + Buffer.from(text).toString('base64');
const core = moduleUrl(readFileSync(new URL('../assets/vendor/three/three.core.min.js', import.meta.url), 'utf8'));
const three = readFileSync(new URL('../assets/vendor/three/three.module.min.js', import.meta.url), 'utf8').replaceAll('./three.core.min.js', core);
const { CatmullRomCurve3, Vector3 } = await import(moduleUrl(three));
import { createDrive, stepDrive, DRIVE_DEFAULTS, createOrbit, stepOrbit, orbitRange, perceptionPoint, perceptionSamples, canSaveDriveRun, saveDriveRun, compareDriveRun } from '../assets/js/lab-models.mjs';

const samples=perceptionSamples();
assert.equal(samples.length,432);
assert.deepEqual(samples,perceptionSamples());
assert.equal(new Set(samples.map(s=>s.latitude)).size,432);
const bands=Array(12).fill(0);
const sphere=samples.map(s=>perceptionPoint(s.theta,s.latitude,0,0));
for(let i=0;i<sphere.length;i++) {
 const p=sphere[i];
 assert.ok(Math.abs(p.x*p.x+p.y*p.y+p.z*p.z-1)<1e-12);
 bands[Math.min(11,Math.floor((p.y+1)*6))]++;
 const nearest=Math.min(...sphere.filter((_,j)=>i!==j).map(q=>Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z)));
 assert.ok(nearest>.1 && nearest<.2,'surface dots remain evenly separated');
 const s=samples[i], a=perceptionPoint(s.theta,s.latitude,.3,0), b=perceptionPoint(-s.theta,s.latitude,-.3,0);
 assert.ok(Math.abs(a.x-b.x)<1e-12 && Math.abs(a.y-b.y)<1e-12);
 for(const cue of [0,.5,1]) {
  const projected=perceptionPoint(s.theta,s.latitude,.3,cue);
  assert.ok(Number.isFinite(projected.x+projected.y) && projected.alpha>=.3 && projected.alpha<=1);
 }
}
assert.ok(bands.every(n=>n===36),'equal-area height bands');
console.log('PASS: 432 deterministic evenly spaced surface dots, projection/reflection and bounded depth cues');
if(process.argv.includes('--perception'))process.exit(0);

const vertices=[[-5.8,-3.1],[-4.4,-2.55],[-3.25,-1.15],[-4.05,.9],[-2.55,2.45],[-.45,2.75],[.85,1.45],[1.6,-.05],[3.25,-.95],[5.55,-.45]];
const points=new CatmullRomCurve3(vertices.map(([x,z])=>new Vector3(x,0,z)),false,'centripetal',.35).getSpacedPoints(240).map(p=>({x:p.x,z:p.z}));
function drive(gains) {
 const state=createDrive(points), errors=[];
 for(let i=0;i<7200&&!state.done;i++){
  stepDrive(state,points,gains);
  assert.ok(Number.isFinite(state.x+state.z+state.heading));
  assert.ok(Math.abs(state.steering)<=.650001);
  assert.ok(Math.abs(state.integral)<=.700001);
  errors.push(state.error**2);
 }
 return {reason:state.reason,rms:Math.sqrt(errors.reduce((a,b)=>a+b,0)/errors.length),time:state.time,x:state.x,z:state.z};
}
const baseline=drive(DRIVE_DEFAULTS), noControl=drive({kp:0,ki:0,kd:0,speed:1.4}), aggressive=drive({kp:8,ki:2,kd:0,speed:3.5});
assert.deepEqual(baseline,drive(DRIVE_DEFAULTS));
assert.equal(baseline.reason,'Route complete');
assert.ok(baseline.rms<noControl.rms);
assert.notDeepEqual(aggressive,baseline);
function orbit(options){
 const s=createOrbit();
 for(let i=0;i<3600;i++){
  stepOrbit(s,options);
  assert.ok(s.p.every(Number.isFinite));
  assert.ok(s.force.every(f=>Math.abs(f)<=options.thrust+1e-9));
 }
 return {range:orbitRange(s,options.target),deltaV:s.deltaV,p:s.p};
}
const guided=orbit({guided:true,thrust:1,target:0}), drift=orbit({guided:false,thrust:1,target:0}), offset=orbit({guided:true,thrust:.2,target:50});
assert.ok(guided.range<2);
assert.ok(drift.range>guided.range*10);
assert.notDeepEqual(offset.p,guided.p);
assert.deepEqual(guided,orbit({guided:true,thrust:1,target:0}));
const p=perceptionPoint(.5,.2,.3,0), reflected=perceptionPoint(-.5,.2,-.3,0);
assert.ok(Math.abs(p.x-reflected.x)<1e-12 && Math.abs(p.y-reflected.y)<1e-12);
assert.equal(p.alpha,1);
assert.notEqual(perceptionPoint(.5,.2,.3,1).x,p.x);
// Comparison uses equal opening windows, never a shorter failed-run average.
const meta={id:1,scenario:'slalom',speed:1.4,speedChanged:false,gains:{...DRIVE_DEFAULTS},tuned:false,nudges:[]};
const savedState=createDrive(points);let squareSum=0;
assert.equal(canSaveDriveRun(savedState,meta),false);
for(let i=0;i<360;i++){stepDrive(savedState,points,DRIVE_DEFAULTS);squareSum+=savedState.error**2;}
const saved=saveDriveRun(savedState,meta);
assert.equal(saved.duration,3);assert.equal(saved.rms,Math.sqrt(squareSum/360));
assert.equal(compareDriveRun(savedState,meta,saved).status,'saved');
const current=createDrive(points), currentMeta={...meta,id:2};
for(let i=0;i<359;i++)stepDrive(current,points,{...DRIVE_DEFAULTS,kp:2});
assert.equal(compareDriveRun(current,currentMeta,saved).status,'waiting');
stepDrive(current,points,{...DRIVE_DEFAULTS,kp:2});
const matched=compareDriveRun(current,currentMeta,saved);
assert.equal(matched.status,'matched');assert.notEqual(matched.rms,saved.rms);
for(let i=0;i<120;i++)stepDrive(current,points,{...DRIVE_DEFAULTS,kp:2});
assert.equal(compareDriveRun(current,currentMeta,saved).rms,matched.rms);
assert.equal(compareDriveRun(current,{...currentMeta,scenario:'goose'},saved).status,'scenario');
assert.equal(compareDriveRun(current,{...currentMeta,speed:2},saved).status,'speed');
assert.equal(compareDriveRun(current,{...currentMeta,speedChanged:true},saved).status,'speed');
assert.equal(compareDriveRun(current,{...currentMeta,nudges:[0]},saved).status,'nudges');
assert.equal(compareDriveRun(current,{...currentMeta,nudges:[360]},saved).status,'matched');
const short=createDrive(points);short.done=true;short.reason='Run stopped at the track boundary or time limit';
assert.deepEqual(compareDriveRun(short,currentMeta,saved),{status:'stopped'});
assert.equal(saveDriveRun({...current,done:true,reason:short.reason},currentMeta),null);
assert.equal(compareDriveRun({...current,done:true,reason:short.reason},currentMeta,saved).failed,true);
assert.equal(saveDriveRun(current,{...currentMeta,speedChanged:true}),null);
meta.gains.kp=8;meta.nudges.push(0);
assert.equal(saved.gains.kp,1.35);assert.deepEqual(saved.nudges,[]);
assert.deepEqual(compareDriveRun(current,currentMeta,null),{status:'empty'});
console.log('PASS: exact-duration RMS, minimum window, immutable snapshot, reset identity, scenario/speed/nudge mismatch, early/late failure and clear');
console.log(JSON.stringify({baseline,noControl,aggressive,guided,drift,offset,perception:'orthographic ambiguity and depth cue verified'},null,2));
