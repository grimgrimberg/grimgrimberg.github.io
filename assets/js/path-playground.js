import * as THREE from '../vendor/three/three.module.min.js';
import { createDrive, stepDrive, DRIVE_DEFAULTS, canSaveDriveRun, saveDriveRun, compareDriveRun } from './lab-models.mjs';

(() => {
    'use strict';

    const root = document.getElementById('path-playground');
    if (!root) {
        return;
    }

    const canvas = document.getElementById('path-canvas');
    const stage = document.getElementById('path-stage');
    const fallback = document.getElementById('path-fallback');
    const playToggle = document.getElementById('path-play-toggle');
    const playLabel = document.getElementById('path-play-label');
    const playIcon = root.querySelector('.path-play-icon');
    const routeStatus = document.getElementById('path-status');
    const frameReadout = document.getElementById('path-frame-readout');
    const scenarioButtons = Array.from(root.querySelectorAll('[data-path-scenario]'));
    const controlButtons = Array.from(root.querySelectorAll('button, input'));
    const gains = { ...DRIVE_DEFAULTS };

    const SCENARIOS = Object.freeze({
        slalom: {
            label: 'Slalom',
            number: '01',
            points: [[-5.8, -3.1], [-4.4, -2.55], [-3.25, -1.15], [-4.05, 0.9], [-2.55, 2.45], [-0.45, 2.75], [0.85, 1.45], [1.6, -0.05], [3.25, -0.95], [5.55, -0.45]],
            obstacles: [
                { type: 'cone', position: [-3.18, -0.32] },
                { type: 'cone', position: [-2.4, 1.15] },
                { type: 'cone', position: [0.1, 0.85] },
                { type: 'cone', position: [2.7, -0.22] }
            ]
        },
        crossing: {
            label: 'Cross track',
            number: '02',
            points: [[-5.8, -2.8], [-4.1, -2.25], [-2.25, -2.05], [-0.9, -0.8], [0.5, -1.2], [2.15, 0.2], [3.9, 0.35], [5.55, 1.9]],
            obstacles: [
                { type: 'cone', position: [-2.1, -0.65] },
                { type: 'cone', position: [0.1, 0.25] },
                { type: 'cone', position: [2.25, 1.75] },
                { type: 'cone', position: [3.55, -0.9] }
            ]
        },
        goose: {
            label: 'Goose crossing',
            number: '03',
            points: [[-5.8, -2.85], [-4.45, -2.4], [-3.2, -1.15], [-2.15, 0.25], [-0.65, 1.1], [0.85, 1.55], [2.2, 1.15], [3.45, 1.9], [5.55, 2.35]],
            obstacles: [
                { type: 'cone', position: [-3.15, -0.2] },
                { type: 'goose', position: [0.45, 0.4] },
                { type: 'cone', position: [2.1, 0.05] },
                { type: 'cone', position: [3.45, 0.85] }
            ]
        }
    });

    const state = {
        scenario: 'slalom',
        initialized: false,
        playing: false,
        progress: 0,
        lastTime: 0,
        azimuth: -0.68,
        elevation: 0.78,
        distance: 14,
        cameraAdjusted: false,
        dragging: false,
        pointerId: null,
        lastPointerX: 0,
        lastPointerY: 0
    };

    let scene;
    let camera;
    let renderer;
    let world;
    let scenarioGroup;
    let routeCurve;
    let routeLength = 1;
    let vehicle;
    let resizeObserver;
    let intersectionObserver;
    let routeSamples, simulation, actualTrail;
    let trailPoints = [], errors = [], accumulator = 0, lastSample = 0;
    let runMeta, savedRun = null, runSequence = 0;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function currentScenario() {
        return SCENARIOS[state.scenario] || SCENARIOS.slalom;
    }

    function setStatus(message) {
        if (routeStatus) {
            routeStatus.textContent = message;
        }
    }

    function setControlsEnabled(enabled) {
        controlButtons.forEach((button) => {
            button.disabled = !enabled;
        });
    }

    function updateReadout() {
        const scenario = currentScenario();
        const mode = state.playing ? 'running' : state.progress >= 0.999 ? 'complete' : 'stopped';
        if (frameReadout) {
            frameReadout.textContent = `route ${scenario.number} · ${mode}`;
        }
        if (playLabel) {
            playLabel.textContent = state.playing ? 'Pause route' : 'Play route';
        }
        if (playIcon) {
            playIcon.textContent = state.playing ? 'Ⅱ' : '▶';
        }
        playToggle?.setAttribute('aria-pressed', String(state.playing));
        updateComparison();
        canvas?.setAttribute(
            'aria-label',
            `${scenario.label} 3D path planning playground. The vehicle is ${state.playing ? 'moving' : 'stopped'} on the selected route.`
        );
    }

    function updateScenarioButtons() {
        scenarioButtons.forEach((button) => {
            const active = button.dataset.pathScenario === state.scenario;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        root.dataset.pathScenario = state.scenario;
        updateReadout();
    }

    function getFramingDistance() {
        if (!camera || !stage) {
            return 14;
        }

        const scenario = currentScenario();
        const positions = [
            [-7.9, -5.1],
            [-7.9, 5.1],
            [7.9, -5.1],
            [7.9, 5.1],
            ...scenario.points,
            ...scenario.obstacles.map((obstacle) => obstacle.position)
        ];
        const xValues = positions.map(([x]) => x);
        const zValues = positions.map(([, z]) => z);
        const width = Math.max(...xValues) - Math.min(...xValues) + 1.7;
        const depth = Math.max(...zValues) - Math.min(...zValues) + 1.7;
        const rect = stage.getBoundingClientRect();
        const aspect = Math.max(rect.width / Math.max(rect.height, 1), 0.75);
        const verticalFov = THREE.MathUtils.degToRad(camera.fov);
        const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
        const widthDistance = (width / 2) / Math.tan(horizontalFov / 2);
        const depthDistance = (depth / 2) / Math.tan(verticalFov / 2);

        return clamp(Math.max(widthDistance, depthDistance) * 1.12 + 0.9, 14, 30);
    }

    function makeMaterial(color, roughness = 0.76, metalness = 0.08) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness
        });
    }

    function makeBox(width, height, depth, color, position, materialOptions = {}) {
        const material = makeMaterial(color, materialOptions.roughness, materialOptions.metalness);
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
        mesh.position.set(position[0], position[1], position[2]);
        return mesh;
    }

    function addTabletop() {
        const table = makeBox(15.8, 0.55, 10.2, 0x10191b, [0, -0.42, 0], { roughness: 0.9 });
        world.add(table);

        const surface = new THREE.Mesh(
            new THREE.PlaneGeometry(14.8, 9.35),
            makeMaterial(0x172326, 0.94)
        );
        surface.rotation.x = -Math.PI / 2;
        surface.position.y = -0.13;
        world.add(surface);

        const grid = new THREE.GridHelper(14.2, 14, 0x58c7bc, 0x314044);
        grid.scale.z = 0.66;
        grid.position.y = -0.105;
        grid.material.transparent = true;
        grid.material.opacity = 0.36;
        world.add(grid);

        const rails = [
            makeBox(15.1, 0.16, 0.14, 0x65706a, [0, 0.03, -4.75], { roughness: 0.68, metalness: 0.18 }),
            makeBox(15.1, 0.16, 0.14, 0x65706a, [0, 0.03, 4.75], { roughness: 0.68, metalness: 0.18 }),
            makeBox(0.14, 0.16, 9.65, 0xd8aa4f, [-7.55, 0.03, 0], { roughness: 0.64, metalness: 0.2 }),
            makeBox(0.14, 0.16, 9.65, 0xd8aa4f, [7.55, 0.03, 0], { roughness: 0.64, metalness: 0.2 })
        ];
        rails.forEach((rail) => world.add(rail));

        const cornerLights = [
            [-7.1, 0.12, -4.35],
            [7.1, 0.12, -4.35],
            [-7.1, 0.12, 4.35],
            [7.1, 0.12, 4.35]
        ];
        cornerLights.forEach(([x, y, z], index) => {
            const beacon = new THREE.Mesh(
                new THREE.CylinderGeometry(0.13, 0.13, 0.08, 16),
                makeMaterial(index % 2 ? 0x58c7bc : 0xd8aa4f, 0.5, 0.15)
            );
            beacon.position.set(x, y, z);
            world.add(beacon);
        });
    }

    function createVehicle() {
        const car = new THREE.Group();
        const body = makeBox(0.72, 0.28, 1.12, 0xd8aa4f, [0, 0.32, 0], { roughness: 0.56, metalness: 0.24 });
        const cabin = makeBox(0.48, 0.22, 0.48, 0x58c7bc, [0, 0.56, -0.02], { roughness: 0.48, metalness: 0.18 });
        const nose = makeBox(0.5, 0.07, 0.14, 0xff766d, [0, 0.39, 0.52], { roughness: 0.6 });
        car.add(body, cabin, nose);

        [-0.37, 0.37].forEach((x) => {
            const wheel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.13, 0.13, 0.08, 12),
                makeMaterial(0x05070a, 0.88)
            );
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(x, 0.18, 0.34);
            car.add(wheel);

            const rearWheel = wheel.clone();
            rearWheel.position.z = -0.34;
            car.add(rearWheel);
        });

        return car;
    }

    function createCone(position) {
        const cone = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.ConeGeometry(0.17, 0.46, 4),
            makeMaterial(0xd8aa4f, 0.62, 0.12)
        );
        body.position.y = 0.23;
        cone.add(body);

        const band = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.13, 0.07, 4),
            makeMaterial(0x10191b, 0.7)
        );
        band.position.y = 0.22;
        cone.add(band);

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.24, 0.06, 12),
            makeMaterial(0x263336, 0.84)
        );
        base.position.y = 0.03;
        cone.add(base);
        cone.position.set(position[0], 0, position[1]);
        return cone;
    }

    function createGoose(position) {
        const goose = new THREE.Group();
        const green = makeMaterial(0x9bd66b, 0.82);
        const coral = makeMaterial(0xff766d, 0.64);
        const dark = makeMaterial(0x10191b, 0.88);

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.37, 16, 10), green);
        body.scale.set(1.15, 0.72, 0.92);
        body.position.y = 0.34;
        goose.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 10), green);
        head.position.set(0.25, 0.68, 0.03);
        goose.add(head);

        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.4, 12), green);
        neck.position.set(0.16, 0.52, 0.03);
        neck.rotation.z = -0.35;
        goose.add(neck);

        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 3), coral);
        beak.position.set(0.49, 0.68, 0.03);
        beak.rotation.z = -Math.PI / 2;
        goose.add(beak);

        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), dark);
        eye.position.set(0.34, 0.77, -0.14);
        goose.add(eye);

        const wing = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), makeMaterial(0x78ad5c, 0.86));
        wing.scale.set(0.72, 0.6, 0.5);
        wing.position.set(-0.15, 0.4, -0.32);
        goose.add(wing);

        goose.position.set(position[0], 0, position[1]);
        return goose;
    }

    function createBeacon(position, color) {
        const beacon = new THREE.Group();
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.22, 0.035, 20),
            makeMaterial(color, 0.52, 0.14)
        );
        base.position.y = 0.02;
        beacon.add(base);

        const point = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, 0.12, 12),
            makeMaterial(color, 0.45, 0.12)
        );
        point.position.y = 0.1;
        beacon.add(point);
        beacon.position.set(position[0], 0, position[1]);
        return beacon;
    }

    function disposeObject(object) {
        object.traverse((child) => {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
            } else {
                child.material?.dispose();
            }
        });
    }

    function rebuildScenario() {
        const scenario = currentScenario();
        if (scenarioGroup) {
            world.remove(scenarioGroup);
            disposeObject(scenarioGroup);
        }

        scenarioGroup = new THREE.Group();
        const points = scenario.points.map(([x, z]) => new THREE.Vector3(x, 0.16, z));
        routeCurve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.35);
        routeLength = Math.max(routeCurve.getLength(), 1);

        const route = new THREE.Mesh(
            new THREE.TubeGeometry(routeCurve, 96, 0.075, 6, false),
            new THREE.MeshStandardMaterial({
                color: 0x58c7bc,
                emissive: 0x164c48,
                emissiveIntensity: 0.42,
                roughness: 0.5,
                metalness: 0.08
            })
        );
        scenarioGroup.add(route);

        const routePoints = routeCurve.getPoints(16);
        routePoints.forEach((point, index) => {
            if (index === 0 || index === routePoints.length - 1 || index % 2 === 0) {
                const marker = new THREE.Mesh(
                    new THREE.SphereGeometry(0.055, 8, 6),
                    makeMaterial(0xb4eee1, 0.55, 0.05)
                );
                marker.position.copy(point);
                marker.position.y = 0.25;
                scenarioGroup.add(marker);
            }
        });

        scenario.obstacles.forEach((obstacle) => {
            if (obstacle.type === 'goose') {
                scenarioGroup.add(createGoose(obstacle.position));
            } else {
                scenarioGroup.add(createCone(obstacle.position));
            }
        });

        scenarioGroup.add(createBeacon(scenario.points[0], 0x9bd66b));
        scenarioGroup.add(createBeacon(scenario.points[scenario.points.length - 1], 0xd8aa4f));
        vehicle = createVehicle();
        scenarioGroup.add(vehicle);
        routeSamples = routeCurve.getSpacedPoints(240).map(p => ({x:p.x,z:p.z}));
        actualTrail = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({color:0xd8aa4f}));
        scenarioGroup.add(actualTrail);
        world.add(scenarioGroup);
        state.progress = 0;
        resetSimulation();
        updateVehicle();
        updateScenarioButtons();
    }

    function updateVehicle() {
        if (!simulation || !vehicle) {
            return;
        }
        vehicle.position.set(simulation.x, 0.02, simulation.z);
        vehicle.rotation.y = Math.PI/2 - simulation.heading;
    }

    function resetSimulation() {
        simulation = createDrive(routeSamples);
        runMeta = {id:++runSequence, scenario:state.scenario, speed:gains.speed, speedChanged:false,
            gains:{...gains}, tuned:false, nudges:[]};
        accumulator = 0; lastSample = -1; errors = []; trailPoints = [];
        sampleSimulation();
    }

    function sampleSimulation() {
        if (!simulation) return;
        lastSample = simulation.time;
        trailPoints.push(new THREE.Vector3(simulation.x, 0.22, simulation.z));
        if (trailPoints.length > 600) trailPoints.shift();
        actualTrail.geometry.dispose();
        actualTrail.geometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
        errors.push(simulation.error);
        if (errors.length > 120) errors.shift();
        document.getElementById('drive-error').textContent = simulation.error.toFixed(2)+' m';
        document.getElementById('drive-heading').textContent = (simulation.headingError*180/Math.PI).toFixed(1)+'°';
        document.getElementById('drive-steering').textContent = (simulation.steering*180/Math.PI).toFixed(1)+'°';
        document.getElementById('drive-error-history').setAttribute('points', errors.map((e,i) => (i*300/119).toFixed(1)+','+(28-clamp(e,-2,2)*12).toFixed(1)).join(' '));
        root.dataset.simTime = simulation.time.toFixed(3);
        root.dataset.simPosition = simulation.x.toFixed(3)+','+simulation.z.toFixed(3);
    }

    function updateComparison() {
        if (!simulation || !runMeta) return;
        const saveButton = document.getElementById('drive-save-run');
        saveButton.disabled = !state.initialized || state.playing || !canSaveDriveRun(simulation,runMeta);
        saveButton.textContent = savedRun ? 'Replace saved run' : 'Save this run';
        document.getElementById('drive-clear-run').disabled = !state.initialized || !savedRun;
        const result = compareDriveRun(simulation,runMeta,savedRun);
        const duration = savedRun?.duration.toFixed(1);
        let message = 'Pause after 3 seconds to save a baseline.';
        if (!savedRun && runMeta.speedChanged) message = 'Speed changed during this run. Reset before saving a fixed-speed baseline.';
        else if (!savedRun && simulation.done && simulation.reason!=='Route complete') message = 'This run stopped before completing the route. Reset before saving a baseline.';
        else if (!savedRun && simulation.time>=3) message = state.playing ? 'Pause to save this run.' : 'Ready to save this opening time window.';
        const messages = {
            saved:'Saved. Reset the route, adjust the gains and run again.',
            scenario:'Choose '+(savedRun ? SCENARIOS[savedRun.scenario].label : '')+' or clear the saved run.',
            speed:'Use a fixed '+savedRun?.speed.toFixed(2)+' m/s. Reset after changing speed mid-run.',
            waiting:'Run to '+duration+' s to compare the same opening window.',
            stopped:'Stopped before '+duration+' s. No equal-duration comparison.',
            nudges:'Different heading disturbances. Repeat the saved nudge timing or clear the baseline.',
            matched:'Same first '+duration+' s only.'+(result.failed?' Current run later stopped short of route completion; these values do not describe a successful full run.':'')
        };
        if (result.status!=='empty') message = messages[result.status];
        const setText = (id,text) => {const el=document.getElementById(id);if(el.textContent!==text)el.textContent=text;};
        let summary = 'One baseline, kept only while this page is open.';
        if (savedRun) {
            const g=savedRun.gains;
            const tuning=savedRun.tuned?'gains adjusted during run':`Kp ${g.kp}, Ki ${g.ki}, Kd ${g.kd}`;
            const nudges=savedRun.nudges.length ? ' · nudges at '+savedRun.nudges.map(step=>(step/120).toFixed(2)+' s').join(', ') : ' · no nudges';
            summary=`${SCENARIOS[savedRun.scenario].label} · ${savedRun.speed.toFixed(2)} m/s · first ${duration} s · ${tuning}${nudges}`;
        }
        setText('drive-baseline-summary',summary);
        setText('drive-saved-rms',savedRun?savedRun.rms.toFixed(3)+' m':'—');
        setText('drive-current-rms',result.status==='matched'?result.rms.toFixed(3)+' m':'—');
        setText('drive-comparison-status',message);
        document.getElementById('drive-comparison').dataset.comparison=result.status;
    }

    function updateCamera() {
        if (!camera) {
            return;
        }

        const horizontal = Math.cos(state.elevation) * state.distance;
        camera.position.set(
            Math.sin(state.azimuth) * horizontal,
            Math.sin(state.elevation) * state.distance + 1.8,
            Math.cos(state.azimuth) * horizontal
        );
        camera.lookAt(0, 0.1, 0);
    }

    function render() {
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    function stopLoop() {
        if (renderer) {
            renderer.setAnimationLoop(null);
        }
    }

    function renderFrame(time) {
        if (!state.playing || !renderer) {
            return;
        }

        if (!state.lastTime) {
            state.lastTime = time;
        }
        const delta = Math.min((time - state.lastTime) / 1000, 0.05);
        state.lastTime = time;
        accumulator += delta;
        while (accumulator >= 1/120 && !simulation.done) {
            stepDrive(simulation, routeSamples, gains);
            accumulator -= 1/120;
        }
        state.progress = simulation.nearest / (routeSamples.length-1);
        if (simulation.time-lastSample >= 0.1) sampleSimulation();
        if (simulation.done) {
            state.playing = false;
            stopLoop();
            setStatus(simulation.reason+'. Reset the route to compare gains.');
        }

        updateVehicle();
        updateReadout();
        render();
    }

    function startLoop() {
        if (!renderer) {
            return;
        }
        state.lastTime = 0;
        renderer.setAnimationLoop(renderFrame);
    }

    function showFallback(message) {
        renderer?.dispose();
        renderer = null;
        state.initialized = false;
        state.playing = false;
        setControlsEnabled(false);
        stage?.classList.remove('is-ready');
        stage?.setAttribute('data-webgl', 'unavailable');
        canvas?.setAttribute('hidden', 'hidden');
        if (fallback) {
            fallback.hidden = false;
        }
        updateReadout();
        setStatus(message || 'WebGL preview unavailable. Static route diagram shown; controls are disabled.');
    }

    function resizeRenderer() {
        if (!renderer || !camera || !stage) {
            return;
        }

        const rect = stage.getBoundingClientRect();
        const width = Math.max(rect.width, 1);
        const height = Math.max(rect.height, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (!state.cameraAdjusted) {
            state.distance = getFramingDistance();
            updateCamera();
        }
        render();
    }

    function initScene() {
        if (state.initialized) {
            return true;
        }

        try {
            const context = canvas?.getContext('webgl2', { antialias: true, alpha: true });
            if (!context) {
                throw new Error('WebGL 2 is unavailable.');
            }

            renderer = new THREE.WebGLRenderer({
                canvas,
                context,
                antialias: true,
                alpha: true,
                powerPreference: 'low-power'
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
            renderer.setClearColor(0x091013, 1);
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.05;

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x091013);
            camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
            world = new THREE.Group();
            scene.add(world);

            scene.add(new THREE.HemisphereLight(0xd7eadf, 0x10191b, 2.3));
            const keyLight = new THREE.DirectionalLight(0xf2d18b, 3.1);
            keyLight.position.set(-5, 9, 6);
            scene.add(keyLight);
            const fillLight = new THREE.DirectionalLight(0x58c7bc, 1.55);
            fillLight.position.set(6, 4, -5);
            scene.add(fillLight);

            addTabletop();
            rebuildScenario();
            state.distance = getFramingDistance();
            updateCamera();
            state.initialized = true;
            root.dataset.pathReady = 'true';
            stage?.setAttribute('data-webgl', 'available');
            stage?.classList.add('is-ready');
            canvas?.removeAttribute('hidden');
            if (fallback) {
                fallback.hidden = true;
            }
            setControlsEnabled(true);
            resizeRenderer();
            setStatus(`${currentScenario().label} ready. Press play when you want motion.`);
            updateReadout();
            render();
            return true;
        } catch (error) {
            showFallback('WebGL preview unavailable. Static route diagram shown; controls are disabled.');
            return false;
        }
    }

    function setScenario(key) {
        if (!SCENARIOS[key]) {
            return;
        }

        state.scenario = key;
        state.playing = false;
        stopLoop();
        updateScenarioButtons();

        if (state.initialized) {
            rebuildScenario();
            if (!state.cameraAdjusted) {
                state.distance = getFramingDistance();
                updateCamera();
            }
            render();
        }
        setStatus(`${currentScenario().label} ready. Press play when you want motion.`);
    }

    function togglePlayback() {
        if (!state.initialized && !initScene()) {
            return;
        }

        if (simulation.done) {
            state.progress = 0;
            resetSimulation();
            updateVehicle();
        }

        state.playing = !state.playing;
        if (state.playing) {
            setStatus(`${currentScenario().label} running. Gains update live.`);
            startLoop();
        } else {
            setStatus(`${currentScenario().label} paused at ${Math.round(state.progress * 100)}%.`);
            stopLoop();
            render();
        }
        updateReadout();
    }

    function resetRoute() {
        state.playing = false;
        state.progress = 0;
        stopLoop();
        resetSimulation();
        updateVehicle();
        updateReadout();
        setStatus(`${currentScenario().label} reset. Press play when you want motion.`);
        render();
    }

    function resetCamera() {
        state.azimuth = -0.68;
        state.elevation = 0.78;
        state.cameraAdjusted = false;
        state.distance = getFramingDistance();
        updateCamera();
        render();
        setStatus(`${currentScenario().label} camera reset. Drag the scene to inspect it.`);
    }

    function handleCanvasKeydown(event) {
        const step = 0.1;
        if (event.key === 'ArrowLeft') {
            state.azimuth -= step;
        } else if (event.key === 'ArrowRight') {
            state.azimuth += step;
        } else if (event.key === 'ArrowUp') {
            state.elevation = clamp(state.elevation + step, 0.35, 1.18);
        } else if (event.key === 'ArrowDown') {
            state.elevation = clamp(state.elevation - step, 0.35, 1.18);
        } else if (event.key === '+' || event.key === '=') {
            state.distance = clamp(state.distance - 0.6, 9, 30);
        } else if (event.key === '-' || event.key === '_') {
            state.distance = clamp(state.distance + 0.6, 9, 30);
        } else if (event.key === ' ') {
            event.preventDefault();
            togglePlayback();
            return;
        } else {
            return;
        }

        event.preventDefault();
        state.cameraAdjusted = true;
        updateCamera();
        render();
    }

    function beginDrag(event) {
        if (!state.initialized) {
            return;
        }
        state.dragging = true;
        state.pointerId = event.pointerId;
        state.lastPointerX = event.clientX;
        state.lastPointerY = event.clientY;
        canvas.setPointerCapture?.(event.pointerId);
    }

    function moveDrag(event) {
        if (!state.dragging || event.pointerId !== state.pointerId) {
            return;
        }
        const deltaX = event.clientX - state.lastPointerX;
        const deltaY = event.clientY - state.lastPointerY;
        state.lastPointerX = event.clientX;
        state.lastPointerY = event.clientY;
        state.cameraAdjusted = true;
        state.azimuth -= deltaX * 0.008;
        state.elevation = clamp(state.elevation + deltaY * 0.006, 0.35, 1.18);
        updateCamera();
        render();
    }

    function endDrag(event) {
        if (event.pointerId !== state.pointerId) {
            return;
        }
        state.dragging = false;
        state.pointerId = null;
        canvas.releasePointerCapture?.(event.pointerId);
    }

    function handleWheel(event) {
        if (!state.initialized) {
            return;
        }
        event.preventDefault();
        state.cameraAdjusted = true;
        state.distance = clamp(state.distance + event.deltaY * 0.012, 9, 30);
        updateCamera();
        render();
    }

    function initInteractions() {
        for (const key of Object.keys(gains)) {
            const input = document.getElementById('drive-'+key);
            input.addEventListener('input', () => {
                gains[key] = Number(input.value);
                document.getElementById('drive-'+key+'-value').textContent = gains[key].toFixed(2);
                if (runMeta) {
                    if (simulation.steps===0) {runMeta.speed=gains.speed;runMeta.gains={...gains};}
                    else if (key==='speed') runMeta.speedChanged ||= gains.speed!==runMeta.speed;
                    else runMeta.tuned=true;
                    updateComparison();
                }
            });
        }
        document.getElementById('drive-defaults').addEventListener('click', () => {
            for (const key of Object.keys(gains)) {
                const input = document.getElementById('drive-'+key);
                input.value = DRIVE_DEFAULTS[key];
                input.dispatchEvent(new Event('input'));
            }
            resetRoute();
        });
        document.getElementById('drive-nudge').addEventListener('click', () => {
            simulation.heading += Math.PI/12;
            runMeta.nudges.push(simulation.steps);
            updateVehicle(); sampleSimulation(); render();
            setStatus('Heading nudged +15°. Play to see the recovery.');
        });
        document.getElementById('drive-save-run').addEventListener('click', () => {
            if (!state.playing && canSaveDriveRun(simulation,runMeta)) {
                savedRun=saveDriveRun(simulation,runMeta);updateComparison();
            }
        });
        document.getElementById('drive-clear-run').addEventListener('click', () => {
            savedRun=null;updateComparison();
        });
        document.addEventListener('portfolio:lab-change', event => {
            if (event.detail !== 'drive') {
                state.playing = false; stopLoop(); updateReadout();
                root.dataset.nearViewport = 'false';
                document.dispatchEvent(new Event('portfolio:lab-visibility'));
            }
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { state.playing = false; stopLoop(); updateReadout(); }
        });
        scenarioButtons.forEach((button) => {
            button.addEventListener('click', () => setScenario(button.dataset.pathScenario));
        });
        playToggle?.addEventListener('click', togglePlayback);
        document.getElementById('path-reset')?.addEventListener('click', resetRoute);
        document.getElementById('path-camera-reset')?.addEventListener('click', resetCamera);

        canvas?.addEventListener('keydown', handleCanvasKeydown);
        canvas?.addEventListener('pointerdown', beginDrag);
        canvas?.addEventListener('pointermove', moveDrag);
        canvas?.addEventListener('pointerup', endDrag);
        canvas?.addEventListener('pointercancel', endDrag);
        canvas?.addEventListener('wheel', handleWheel, { passive: false });
    }

    function initVisibility() {
        if (typeof IntersectionObserver !== 'function') {
            initScene();
            return;
        }

        intersectionObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (!entry) {
                return;
            }
            root.dataset.nearViewport = String(entry.isIntersecting && !root.hidden);
            document.dispatchEvent(new Event('portfolio:lab-visibility'));
            if (entry.isIntersecting) {
                initScene();
            } else if (state.playing) {
                state.playing = false;
                stopLoop();
                setStatus(`${currentScenario().label} paused offscreen. Press play to resume.`);
                updateReadout();
            }
        }, { rootMargin: '240px 0px' });
        intersectionObserver.observe(stage);
    }

    function init() {
        updateScenarioButtons();
        initInteractions();
        initVisibility();

        if (typeof ResizeObserver === 'function') {
            resizeObserver = new ResizeObserver(resizeRenderer);
            resizeObserver.observe(stage);
        }
        window.addEventListener('resize', resizeRenderer, { passive: true });
    }

    init();
})();
