// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.backgroundColor = 'white';
        header.style.backdropFilter = 'none';
    }
});

// Contact Form Handling
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('formMessage');
    
    // Show loading state
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Wird gesendet...';
    submitButton.disabled = true;
    
    // Hide previous messages
    messageDiv.style.display = 'none';
    messageDiv.className = 'form-message';
    
    try {
        const response = await fetch('contact.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Success
            messageDiv.className = 'form-message success';
            messageDiv.innerHTML = `
                <i class="fas fa-check-circle"></i>
                ${result.message}
            `;
            messageDiv.style.display = 'block';
            
            // Reset form
            form.reset();
            
            // Scroll to message
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
        } else {
            // Error
            messageDiv.className = 'form-message error';
            messageDiv.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                ${result.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'}
            `;
            messageDiv.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        messageDiv.className = 'form-message error';
        messageDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            Entschuldigung, beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. 
            Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt.
        `;
        messageDiv.style.display = 'block';
    } finally {
        // Reset button
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
});

// Form validation
document.querySelectorAll('#contactForm input, #contactForm textarea').forEach(field => {
    field.addEventListener('blur', function() {
        validateField(this);
    });
    
    field.addEventListener('input', function() {
        if (this.classList.contains('error')) {
            validateField(this);
        }
    });
});

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    
    // Remove previous error styling
    field.classList.remove('error');
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
        }
    }
    
    // Message length validation
    if (field.name === 'message' && value && (value.length < 10 || value.length > 5000)) {
        isValid = false;
    }
    
    if (!isValid) {
        field.classList.add('error');
        field.style.borderColor = '#ef4444';
    } else {
        field.style.borderColor = '#4b5563';
    }
    
    return isValid;
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.service-card, .package-card, .testimonial-card, .stat');
    animateElements.forEach(el => observer.observe(el));
});

// Package selection highlighting
document.querySelectorAll('.package-card .btn').forEach(button => {
    button.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#contact') {
            e.preventDefault();
            
            // Get package name
            const packageCard = this.closest('.package-card');
            const packageName = packageCard.querySelector('h3').textContent;
            
            // Pre-fill contact form
            const messageField = document.getElementById('message');
            if (messageField) {
                messageField.value = `Ich interessiere mich für das ${packageName} Paket. Bitte kontaktieren Sie mich für weitere Informationen.`;
            }
            
            // Scroll to contact form
            document.getElementById('contact').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Service card hover effects
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Testimonial rotation (optional)
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-card');

function rotateTestimonials() {
    if (testimonials.length > 3) {
        testimonials.forEach((testimonial, index) => {
            testimonial.style.display = 'none';
        });
        
        for (let i = 0; i < 3; i++) {
            const index = (currentTestimonial + i) % testimonials.length;
            testimonials[index].style.display = 'block';
        }
        
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    }
}

// Auto-rotate testimonials every 5 seconds (if more than 3)
if (testimonials.length > 3) {
    setInterval(rotateTestimonials, 5000);
}

// Performance optimization: Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Scroll to top functionality
function createScrollToTopButton() {
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollButton.className = 'scroll-to-top';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        display: none;
        z-index: 1000;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    scrollButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollButton.style.display = 'block';
        } else {
            scrollButton.style.display = 'none';
        }
    });
    
    document.body.appendChild(scrollButton);
}

// Initialize scroll to top button
createScrollToTopButton();

// Analytics and tracking (placeholder)
function trackEvent(eventName, eventData = {}) {
    // Placeholder for analytics tracking
    console.log('Event tracked:', eventName, eventData);
    
    // Example: Google Analytics 4
    // gtag('event', eventName, eventData);
    
    // Example: Facebook Pixel
    // fbq('track', eventName, eventData);
}

// Track form submissions
document.getElementById('contactForm').addEventListener('submit', function() {
    trackEvent('form_submit', {
        form_name: 'contact_form',
        page_location: window.location.href
    });
});

// Track package selections
document.querySelectorAll('.package-card .btn').forEach(button => {
    button.addEventListener('click', function() {
        const packageName = this.closest('.package-card').querySelector('h3').textContent;
        trackEvent('package_interest', {
            package_name: packageName,
            page_location: window.location.href
        });
    });
});

// Track phone number clicks
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function() {
        trackEvent('phone_click', {
            phone_number: this.getAttribute('href'),
            page_location: window.location.href
        });
    });
});

// Error handling for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.style.display = 'none';
        console.warn('Image failed to load:', this.src);
    });
});

// Console welcome message
console.log('%c🚀 Creative Web Studio GmbH', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
console.log('%cWebsite developed with modern web technologies', 'color: #6b7280; font-size: 14px;');
console.log('%cFor technical support: info@informatik-luzern.ch', 'color: #6b7280; font-size: 12px;');

