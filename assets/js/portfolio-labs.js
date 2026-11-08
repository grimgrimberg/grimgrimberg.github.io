// Navigation and visibility only; each demo owns its model and renderer.
// Machines (see docs/site/STATE.md): lab, reconstruction, lab-drive, lab-experiments, brain-lab.
const { defineChoice, define, defineLoader } = window.PortfolioState;
const LAB_MODES = ['drive', 'space', 'perception', 'reconstruction', 'brain'];
const LAB_HASHES = { drive: 'path-playground', space: 'space-lab', perception: 'perception-lab', reconstruction: 'reconstruction-lab', brain: 'brain-lab' };

const driving = document.getElementById('path-playground');
const experiments = document.getElementById('experiment-playground');
const reconstruction = document.getElementById('reconstruction-lab');
const brainLab = document.getElementById('brain-lab');
const frameSlot = document.getElementById('reconstruction-frame-slot');
const loadViewer = document.getElementById('reconstruction-load');
const closeViewer = document.getElementById('reconstruction-close');
const viewerStatus = document.getElementById('reconstruction-status');
const labReading = new Set();

const lab = defineChoice('lab', LAB_MODES);
// A cross-origin iframe cannot report that its scene rendered, so "open" means requested and holding WebGL.
const viewer = define('reconstruction', {
    initial: 'closed',
    states: { closed: { open: 'open' }, open: { close: 'closed' } }
});
const driveScene = defineLoader('lab-drive');
const experimentScene = defineLoader('lab-experiments');
const brainScene = defineLoader('brain-lab');
// Once a visitor picks a lab, the page's late load event must not snap them back to the URL's lab.
let labChosenByVisitor = false;

function unloadReconstruction(message = 'Viewer closed. Load it again whenever you like.') {
    if (!viewer.send('close')) return;
    const focusWasOnClose = closeViewer.contains(document.activeElement);
    frameSlot.replaceChildren(); // Removing the browsing context stops its WebGL, media and requests.
    frameSlot.hidden = true;
    loadViewer.hidden = false;
    closeViewer.hidden = true;
    viewerStatus.textContent = message;
    if (focusWasOnClose && !reconstruction.hidden) loadViewer.focus({preventScroll:true});
}
loadViewer?.addEventListener('click', () => {
    if (!viewer.send('open')) return;
    const frame = document.createElement('iframe');
    frame.title = 'FPV reconstruction: point cloud, camera path and method comparison';
    frame.referrerPolicy = 'no-referrer';
    frame.allow = "autoplay 'none'";
    frame.src = 'https://grimgrimberg.github.io/fpv-vggt-visual-geometry-lab/scenes/2026-04-24_d9_engineering_vehicle_between_taybeh_and_deir_siryan/seg01/index.html?embed=1';
    frameSlot.hidden = false;
    frameSlot.append(frame);
    loadViewer.hidden = true;
    closeViewer.hidden = false;
    closeViewer.focus({preventScroll:true});
    viewerStatus.textContent = 'Viewer requested below. If it stays blank or reports an error, open the full viewer. Close releases the scene.';
});
closeViewer?.addEventListener('click', () => {
    unloadReconstruction();
    loadViewer.focus({preventScroll:true});
});
// Release the scene's WebGL once the panel is fully off screen. The reading observer below uses a shrunken
// root, so it fires while the panel is still partly visible and cannot make this call.
if (reconstruction) {
    new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) unloadReconstruction('Viewer closed offscreen. Load it again to continue.');
    }).observe(reconstruction);
}
document.addEventListener('portfolio:lab-visibility', () => {
    document.body.classList.toggle('path-scene-near', labReading.size > 0 || [driving, experiments].some(panel => panel && !panel.hidden && panel.dataset.nearViewport === 'true'));
});

// The connectome data and three.js load only when someone opens this lab.
function openBrainLab() {
    if (!brainScene.send('load')) return;
    const status = document.getElementById('brain-lab-status');
    if (!('WebGL2RenderingContext' in window)) {
        brainScene.send('reject');
        status.textContent = 'This view needs WebGL. The picture shows the same neurons.';
        return;
    }
    status.textContent = 'Loading neuron positions…';
    import('./fly-brain.js?v=20261108')
        .then(({ mountBrain }) => mountBrain({
            stage: document.getElementById('brain-lab-stage'),
            canvas: document.getElementById('brain-lab-canvas'),
            framing: 'panel'
        }))
        .then((brain) => {
            brainScene.send('resolve');
            status.textContent = 'Drag to rotate. Switch a region off to look inside.';
            document.querySelectorAll('[data-brain-region]').forEach((button) => {
                button.disabled = false;
                button.addEventListener('click', () => {
                    const visible = button.getAttribute('aria-pressed') !== 'true';
                    button.setAttribute('aria-pressed', String(visible));
                    button.classList.toggle('is-active', visible);
                    brain.setRegion(Number(button.dataset.brainRegion), visible);
                });
            });
        })
        .catch(() => {
            brainScene.send('reject');
            status.textContent = 'The neuron data did not load. Reopen this lab to try again.';
        });
}

