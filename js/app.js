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

// Mobile nav helpers
window.closeMobileMenu = function() {
    var mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.add('hidden');
};

function attachMobileNavHandlers() {
    var mobileBtn = document.getElementById('mobile-menu-button');
    var mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
        // Remove previous listeners if any
        mobileBtn.removeEventListener('click', mobileBtn._toggleHandler || (()=>{}));
        var toggleHandler = function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        };
        mobileBtn.addEventListener('click', toggleHandler);
        mobileBtn._toggleHandler = toggleHandler;

        mobileMenu.removeEventListener('click', mobileMenu._closeHandler || (()=>{}));
        var closeHandler = function(e) {
            if (e.target.tagName === 'BUTTON') {
                closeMobileMenu();
            }
            e.stopPropagation();
        };
        mobileMenu.addEventListener('click', closeHandler);
        mobileMenu._closeHandler = closeHandler;

        // Click outside to close
        document.removeEventListener('click', document._mobileMenuOutsideHandler || (()=>{}));
        var outsideHandler = function(e) {
            if (!mobileMenu.classList.contains('hidden')) {
                if (!mobileMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
                    closeMobileMenu();
                }
            }
        };
        document.addEventListener('click', outsideHandler);
        document._mobileMenuOutsideHandler = outsideHandler;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadPageFromHash();
    attachMobileNavHandlers();
    // Restore desktop dropdown hover logic
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('mouseenter', function() {
            var menu = this.querySelector('.dropdown-menu');
            if (menu) menu.classList.remove('hidden');
        });
        dropdown.addEventListener('mouseleave', function() {
            var menu = this.querySelector('.dropdown-menu');
            if (menu) menu.classList.add('hidden');
        });
    });
});

// Also re-attach handlers after every page load (SPA navigation)
window.addEventListener('hashchange', attachMobileNavHandlers);

// Handle browser back/forward buttons
window.addEventListener('popstate', loadPageFromHash);

// Nav overflow detector: if desktop nav items don't fit, switch to collapsed hamburger
(function() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const checkNavOverflow = () => {
        const container = nav.querySelector('.container');
        const desktop = nav.querySelector('.desktop-nav');
        const mobileBtn = document.getElementById('mobile-menu-button');
        if (!container || !desktop || !mobileBtn) return;

        const desktopStyle = window.getComputedStyle(desktop);
        // If desktop nav is not rendered (e.g. small screens), clear collapse
        if (desktopStyle.display === 'none') {
            nav.classList.remove('collapsed-nav');
            return;
        }

        const desktopRect = desktop.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const buffer = 12; // small breathing room

        // 1) Basic viewport overflow check
        const overflowsViewport = desktopRect.right > (window.innerWidth - buffer) || desktopRect.left < buffer;

        // 2) Scroll width vs client width (items overflow horizontally)
        const scrollOverflow = desktop.scrollWidth > (desktop.clientWidth - buffer) || desktop.scrollWidth > (container.clientWidth - buffer);

        // 3) Any direct child overflowing container bounds (covers edge cases with dropdowns/items)
        let childOverflow = false;
        Array.from(desktop.children).forEach(child => {
            try {
                const r = child.getBoundingClientRect();
                if (r.right > (containerRect.right - buffer) || r.left < (containerRect.left + buffer)) {
                    childOverflow = true;
                }
            } catch (e) {
                // ignore measurement errors
            }
        });

        // If any overflow detected, collapse to mobile nav
        if (overflowsViewport || scrollOverflow || childOverflow) {
            nav.classList.add('collapsed-nav');
        } else {
            nav.classList.remove('collapsed-nav');
        }
    };

    // debounce helper
    let t;
    const debounced = () => { clearTimeout(t); t = setTimeout(checkNavOverflow, 120); };

    window.addEventListener('resize', debounced);
    window.addEventListener('orientationchange', debounced);
    window.addEventListener('load', () => { setTimeout(checkNavOverflow, 150); });
    // run shortly after script load to catch initial layout
    setTimeout(checkNavOverflow, 60);
})();
