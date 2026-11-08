// Rotating point cloud of real MaleCNS neuron positions, used by the Fly101 page and the homepage lab.
// Anatomy only: no neural activity is simulated here. A poster or status line stays if WebGL or the data fails.
const COLORS = [[0.85, 0.67, 0.31], [0.35, 0.78, 0.74], [0.62, 0.72, 0.7], [1, 0.46, 0.43]];
const DATA_URL = new URL('../data/fly-brain-points.bin', import.meta.url);

const FRAMINGS = {
    // Keeps the brain clear of the headline; the nerve cord falls away below it.
    hero: (narrow) => ({ z: narrow ? 6.2 : 3, x: narrow ? 0 : 0.42, y: narrow ? 0.15 : -0.3, opacity: narrow ? 0.14 : 0.24 }),
    panel: (narrow) => ({ z: narrow ? 3.9 : 2.9, x: 0, y: 0, opacity: narrow ? 0.13 : 0.2 })
};

export async function mountBrain({ stage, canvas, framing = 'hero' }) {
    const [THREE, response] = await Promise.all([
        import('../vendor/three/three.module.min.js'),
        fetch(DATA_URL)
    ]);
    if (!response.ok) throw new Error('Neuron positions failed to load');
    const buffer = await response.arrayBuffer();
    const count = buffer.byteLength / 7;
    const raw = new Int16Array(buffer, 0, count * 3);
    const regions = new Uint8Array(buffer, count * 6, count);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = raw[i * 3] / 32000;
        positions[i * 3 + 1] = -raw[i * 3 + 2] / 32000;
        positions[i * 3 + 2] = raw[i * 3 + 1] / 32000;
        colors.set(COLORS[regions[i]], i * 3);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const colorAttribute = new THREE.BufferAttribute(colors, 3);
    geometry.setAttribute('color', colorAttribute);
    geometry.center();
    const material = new THREE.PointsMaterial({
        size: 1.4, sizeAttenuation: false, vertexColors: true,
        transparent: true, opacity: 0.24, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const cloud = new THREE.Points(geometry, material);
    const rig = new THREE.Group();
    rig.add(cloud);
    const scene = new THREE.Scene();
    scene.add(rig);
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
    renderer.setClearColor(0x05070a);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const state = { yaw: -0.35, pitch: 0.08, dragging: false, x: 0, y: 0, visible: true };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function draw() {
        cloud.rotation.set(state.pitch, state.yaw, 0);
        renderer.render(scene, camera);
    }

    const resize = () => {
        const { width, height } = stage.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        const view = FRAMINGS[framing](width / height < 1);
        camera.position.z = view.z;
        rig.position.set(view.x, view.y, 0);
        material.opacity = view.opacity;
        camera.updateProjectionMatrix();
        draw();
    };
    resize();
    new ResizeObserver(resize).observe(stage);

    canvas.addEventListener('pointerdown', (event) => {
        state.dragging = true;
        state.x = event.clientX;
        state.y = event.clientY;
        canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', (event) => {
        if (!state.dragging) return;
        state.yaw += (event.clientX - state.x) * 0.006;
        state.pitch = Math.max(-0.9, Math.min(0.9, state.pitch + (event.clientY - state.y) * 0.004));
        state.x = event.clientX;
        state.y = event.clientY;
        if (reduced) draw();
    });
    const release = () => {
        state.dragging = false;
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('keydown', (event) => {
        const steps = { ArrowLeft: -0.15, ArrowRight: 0.15 };
        if (!(event.key in steps)) return;
        event.preventDefault();
        state.yaw += steps[event.key];
        draw();
    });
    // The loop runs only while the stage is on screen and the GPU context is alive; off screen it costs nothing.
    let contextLost = false;
    const syncLoop = () => {
        const spin = !reduced && state.visible && !contextLost;
        renderer.setAnimationLoop(spin ? () => {
            if (!state.dragging) state.yaw += 0.0022;
            draw();
        } : null);
    };
    new IntersectionObserver((entries) => {
        state.visible = entries[0].isIntersecting;
        syncLoop();
    }).observe(stage);
    canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        contextLost = true;
        syncLoop();
        stage.classList.remove('is-live');
    });
    canvas.addEventListener('webglcontextrestored', () => {
        contextLost = false;
        stage.classList.add('is-live');
        draw();
        syncLoop();
    });

    stage.classList.add('is-live');
    syncLoop();

    return {
        // Additive blending makes black points invisible, so a region can switch off without rebuilding anything.
        setRegion(region, visible) {
            const color = visible ? COLORS[region] : [0, 0, 0];
            for (let i = 0; i < count; i++) {
                if (regions[i] === region) colors.set(color, i * 3);
            }
            colorAttribute.needsUpdate = true;
            draw();
        }
    };
}

const heroStage = document.getElementById('brain-stage');
const heroCanvas = document.getElementById('brain-canvas');
if (heroStage && heroCanvas && 'WebGL2RenderingContext' in window) {
    // On fly101.html the poster image is the fallback, so failure only needs to be visible to tests and agents.
    const hero = window.PortfolioState?.defineLoader('brain-hero');
    const begin = () => {
        hero?.send('load');
        mountBrain({ stage: heroStage, canvas: heroCanvas })
            .then(() => hero?.send('resolve'))
            .catch(() => hero?.send('reject'));
    };
    if (document.readyState === 'complete') begin();
    else window.addEventListener('load', begin, { once: true });
}
