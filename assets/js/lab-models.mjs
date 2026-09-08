// Deterministic educational models. No renderer or browser state.
export const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
export const wrapAngle = x => Math.atan2(Math.sin(x), Math.cos(x));
export const DRIVE_DEFAULTS = Object.freeze({ kp: 1.35, ki: 0.08, kd: 0.25, speed: 1.4 });
export function createDrive(points, offset = 0.35) {
    const heading = Math.atan2(points[1].z - points[0].z, points[1].x - points[0].x);
    return { x: points[0].x - Math.sin(heading)*offset, z: points[0].z + Math.cos(heading)*offset,
        heading, steering: 0, integral: 0, previous: 0, derivative: 0, first: true,
        nearest: 0, error: offset, headingError: 0, time: 0, done: false, reason: '',
        steps: 0, errorSum: 0, errorSums: [0] };
}
export function stepDrive(s, points, gains, dt = 1/120) {
    if (s.done) return s;
    // Search a local forward window so a crossing does not jump to another route leg.
    let best = Infinity, index = s.nearest;
    for (let i=Math.max(0,s.nearest-3); i<Math.min(points.length,s.nearest+45); i++) {
        const d=(points[i].x-s.x)**2+(points[i].z-s.z)**2;
        if(d<best) {best=d; index=i;}
    }
    s.nearest=index;
    let target=index, ahead=0;
    while(target<points.length-1 && ahead<0.8) {
        ahead+=Math.hypot(points[target+1].x-points[target].x,points[target+1].z-points[target].z); target++;
    }
    const p=points[index], next=points[Math.min(index+1,points.length-1)];
    const tangent=Math.atan2(next.z-p.z,next.x-p.x);
    s.error=-(s.x-p.x)*Math.sin(tangent)+(s.z-p.z)*Math.cos(tangent);
    const error=wrapAngle(Math.atan2(points[target].z-s.z,points[target].x-s.x)-s.heading);
    const rawDerivative=s.first?0:wrapAngle(error-s.previous)/dt;
    s.derivative+=(rawDerivative-s.derivative)*dt/(0.12+dt);
    s.first=false; s.previous=error; s.headingError=error;
    const integral=clamp(s.integral+error*dt,-0.7,0.7);
    const raw=gains.kp*error+gains.ki*integral+gains.kd*s.derivative;
    const command=clamp(raw,-0.65,0.65);
    // Conditional integration and a finite steering rate prevent runaway windup.
    if(Math.abs(raw)<=0.65 || Math.sign(error)!==Math.sign(raw)) s.integral=integral;
    s.steering+=clamp(command-s.steering,-1.8*dt,1.8*dt);
    s.heading=wrapAngle(s.heading+gains.speed/0.85*Math.tan(s.steering)*dt);
    s.x+=gains.speed*Math.cos(s.heading)*dt;
    s.z+=gains.speed*Math.sin(s.heading)*dt;
    s.time+=dt;
    // Prefix sums every 12 fixed steps let runs share an exact 0.1 s window.
    s.errorSum+=s.error*s.error; s.steps++;
    if(s.steps%12===0) s.errorSums.push(s.errorSum);
    const finish=points[points.length-1];
    if(index>points.length-12 && Math.hypot(s.x-finish.x,s.z-finish.z)<0.4) {
        s.done=true; s.reason='Route complete';
    } else if(Math.abs(s.x)>7.3 || Math.abs(s.z)>4.5 || s.time>60) {
        s.done=true; s.reason='Run stopped at the track boundary or time limit';
    }
    return s;
}

export function canSaveDriveRun(s, run) {
    return s.errorSums.length>30 && !run.speedChanged && (!s.done || s.reason==='Route complete');
}
export function saveDriveRun(s, run) {
    if(!canSaveDriveRun(s,run)) return null;
    const samples=s.errorSums.length-1;
    return {...run, gains:{...run.gains}, nudges:run.nudges.filter(step=>step<samples*12), samples,
        duration:samples/10, rms:Math.sqrt(s.errorSums[samples]/(samples*12))};
}
export function compareDriveRun(s, run, saved) {
    if(!saved) return {status:'empty'};
    if(run.id===saved.id) return {status:'saved'};
    if(run.scenario!==saved.scenario) return {status:'scenario'};
    if(run.speedChanged || run.speed!==saved.speed) return {status:'speed'};
    if(s.errorSums.length<=saved.samples) return {status:s.done?'stopped':'waiting'};
    const nudges=run.nudges.filter(step=>step<saved.samples*12);
    if(JSON.stringify(nudges)!==JSON.stringify(saved.nudges)) return {status:'nudges'};
    return {status:'matched', rms:Math.sqrt(s.errorSums[saved.samples]/(saved.samples*12)),
        failed:s.done&&s.reason!=='Route complete'};
}

// CW/LVLH model: x radial, y along-track, z normal, metres and seconds.
// Mean motion and 100 kg mass match the linked orbital-rendezvous-lqi source.
export const ORBIT_N = Math.sqrt((6.674e-11*5.972e24)/(7071e3)**3);
export function createOrbit() {
    return { p:[120,-80,40], v:[0.02,-0.03,0.01], force:[0,0,0], time:0, deltaV:0, done:false };
}
export function stepOrbit(s, { thrust=1, target=0, guided=true }, dt=0.5) {
    if(s.done) return s;
    const n=ORBIT_N, targetPosition=[0,target,0];
    s.force=s.p.map((p,i)=>guided?clamp(100*(-0.00004*(p-targetPosition[i])-0.012*s.v[i]),-thrust,thrust):0);
    const derivative=(p,v)=>[
        3*n*n*p[0]+2*n*v[1]+s.force[0]/100,
        -2*n*v[0]+s.force[1]/100,
        -n*n*p[2]+s.force[2]/100
    ];
    // Midpoint integration with constant control over each half-second step.
    const a=derivative(s.p,s.v);
    const midP=s.p.map((p,i)=>p+s.v[i]*dt/2), midV=s.v.map((v,i)=>v+a[i]*dt/2);
    const midA=derivative(midP,midV);
    s.p=s.p.map((p,i)=>p+midV[i]*dt); s.v=s.v.map((v,i)=>v+midA[i]*dt);
    s.deltaV+=Math.hypot(...s.force)/100*dt; s.time+=dt;
    s.done=s.time>=3600 || Math.hypot(...s.p)>1500;
    return s;
}
export function orbitRange(s,target=0) {return Math.hypot(s.p[0],s.p[1]-target,s.p[2]);}

// Equal-area heights and the golden angle avoid visible latitude rows.
export function perceptionSamples(count=432) {
    const goldenAngle=Math.PI*(3-Math.sqrt(5));
    return Array.from({length:count},(_,i)=>({
        theta:i*goldenAngle, latitude:Math.asin(1-2*(i+.5)/count),
        noiseX:Math.sin(i*17.31)*1.2, noiseY:Math.cos(i*9.73)*1.2
    }));
}

// Orthographic projection of a rotating dot sphere. With no depth cue,
// depth reflection plus reversed rotation produces the same 2D image.
export function perceptionPoint(theta, latitude, phase, depthCue=0) {
    const r=Math.cos(latitude), x=r*Math.cos(theta+phase), z=r*Math.sin(theta+phase);
    const y=Math.sin(latitude);
    const scale=1/(1-z*0.24*depthCue);
    return {x:x*scale,y:y*scale,z,alpha:1-depthCue*(0.7-(z+1)*0.35)};
}
