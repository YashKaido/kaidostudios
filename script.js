// Supabase client
const supabaseUrl = 'https://ivbgifctlqxiukwoulte.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2YmdpZmN0bHF4aXVrd291bHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzUxOTYsImV4cCI6MjA4NTgxMTE5Nn0.AAAsdamFj4LMrNpKkyFlgXex0NX-smx2p6I5sswyqPs';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Initialize Lenis smooth scroll for agentic feel
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Simple bounce effect on hover
document.addEventListener('DOMContentLoaded', function() {
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach(function(shape) {
        shape.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.15) translateY(-5px)';
            this.style.filter = 'brightness(0.8)';
            this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Bounce easing
        });
        
        shape.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.filter = '';
            this.style.transition = 'all 0.3s ease';
        });
    });
});

// Smooth scroll animation observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.client-card'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Check if it's the contact link
        if (href === '#contact') {
            e.preventDefault();
            openContactModal();
            return;
        }
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Success/Error message functions
function showFormSuccess() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <button class="modal-close" aria-label="Close" onclick="closeContactModal()">✕</button>
        <div class="success-message">
            <div class="success-icon">✓</div>
            <h2>Message sent!</h2>
            <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
        </div>
    `;
}

function showFormMessage(message, isError) {
    const existingMsg = document.querySelector('.form-message');
    if (existingMsg) existingMsg.remove();

    const form = document.getElementById('contactForm');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'form-message' + (isError ? ' error' : '');
    msgDiv.textContent = message;
    form.insertBefore(msgDiv, form.firstChild);
}

// Contact Modal Functions
function openContactModal() {
    const modal = document.getElementById('contactModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Setup modal close handlers
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('contactModal');
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    const form = document.getElementById('contactForm');
    
    // Close button
    closeBtn.addEventListener('click', closeContactModal);
    
    // Click outside to close
    overlay.addEventListener('click', closeContactModal);
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeContactModal();
        }
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Send to Supabase
        const { error } = await supabaseClient
            .from('contacts')
            .insert([{
                name: data.name,
                email: data.email,
                company: data.company || null,
                message: data.message
            }]);

        if (error) {
            console.error('Error:', error);
            showFormMessage('Something went wrong. Please try again.', true);
        } else {
            showFormSuccess();
            form.reset();
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
});
