// Navigation and visibility only; each demo owns its model and renderer.
const driving = document.getElementById('path-playground');
const experiments = document.getElementById('experiment-playground');
const labReading = new Set();
document.addEventListener('portfolio:lab-visibility', () => {
    document.body.classList.toggle('path-scene-near', labReading.size > 0 || [driving, experiments].some(panel => panel && !panel.hidden && panel.dataset.nearViewport === 'true'));
});
function selectLab(mode, updateHash = false) {
    if (!['drive','space','perception'].includes(mode)) return;
    if (driving) driving.hidden = mode !== 'drive';
    if (experiments) experiments.hidden = mode === 'drive';
    document.querySelectorAll('[data-lab-mode]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.labMode === mode));
    });
    document.querySelectorAll('[data-experiment-copy]').forEach(el => el.hidden = el.dataset.experimentCopy !== mode);
    document.body.dataset.activeLab = mode;
    document.dispatchEvent(new CustomEvent('portfolio:lab-change', { detail: mode }));
    if (updateHash) history.replaceState(null, '', '#' + ({drive:'path-playground',space:'space-lab',perception:'perception-lab'}[mode]));
}
document.querySelectorAll('[data-lab-mode]').forEach(button => button.addEventListener('click', () => selectLab(button.dataset.labMode, true)));
document.querySelectorAll('[data-lab-target]').forEach(link => link.addEventListener('click', () => selectLab(link.dataset.labTarget, true), {capture:true}));
function readHash() {
    const mode = {'#path-playground':'drive','#space-lab':'space','#perception-lab':'perception'}[location.hash];
    if (mode) { selectLab(mode); requestAnimationFrame(() => document.getElementById('lab-picker')?.scrollIntoView({block:'start'})); }
}
window.addEventListener('hashchange', readHash);
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
