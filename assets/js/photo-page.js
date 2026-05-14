(function () {
    'use strict';

    const PHOTO_SOURCES = [
        'assets/images/optimized/DSC02477.jpg',
        'assets/images/optimized/DSC03288.jpg',
        'assets/images/optimized/DSC03631-HDR-2.jpg',
        'assets/images/optimized/DSC03675.jpg',
        'assets/images/optimized/DSC05064-Edit.jpg',
        'assets/images/optimized/DSC05396.jpg',
        'assets/images/optimized/DSC06545.jpg',
        'assets/images/optimized/DSC07124.jpg',
        'assets/images/optimized/DSC0676.jpg',
        'assets/images/optimized/DSC0865.jpg'
    ];

    const EXIF_DATA = [
        { camera: 'Sony a7 II', model: '16mm F1.4 DC DN | Contemporary 017', focal: '16mm', aperture: 'f/1.4', shutter: '1/160s', iso: 'ISO 3200' },
        { camera: 'Sony a7 II', model: 'FE 28-70mm F3.5-5.6 OSS', focal: '55mm', aperture: 'f/5.0', shutter: '1/125s', iso: 'ISO 1600' },
        { camera: 'Sony a7 II', model: 'E 28-75mm F2.8-2.8', focal: '28mm', aperture: 'f/2.8', shutter: '1/1250s', iso: 'ISO 1600' },
        { camera: 'Sony a7 II', model: 'E 28-75mm F2.8-2.8', focal: '75mm', aperture: 'f/2.8', shutter: '1/800s', iso: 'ISO 1600' },
        { camera: 'Sony a7 II', model: 'E 28-75mm F2.8-2.8', focal: '28mm', aperture: 'f/6.3', shutter: '1/400s', iso: 'ISO 400' },
        { camera: 'Sony a7 II', model: 'E 28-75mm F2.8-2.8', focal: '28mm', aperture: 'f/2.8', shutter: '1/800s', iso: 'ISO 500' },
        { camera: 'Sony a7 II', model: 'E 28-75mm F2.8-2.8', focal: '75mm', aperture: 'f/2.8', shutter: '1/4000s', iso: 'ISO 200' },
        { camera: 'Sony a7 II', model: 'E 28-75mm F2.8-2.8', focal: '75mm', aperture: 'f/2.8', shutter: '1/250s', iso: 'ISO 400' },
        { camera: 'Sony a7 II', model: 'E 28-75mm F2.8-2.8', focal: '75mm', aperture: 'f/2.8', shutter: '1/1250s', iso: 'ISO 250' },
        { camera: 'Sony a7 II', model: 'E 28-75mm F2.8-2.8', focal: '28mm', aperture: 'f/2.8', shutter: '1/160s', iso: 'ISO 1250' }
    ];
    let activePhotoIndex = 0;

    function initAos() {
        if (window.AOS && typeof window.AOS.init === 'function') {
            window.AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                mirror: false
            });
        }
    }

    function clampIndex(index) {
        return Math.max(0, Math.min(index, PHOTO_SOURCES.length - 1));
    }

    function ensureDynamicBackground() {
        let background = document.getElementById('dynamic-bg');
        if (background) {
            return background;
        }

        background = document.createElement('div');
        background.id = 'dynamic-bg';
        background.className = 'dynamic-bg';
        document.body.insertBefore(background, document.body.firstChild);
        return background;
    }

    function updateExifData(index) {
        const exifContainer = document.getElementById('exif-data');
        const data = EXIF_DATA[clampIndex(index)];
        if (!exifContainer || !data) {
            return;
        }

        exifContainer.innerHTML = `
            <div class="space-y-2">
                <div class="exif-item">
                    <span class="exif-label"><span aria-hidden="true" class="mr-2">📷</span>Camera</span>
                    <span class="exif-value">${data.camera}</span>
                </div>
                <div class="exif-item">
                    <span class="exif-label"><span aria-hidden="true" class="mr-2">◉</span>Lens</span>
                    <span class="exif-value">${data.model}</span>
                </div>
                <div class="exif-item">
                    <span class="exif-label"><span aria-hidden="true" class="mr-2">⌕</span>Focal Length</span>
                    <span class="exif-value">${data.focal}</span>
                </div>
            </div>
            <div class="space-y-2">
                <div class="exif-item">
                    <span class="exif-label"><span aria-hidden="true" class="mr-2">◐</span>Aperture</span>
                    <span class="exif-value">${data.aperture}</span>
                </div>
                <div class="exif-item">
                    <span class="exif-label"><span aria-hidden="true" class="mr-2">⏱</span>Shutter Speed</span>
                    <span class="exif-value">${data.shutter}</span>
                </div>
                <div class="exif-item">
                    <span class="exif-label"><span aria-hidden="true" class="mr-2">☀</span>ISO</span>
                    <span class="exif-value">${data.iso}</span>
                </div>
            </div>
        `;
    }

    function setActiveSlide(index) {
        const safeIndex = clampIndex(index);
        document.querySelectorAll('.swiper-slide').forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === safeIndex);
        });
    }

    function setBackground(index) {
        const safeIndex = clampIndex(index);
        const background = ensureDynamicBackground();
        activePhotoIndex = safeIndex;
        background.style.backgroundImage = `url('${PHOTO_SOURCES[safeIndex]}')`;
        background.classList.add('active');
        updateExifData(safeIndex);
    }

    function getSwiperIndex(swiper) {
        if (!swiper || typeof swiper.realIndex !== 'number') {
            return 0;
        }

        return clampIndex(swiper.realIndex);
    }

    function initSwiper() {
        if (!window.Swiper) {
            setActiveSlide(0);
            document.querySelector('.swiper-button-next')?.addEventListener('click', () => goToSlide(activePhotoIndex + 1));
            document.querySelector('.swiper-button-prev')?.addEventListener('click', () => goToSlide(activePhotoIndex - 1));
            console.info('Using local photo gallery controls.');
            return;
        }

        const swiper = new window.Swiper('.swiper', {
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            keyboard: { enabled: true },
            spaceBetween: 30,
            effect: 'slide',
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            },
            on: {
                init() {
                    setBackground(getSwiperIndex(this));
                },
                slideChange() {
                    setBackground(getSwiperIndex(this));
                }
            }
        });

        window.swiperInstance = swiper;
    }

    function goToSlide(index) {
        const safeIndex = clampIndex(index);
        const gallery = document.getElementById('main-gallery');

        if (gallery) {
            gallery.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }

        if (!window.swiperInstance) {
            setActiveSlide(safeIndex);
            setBackground(safeIndex);
            return;
        }

        window.setTimeout(() => {
            window.swiperInstance.slideToLoop(safeIndex, 500);
            window.setTimeout(() => {
                setBackground(safeIndex);
            }, 100);
        }, gallery ? 250 : 0);
    }

    function initThumbnailButtons() {
        document.querySelectorAll('[data-slide-index]').forEach((button) => {
            button.addEventListener('click', () => {
                const index = Number.parseInt(button.dataset.slideIndex, 10);
                if (Number.isNaN(index)) {
                    return;
                }

                goToSlide(index);
            });
        });
    }

    function initPage() {
        initAos();
        ensureDynamicBackground();
        setBackground(0);
        initSwiper();
        initThumbnailButtons();
    }

    window.goToSlide = goToSlide;

    document.addEventListener('DOMContentLoaded', initPage);
})();
