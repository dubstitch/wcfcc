async function loadPage(pageName) {
    const contentArea = document.getElementById('content-area');
    
    try {
        const response = await fetch(`pages/${pageName}.html`);
        if (!response.ok) throw new Error('Page not found');
        
        const html = await response.text();
        contentArea.innerHTML = html;
        
        window.scrollTo(0, 0);
        
        initPageScripts();
        
        history.pushState(null, null, '#' + pageName);
        
    } catch (error) {
        contentArea.innerHTML = `
            <div class="container mx-auto px-4 py-12 text-center">
                <h1 class="font-athletic text-4xl mb-4">Page Not Found</h1>
                <p class="text-xl mb-8">Sorry, we couldn't find that page.</p>
                <button onclick="loadPage('home')" class="bg-neon-yellow text-black px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-80 transition">
                    Go Home
                </button>
            </div>
        `;
    }
}

function loadPageFromHash() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        loadPage(hash);
    } else {
        loadPage('home');
    }
}

window.addEventListener('popstate', loadPageFromHash);

function initPageScripts() {
    if (typeof showScheduleTab !== 'undefined') {
        // Already defined
    } else {
        window.showScheduleTab = function(tabId) {
            document.querySelectorAll('.schedule-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            document.querySelectorAll('.schedule-tab').forEach(tab => {
                tab.classList.remove('bg-neon-yellow', 'text-black');
                tab.classList.add('bg-neutral-dark', 'text-white');
            });
            
            const selectedContent = document.getElementById(tabId);
            if (selectedContent) {
                selectedContent.classList.remove('hidden');
            }
            
            const selectedTab = document.getElementById('tab-' + tabId);
            if (selectedTab) {
                selectedTab.classList.remove('bg-neutral-dark', 'text-white');
                selectedTab.classList.add('bg-neon-yellow', 'text-black');
            }
        };
    }
    
    window.toggleFAQ = function(button) {
        const content = button.nextElementSibling;
        const icon = button.querySelector('svg');
        content.classList.toggle('hidden');
        icon.classList.toggle('rotate-180');
    };
    
    const carousels = document.querySelectorAll('.carousel-wrapper');
    carousels.forEach(carousel => {
        let isDown = false;
        let startX;
        let scrollLeft;
        const track = carousel.querySelector('.auto-scroll-track');

        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            carousel.classList.add('grabbing');
            if (track) track.classList.add('dragging');
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.classList.remove('grabbing');
            if (track) track.classList.remove('dragging');
        });

        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.classList.remove('grabbing');
            if (track) track.classList.remove('dragging');
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        });

        carousel.addEventListener('touchstart', () => {
            if (track) track.classList.add('dragging');
        });

        carousel.addEventListener('touchend', () => {
            if (track) track.classList.remove('dragging');
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    loadPageFromHash();
});
