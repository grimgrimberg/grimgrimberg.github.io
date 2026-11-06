// Rotating point cloud of real MaleCNS neuron positions. The poster image stays if WebGL or the data is unavailable.
const stage = document.getElementById('brain-stage');
const canvas = document.getElementById('brain-canvas');

const COLORS = [[0.85, 0.67, 0.31], [0.35, 0.78, 0.74], [0.62, 0.72, 0.7], [1, 0.46, 0.43]];

async function start() {
    const [THREE, response] = await Promise.all([
        import('../vendor/three/three.module.min.js'),
        fetch('assets/data/fly-brain-points.bin')
    ]);
    if (!response.ok) return;
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
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
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
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const state = { yaw: -0.35, pitch: 0.08, dragging: false, x: 0, y: 0, visible: true };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function draw() {
        cloud.rotation.set(state.pitch, state.yaw, 0);
        renderer.render(scene, camera);
    }

    const resize = () => {
        const { width, height } = stage.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        const narrow = width / height < 1;
        // Keep the brain clear of the headline; the nerve cord falls away below it.
        camera.position.z = narrow ? 6.2 : 3;
        rig.position.set(narrow ? 0 : 0.42, narrow ? 0.15 : -0.3, 0);
        material.opacity = narrow ? 0.14 : 0.24;
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
    new IntersectionObserver((entries) => {
        state.visible = entries[0].isIntersecting;
    }).observe(stage);

    stage.classList.add('is-live');
    if (reduced) return;
    renderer.setAnimationLoop(() => {
        if (!state.visible) return;
        if (!state.dragging) state.yaw += 0.0022;
        draw();
    });
}

if (stage && canvas && 'WebGL2RenderingContext' in window) {
    const begin = () => start().catch(() => {});
    if (document.readyState === 'complete') begin();
    else window.addEventListener('load', begin, { once: true });
}
