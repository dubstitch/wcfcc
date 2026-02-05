// Page Loading Function
async function loadPage(pageName) {
    const contentArea = document.getElementById('content-area');
    
    try {
        const response = await fetch(`pages/${pageName}.html`);
        
        if (!response.ok) {
            throw new Error('Page not found');
        }
        
        const html = await response.text();
        contentArea.innerHTML = html;
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Update URL hash
        window.location.hash = pageName;
        
        // Initialize page-specific scripts
        initPageScripts();
        
    } catch (error) {
        contentArea.innerHTML = `
            <div class="container mx-auto px-4 py-20 text-center">
                <h1 class="font-athletic text-4xl mb-4">Page Not Found</h1>
                <p class="text-silver mb-8">The page you're looking for doesn't exist.</p>
                <button onclick="loadPage('home')" class="bg-neon-yellow text-black px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                    Go Home
                </button>
            </div>
        `;
    }
}

// Load page from URL hash
function loadPageFromHash() {
    const hash = window.location.hash.substring(1);
    const page = hash || 'home';
    loadPage(page);
}

// Initialize page-specific scripts
function initPageScripts() {
    // Define showScheduleTab globally for schedules page
    window.showScheduleTab = function(tabId) {
        const tabs = document.querySelectorAll('.schedule-tab-content');
        const buttons = document.querySelectorAll('.schedule-tab-button');
        
        tabs.forEach(tab => {
            tab.classList.add('hidden');
        });
        
        buttons.forEach(btn => {
            btn.classList.remove('border-neon-yellow', 'text-neon-yellow');
            btn.classList.add('border-transparent', 'text-silver');
        });
        
        document.getElementById(tabId).classList.remove('hidden');
        event.target.classList.remove('border-transparent', 'text-silver');
        event.target.classList.add('border-neon-yellow', 'text-neon-yellow');
    };
    
    // Define toggleFAQ globally for FAQ page
    window.toggleFAQ = function(button) {
        const content = button.nextElementSibling;
        const icon = button.querySelector('svg');
        
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
            icon.style.transform = 'rotate(0deg)';
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            icon.style.transform = 'rotate(180deg)';
        }
    };
}

// Toggle Program Card Expansion (Mobile)
window.toggleProgramCard = function(contentId) {
    const content = document.getElementById(contentId);
    const button = content.previousElementSibling;
    const arrow = button.querySelector('.expand-arrow');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        arrow.classList.remove('rotated');
    } else {
        content.classList.add('expanded');
        arrow.classList.add('rotated');
    }
};

// Toggle Experience Card Expansion (Mobile)
window.toggleExperienceCard = function(contentId) {
    const content = document.getElementById(contentId);
    const button = content.previousElementSibling;
    const arrow = button.querySelector('.expand-arrow');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        arrow.classList.remove('rotated');
    } else {
        content.classList.add('expanded');
        arrow.classList.add('rotated');
    }
};

// Values Carousel Navigation (Mobile)
let currentValueIndex = 0;

window.nextValue = function() {
    const track = document.getElementById('valuesTrack');
    if (!track) return;
    
    const slides = track.querySelectorAll('.value-slide');
    currentValueIndex = (currentValueIndex + 1) % slides.length;
    track.style.transform = `translateX(-${currentValueIndex * 100}%)`;
};

window.previousValue = function() {
    const track = document.getElementById('valuesTrack');
    if (!track) return;
    
    const slides = track.querySelectorAll('.value-slide');
    currentValueIndex = (currentValueIndex - 1 + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentValueIndex * 100}%)`;
};

// Registration Carousel Navigation (Mobile)
let currentRegistrationIndex = 0;

window.nextRegistration = function() {
    const track = document.getElementById('registrationTrack');
    if (!track) return;
    
    const slides = track.querySelectorAll('.registration-slide');
    currentRegistrationIndex = (currentRegistrationIndex + 1) % slides.length;
    track.style.transform = `translateX(-${currentRegistrationIndex * 100}%)`;
};

window.previousRegistration = function() {
    const track = document.getElementById('registrationTrack');
    if (!track) return;
    
    const slides = track.querySelectorAll('.registration-slide');
    currentRegistrationIndex = (currentRegistrationIndex - 1 + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentRegistrationIndex * 100}%)`;
};

// Testimonial Carousel Navigation
let currentTestimonialIndex = 0;

window.nextTestimonial = function() {
    const track = document.getElementById('testimonialTrack');
    if (!track) return;
    
    const slides = track.querySelectorAll('.testimonial-slide');
    currentTestimonialIndex = (currentTestimonialIndex + 1) % slides.length;
    track.style.transform = `translateX(-${currentTestimonialIndex * 100}%)`;
};

window.previousTestimonial = function() {
    const track = document.getElementById('testimonialTrack');
    if (!track) return;
    
    const slides = track.querySelectorAll('.testimonial-slide');
    currentTestimonialIndex = (currentTestimonialIndex - 1 + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentTestimonialIndex * 100}%)`;
};

// Load initial page
document.addEventListener('DOMContentLoaded', loadPageFromHash);

// Handle browser back/forward buttons
window.addEventListener('popstate', loadPageFromHash);
