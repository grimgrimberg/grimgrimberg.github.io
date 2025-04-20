document.addEventListener('DOMContentLoaded', function() {
  // Basic script - you can add more interactivity here later
  console.log("Page loaded!");

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Ensure back-to-top button visibility
  if (!window.backToTopButton) {
    const backToTopButton = document.createElement('button');
    backToTopButton.textContent = '\u2191';
    backToTopButton.className = 'fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full hidden';
    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.remove('hidden');
      } else {
        backToTopButton.classList.add('hidden');
      }
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.backToTopButton = backToTopButton;
  }

  // Modal functionality
  if (!window.modal) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden';
    modal.innerHTML = `
      <div class="bg-white p-6 rounded-lg">
        <h2 class="text-2xl font-bold mb-4">Welcome!</h2>
        <p class="mb-4">Click me Till youll find your true self.</p>
        <button id="closeModal" class="btn">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
    window.modal = modal;
  }
  const modal = window.modal;

  const openModalButton = document.createElement('button');
  openModalButton.textContent = 'Click Here';
  openModalButton.className = 'btn fixed bottom-16 right-4';
  document.body.appendChild(openModalButton);

  // Consolidate all click event listeners for openModalButton
  let clickCount = 0;
  openModalButton.addEventListener('click', () => {
      clickCount++;

      // Update banner effect
      const banner = document.createElement('div');
      banner.textContent = `You clicked ${clickCount} times!`;
      banner.style.position = 'fixed';
      banner.style.top = `${Math.random() * 80 + 10}%`;
      banner.style.left = `${Math.random() * 80 + 10}%`;
      banner.style.backgroundColor = 'yellow';
      banner.style.color = 'black';
      banner.style.padding = '10px';
      banner.style.border = '2px solid black';
      banner.style.zIndex = '2000';
      banner.style.fontFamily = 'Comic Sans MS, sans-serif';
      banner.style.boxShadow = '5px 5px 10px rgba(0, 0, 0, 0.5)';
      document.body.appendChild(banner);

      setTimeout(() => {
          banner.remove();
      }, 3000);

      // Play sound effects
      const clickSound = new Audio('/assets/sounds/honk-sound.mp3');
      clickSound.play();

      if (clickCount === 69) {
          const specialSound = new Audio('/assets/sounds/god-dam.mp3');
          specialSound.play();
      }

      // Show modal
      modal.classList.remove('hidden');
  });
  // Use event delegation for closeModal button
  document.body.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'closeModal') {
      modal.classList.add('hidden');
    }
  });

  // Removed automatic navigation logic
  // if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
  //     setTimeout(() => {
  //         window.location.href = 'about.html';
  //     }, 5000); // Navigate to About Me after 5 seconds
  // }

  // if (window.location.pathname === '/about.html') {
  //     setTimeout(() => {
  //         window.location.href = 'projects.html';
  //     }, 5000); // Navigate to Projects after 5 seconds
  // }

  // Ensure Lottie.js is loaded for the goose animation
  const lottieScript = document.createElement('script');
  lottieScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.9.6/lottie.min.js';
  document.head.appendChild(lottieScript);

  // Wait for Lottie.js to be available before using it
  function waitForGlobal(name, cb) {
    if (window[name]) {
      cb(window[name]);
    } else {
      setTimeout(() => waitForGlobal(name, cb), 50);
    }
  }

  // Goose animation logic
  waitForGlobal('lottie', function(lottie) {
    const gooseContainer = document.createElement('div');
    gooseContainer.id = 'goose-animation';
    gooseContainer.style.position = 'fixed';
    gooseContainer.style.width = '150px';
    gooseContainer.style.height = '150px';
    gooseContainer.style.zIndex = '1000';
    gooseContainer.style.left = '50%';
    gooseContainer.style.top = 'auto';
    gooseContainer.style.bottom = '15%';
    gooseContainer.style.transform = 'translateX(-50%)';
    document.body.appendChild(gooseContainer);

    lottie.loadAnimation({
      container: gooseContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/images/jumpy-goose.json'
    });
  });

  // Add scroll animation logic
  const scrollElements = document.querySelectorAll('.scroll-animation');

  const elementInView = (el, offset = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <= 
      (window.innerHeight || document.documentElement.clientHeight) / offset
    );
  };

  const displayScrollElement = (element) => {
    element.classList.add('visible');
  };

  const hideScrollElement = (element) => {
    element.classList.remove('visible');
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 1.25)) {
        displayScrollElement(el);
      } else {
        hideScrollElement(el);
      }
    });
  };

  window.addEventListener('scroll', () => {
    handleScrollAnimation();
  });

  // Trigger animation on page load
  handleScrollAnimation();

  // Apply scroll-animation class to all paragraphs
  const paragraphs = document.querySelectorAll('p');
  paragraphs.forEach((p) => {
    p.classList.add('scroll-animation');
  });

  // Clippy logic
  let clippyAgent;
  waitForGlobal('clippy', function(clippy) {
    clippy.load('Clippy', function(agent){
      clippyAgent = agent;
      clippyAgent.hide();
    });
  });

  // Change shortcut to Alt+Shift+C for Clippy
  document.addEventListener('keydown', function(e) {
    if (e.altKey && e.shiftKey && e.code === 'KeyC') {
      if (clippyAgent) {
        clippyAgent.show();
        clippyAgent.moveTo(100, 100);
        const phrases = [
          "Need help stalking my LinkedIn?",
          "Looking for some cool autonomous car projects?",
          "Want to see my photography?",
          "Clippy is here to help!"
        ];
        clippyAgent.speak(phrases[Math.floor(Math.random() * phrases.length)]);
      }
    }
  });
});