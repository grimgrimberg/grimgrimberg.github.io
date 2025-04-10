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

// Modal functionality
const modal = document.createElement('div');
modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden';
modal.innerHTML = `
  <div class="bg-white p-6 rounded-lg">
    <h2 class="text-2xl font-bold mb-4">Welcome!</h2>
    <p class="mb-4">This is a modal window. You can add more content here.</p>
    <button id="closeModal" class="btn">Close</button>
  </div>
`;
document.body.appendChild(modal);

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
    const clickSound = new Audio('/assets/sounds/click.mp3');
    clickSound.play();

    if (clickCount === 69) {
        const specialSound = new Audio('/assets/sounds/god-dam.mp3');
        specialSound.play();
    }

    // Show modal
    modal.classList.remove('hidden');
});

document.getElementById('closeModal').addEventListener('click', () => {
  modal.classList.add('hidden');
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

// Include Lottie Web Player for the goose animation
const lottieScript = document.createElement('script');
lottieScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.9.6/lottie.min.js';
document.head.appendChild(lottieScript);

lottieScript.onload = () => {
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

    const animation = lottie.loadAnimation({
        container: gooseContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/images/jumpy-goose.json' // Add the downloaded JSON file to assets/images
    });

    function moveGooseTo(x, y) {
        gooseContainer.style.transition = 'all 1s ease';
        gooseContainer.style.left = `${x}px`;
        gooseContainer.style.top = `${y}px`;
    }

        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        moveGooseTo(x, y);

    //     setTimeout(() => {
    //         element.click();
    //     }, 1000); // Simulate click after goose reaches the element
    // }

    // if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
    //     setTimeout(() => {
    //         const aboutLink = document.querySelector('a[href="about.html"]');
    //         if (aboutLink) simulateClick(aboutLink);
    //     }, 5000);
    // }

    // if (window.location.pathname === '/about.html') {
    //     setTimeout(() => {
    //         const projectsLink = document.querySelector('a[href="projects.html"]');
    //         if (projectsLink) simulateClick(projectsLink);
    //     }, 5000);
    // }
};

clippyScript.onload = () => {
    clippy.load('Clippy', agent => {
        agent.show();
        agent.speak("Hi there! I'm Clippy, your assistant!");

        // Add some fun interactions
        openModalButton.addEventListener('click', () => {
            agent.animate();
            agent.speak(`You clicked the button ${clickCount} times!`);
        });

        // Move to a random position on the screen
        const randomX = Math.random() * (window.innerWidth - 100);
        const randomY = Math.random() * (window.innerHeight - 100);
        agent.moveTo(randomX, randomY);
        
        // Show initial greeting
        agent.speak('Hi! I\'m Clippy! Need help navigating the website?');
        agent.animate();

        // Add click interaction
        document.addEventListener('click', (e) => {
            const randomPhrases = [
                'Looks like you\'re browsing the website! Need assistance?',
                'I see you\'re clicking around! Can I help you find something?',
                'Hey there! Want to know more about this section?',
                'Need help? Just ask!'
            ];
            const randomPhrase = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
            agent.speak(randomPhrase);
            agent.animate();
        });

        // React to scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                agent.speak('Scrolling through? Let me know if you need directions!');
                agent.animate();
            }, 1000);
        });
    });

    // Initialize Clippy.js
    clippy.load('Clippy', function(agent) {
        agent.show();
        agent.speak("Hello! I'm Clippy, your assistant!");
    });
};

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