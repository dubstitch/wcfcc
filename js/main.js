  <script>
        // Navigation functionality
        function showPage(pageId) {
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.add('hidden'));
            document.getElementById(pageId).classList.remove('hidden');
            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => btn.classList.remove('text-neon-yellow'));
            window.scrollTo(0, 0);
        }

        function toggleMenu() {
            const menu = document.getElementById('mobileMenu');
            menu.classList.toggle('hidden');
        }

        // Schedule tabs
        function showSchedule(type) {
            const contents = document.querySelectorAll('.schedule-content');
            const tabs = document.querySelectorAll('.schedule-tab');
            
            contents.forEach(content => content.classList.add('hidden'));
            tabs.forEach(tab => {
                tab.classList.remove('bg-neon-yellow', 'text-black');
                tab.classList.add('bg-neutral-dark', 'text-white');
            });
            
            document.getElementById(type).classList.remove('hidden');
            event.target.classList.remove('bg-neutral-dark', 'text-white');
            event.target.classList.add('bg-neon-yellow', 'text-black');
        }

        // FAQ functionality
        function toggleFAQ(button) {
            const content = button.nextElementSibling;
            const icon = button.querySelector('svg');
            
            content.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            showPage('home');
            
            // Add drag scrolling to carousels
            const carousels = document.querySelectorAll('.carousel-wrapper');
            carousels.forEach(carousel => {
                let isDown = false;
                let startX;
                let scrollLeft;
                const track = carousel.querySelector('.auto-scroll-track');
                
                carousel.addEventListener('mousedown', (e) => {
                    isDown = true;
                    carousel.classList.add('grabbing');
                    track.classList.add('dragging');
                    startX = e.pageX - carousel.offsetLeft;
                    scrollLeft = carousel.scrollLeft;
                });
                
                carousel.addEventListener('mouseleave', () => {
                    isDown = false;
                    carousel.classList.remove('grabbing');
                    track.classList.remove('dragging');
                });
                
                carousel.addEventListener('mouseup', () => {
                    isDown = false;
                    carousel.classList.remove('grabbing');
                    track.classList.remove('dragging');
                });
                
                carousel.addEventListener('mousemove', (e) => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - carousel.offsetLeft;
                    const walk = (x - startX) * 2;
                    carousel.scrollLeft = scrollLeft - walk;
                });
                
                // Touch support for mobile
                carousel.addEventListener('touchstart', () => {
                    track.classList.add('dragging');
                });
                
                carousel.addEventListener('touchend', () => {
                    track.classList.remove('dragging');
                });
            });
        });
    </script>
 <script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9be90de1573d082b',t:'MTc2ODUxODcwNy4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script></body>