function selectLab(mode, updateHash = false) {
    if (!LAB_MODES.includes(mode)) return;
    lab.send(mode);
    if (mode !== 'reconstruction') unloadReconstruction();
    if (driving) driving.hidden = mode !== 'drive';
    if (experiments) experiments.hidden = !['space','perception'].includes(mode);
    if (reconstruction) reconstruction.hidden = mode !== 'reconstruction';
    if (brainLab) brainLab.hidden = mode !== 'brain';
    if (mode === 'brain') openBrainLab();
    document.querySelectorAll('[data-lab-mode]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.labMode === mode));
    });
    document.querySelectorAll('[data-experiment-copy]').forEach(el => el.hidden = el.dataset.experimentCopy !== mode);
    document.body.dataset.activeLab = mode;
    document.dispatchEvent(new CustomEvent('portfolio:lab-change', { detail: mode }));
    if (updateHash) history.replaceState(null, '', '#' + LAB_HASHES[mode]);
}
const chooseLab = (mode) => {
    labChosenByVisitor = true;
    selectLab(mode, true);
};
document.querySelectorAll('[data-lab-mode]').forEach(button => button.addEventListener('click', () => chooseLab(button.dataset.labMode)));
document.querySelectorAll('[data-lab-target]').forEach(link => link.addEventListener('click', () => chooseLab(link.dataset.labTarget), {capture:true}));
function readHash() {
    const mode = Object.keys(LAB_HASHES).find(key => '#' + LAB_HASHES[key] === location.hash);
    if (mode) { selectLab(mode); requestAnimationFrame(() => document.getElementById('lab-picker')?.scrollIntoView({block:'start',behavior:'instant'})); }
}
window.addEventListener('hashchange', readHash);
window.addEventListener('load', () => {
    if (!labChosenByVisitor) readHash();
});
selectLab('drive');
readHash();

// Park the mobile controls by the nav while reading the quieter sections.
const quietSections = new Set();
const readingObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.target.id === 'hero') document.body.classList.toggle('hero-intro-near', entry.isIntersecting);
        else if (entry.target.matches('#lab-picker, .path-playground')) {
            if (entry.isIntersecting) labReading.add(entry.target);
            else labReading.delete(entry.target);
        }
        else if (entry.isIntersecting) quietSections.add(entry.target);
        else quietSections.delete(entry.target);
    });
    document.body.classList.toggle('quiet-reading', quietSections.size > 0);
    document.dispatchEvent(new Event('portfolio:lab-visibility'));
}, {rootMargin:'-80px 0px -35% 0px'});
document.querySelectorAll('#hero, #about, #contact, #lab-picker, .path-playground').forEach(el => readingObserver.observe(el));

// three.js is ~750 KB, so the scenes load when a lab gets close or the page goes idle, never before first paint.
// Each scene has its own loader, so one failure no longer reports the other as broken, and a failed one retries.
function loadScene(loader, path, statusId) {
    if (!loader.send('load')) return;
    import(path)
        .then(() => loader.send('resolve'))
        .catch(() => {
            loader.send('reject');
            const status = document.getElementById(statusId);
            if (status) status.textContent = 'This lab failed to load. Scroll back here or refresh to try again.';
        });
}
function loadLabScenes() {
    loadScene(driveScene, './path-playground.js?v=20261108', 'path-status');
    loadScene(experimentScene, './lab-experiments.js?v=20261108', 'experiment-status');
}
const labLoadObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) loadLabScenes();
}, {rootMargin:'1200px 0px'});
document.querySelectorAll('#lab-picker, .path-playground').forEach(el => labLoadObserver.observe(el));
const scheduleIdleLoad = () => ('requestIdleCallback' in window ? requestIdleCallback(loadLabScenes, {timeout:4000}) : setTimeout(loadLabScenes, 2500));
if (document.readyState === 'complete') scheduleIdleLoad();
else window.addEventListener('load', scheduleIdleLoad, {once:true});
document.addEventListener('visibilitychange', () => {
    if (document.hidden) unloadReconstruction('Viewer closed while this tab was hidden. Load it again to continue.');
});
