// Navigation and visibility only; each demo owns its model and renderer.
const driving = document.getElementById('path-playground');
const experiments = document.getElementById('experiment-playground');
const reconstruction = document.getElementById('reconstruction-lab');
const frameSlot = document.getElementById('reconstruction-frame-slot');
const loadViewer = document.getElementById('reconstruction-load');
const closeViewer = document.getElementById('reconstruction-close');
const viewerStatus = document.getElementById('reconstruction-status');
const labReading = new Set();

function unloadReconstruction(message = 'Viewer closed. Load it again whenever you like.') {
    if (!frameSlot?.firstChild) return;
    frameSlot.replaceChildren(); // Removing the browsing context stops its WebGL, media and requests.
    frameSlot.hidden = true;
    loadViewer.hidden = false;
    closeViewer.hidden = true;
    viewerStatus.textContent = message;
}
loadViewer?.addEventListener('click', () => {
    if (frameSlot.firstChild) return;
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
    // A cross-origin iframe load event cannot prove that its scene rendered.
    viewerStatus.textContent = 'Viewer requested below. If it stays blank or reports an error, open the full viewer. Close releases the scene.';
});
closeViewer?.addEventListener('click', () => {
    unloadReconstruction();
    loadViewer.focus({preventScroll:true});
});
document.addEventListener('portfolio:lab-visibility', () => {
    document.body.classList.toggle('path-scene-near', labReading.size > 0 || [driving, experiments].some(panel => panel && !panel.hidden && panel.dataset.nearViewport === 'true'));
});
function selectLab(mode, updateHash = false) {
    if (!['drive','space','perception','reconstruction'].includes(mode)) return;
    if (mode !== 'reconstruction') unloadReconstruction();
    if (driving) driving.hidden = mode !== 'drive';
    if (experiments) experiments.hidden = !['space','perception'].includes(mode);
    if (reconstruction) reconstruction.hidden = mode !== 'reconstruction';
    document.querySelectorAll('[data-lab-mode]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.labMode === mode));
    });
    document.querySelectorAll('[data-experiment-copy]').forEach(el => el.hidden = el.dataset.experimentCopy !== mode);
    document.body.dataset.activeLab = mode;
    document.dispatchEvent(new CustomEvent('portfolio:lab-change', { detail: mode }));
    if (updateHash) history.replaceState(null, '', '#' + ({drive:'path-playground',space:'space-lab',perception:'perception-lab',reconstruction:'reconstruction-lab'}[mode]));
}
document.querySelectorAll('[data-lab-mode]').forEach(button => button.addEventListener('click', () => selectLab(button.dataset.labMode, true)));
document.querySelectorAll('[data-lab-target]').forEach(link => link.addEventListener('click', () => selectLab(link.dataset.labTarget, true), {capture:true}));
function readHash() {
    const mode = {'#path-playground':'drive','#space-lab':'space','#perception-lab':'perception','#reconstruction-lab':'reconstruction'}[location.hash];
    if (mode) { selectLab(mode); requestAnimationFrame(() => document.getElementById('lab-picker')?.scrollIntoView({block:'start',behavior:'instant'})); }
}
window.addEventListener('hashchange', readHash);
window.addEventListener('load', readHash);
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
            if (entry.target === reconstruction && !entry.isIntersecting) {
                const bounds = reconstruction.getBoundingClientRect();
                if (bounds.bottom <= 0 || bounds.top >= innerHeight) unloadReconstruction('Viewer closed offscreen. Load it again to continue.');
            }
        }
        else if (entry.isIntersecting) quietSections.add(entry.target);
        else quietSections.delete(entry.target);
    });
    document.body.classList.toggle('quiet-reading', quietSections.size > 0);
    document.dispatchEvent(new Event('portfolio:lab-visibility'));
}, {rootMargin:'-80px 0px -35% 0px'});
document.querySelectorAll('#hero, #about, #contact, #lab-picker, .path-playground').forEach(el => readingObserver.observe(el));
document.addEventListener('visibilitychange', () => {
    if (document.hidden) unloadReconstruction('Viewer closed while this tab was hidden. Load it again to continue.');
});
