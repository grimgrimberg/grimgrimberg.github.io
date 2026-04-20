document.addEventListener('DOMContentLoaded', function () {
  const LEGACY_GLOBAL_TIMEOUT_MS = 3000;
  const LEGACY_GLOBAL_INTERVAL_MS = 100;

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((anchor) => {
      if (anchor.dataset.anchorReady === 'true') {
        return;
      }

      anchor.addEventListener('click', function (event) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      anchor.dataset.anchorReady = 'true';
    });
  }

  function initBackToTopButton() {
    if (window.backToTopButton) {
      return;
    }

    const backToTopButton = document.createElement('button');
    backToTopButton.type = 'button';
    backToTopButton.textContent = '\u2191';
    backToTopButton.className = 'fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full hidden';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopButton);

    function syncVisibility() {
      if (window.scrollY > 300) {
        backToTopButton.classList.remove('hidden');
      } else {
        backToTopButton.classList.add('hidden');
      }
    }

    window.addEventListener('scroll', syncVisibility, { passive: true });
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    syncVisibility();
    window.backToTopButton = backToTopButton;
  }

  function waitForGlobal(name, onReady) {
    const deadline = Date.now() + LEGACY_GLOBAL_TIMEOUT_MS;

    function check() {
      if (window[name]) {
        onReady(window[name]);
        return;
      }

      if (Date.now() >= deadline) {
        console.info(`Legacy helper timed out waiting for ${name}.`);
        return;
      }

      window.setTimeout(check, LEGACY_GLOBAL_INTERVAL_MS);
    }

    check();
  }

  initSmoothAnchors();
  initBackToTopButton();

  if (document.querySelector('[data-legacy-clippy-shortcut]')) {
    waitForGlobal('clippy', function (clippy) {
      clippy.load('Clippy', function (agent) {
        agent.hide();

        document.addEventListener('keydown', function (event) {
          if (event.altKey && event.shiftKey && event.code === 'KeyC') {
            agent.show();
            agent.moveTo(100, 100);
            agent.speak('Legacy helper ready.');
          }
        });
      });
    });
  }
});
