/**
 * Contact Form Module
 * Handles contact form submission via mailto
 */

export function initContactForm() {
    const simpleForm = document.getElementById('simple-contact-form');

    if (simpleForm) {
        simpleForm.addEventListener('submit', function (e) {
            e.preventDefault();
            openEmailClient();
        });
    }

    // Expose global function for button onclick
    window.openEmailClient = openEmailClient;
    window.copyEmailContent = copyEmailContent;

    console.log('Contact form module initialized');
}

function openEmailClient() {
    const nameEl = document.getElementById('contact-name');
    const emailEl = document.getElementById('contact-email');
    const subjectEl = document.getElementById('contact-subject');
    const messageEl = document.getElementById('contact-message');
    const statusEl = document.getElementById('contact-status');

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const subject = subjectEl.value.trim();
    const message = messageEl.value.trim();

    // Basic validation
    const invalid = [];
    if (!name) invalid.push(nameEl);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) invalid.push(emailEl);
    if (!message) invalid.push(messageEl);

    if (invalid.length) {
        invalid.forEach(el => {
            el.classList.add('ring-2', 'ring-red-500');
            el.setAttribute('aria-invalid', 'true');
        });
        setTimeout(() => invalid.forEach(el => {
            el.classList.remove('ring-2', 'ring-red-500');
            el.removeAttribute('aria-invalid');
        }), 1500);
        alert('Please provide a valid Name, Email and Message.');
        return;
    }

    const emailSubject = `Portfolio Contact: ${subject || 'General Inquiry'}`;
    const emailBody = `Hi Yuval,%0D%0A%0D%0AName: ${name}%0D%0AEmail: ${email}%0D%0ASubject: ${subject || 'N/A'}%0D%0A%0D%0AMessage:%0D%0A${message}%0D%0A%0D%0A---%0D%0AThis message was sent from your portfolio website.%0D%0A%0D%0ABest regards,%0D%0A${name}`;
    const mailtoLink = `mailto:yuval.grimberg@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${emailBody}`;

    // Render success UI
    const successHtml = `
        <div class="text-center py-8" id="contact-success" data-contact-sent="true">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-tech-green to-tech-cyan rounded-full flex items-center justify-center">
                <i class="fas fa-check text-2xl text-white"></i>
            </div>
            <h4 class="text-2xl font-bold text-tech-cyan mb-3">Email Client Opened (or Ready)!</h4>
            <p class="text-gray-300 mb-4">If your default email client didn't appear, just click the button below or copy the message manually.</p>
            <div class="space-y-4 max-w-xl mx-auto">
                <a id="retry-mailto" href="${mailtoLink}" class="inline-flex items-center space-x-2 bg-gradient-to-r from-tech-purple to-tech-cyan hover:from-tech-cyan hover:to-tech-purple text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                    <i class="fas fa-envelope"></i><span>Try Opening Email Again</span>
                </a>
                <div class="text-left bg-gray-800/60 border border-gray-700 rounded-lg p-4 overflow-y-auto max-h-56 text-sm font-mono" id="email-preview" aria-label="Email preview">Hi Yuval,

Name: ${name}
Email: ${email}
Subject: ${subject || 'N/A'}

Message:
${message}

---
This message was sent from your portfolio website.

Best regards,
${name}</div>
                <button id="copy-email-content" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">Copy Message to Clipboard</button>
                <a href="index.html#contact" class="text-tech-cyan hover:text-tech-purple text-sm inline-block">Send another message</a>
            </div>
        </div>`;

    const formContainer = document.getElementById('simple-contact-form');
    formContainer.innerHTML = successHtml;
    statusEl.textContent = 'Contact form processed – success screen displayed';

    // Copy feature
    const copyBtn = document.getElementById('copy-email-content');
    copyBtn?.addEventListener('click', () => {
        const rawText = document.getElementById('email-preview').textContent;
        navigator.clipboard.writeText(rawText).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy Message to Clipboard', 1500);
        });
    });

    // Attempt mailto after slight delay
    setTimeout(() => {
        try {
            window.location.href = mailtoLink;
        } catch (e) {
            console.log('mailto navigation failed in this environment');
        }
    }, 100);
}

function copyEmailContent() {
    const preview = document.getElementById('email-preview');
    if (preview) {
        navigator.clipboard.writeText(preview.textContent).then(() => {
            alert('Email content copied to clipboard!');
        });
    }
}
