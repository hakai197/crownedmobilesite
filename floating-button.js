// floating-buttons.js
document.addEventListener('DOMContentLoaded', function() {
    const floatingButtons = document.querySelector('.floating-buttons');
    
    if (floatingButtons) {
        // Only add scroll effect on desktop
        if (window.innerWidth > 1024) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    floatingButtons.classList.add('scrolled');
                    setTimeout(() => {
                        floatingButtons.classList.remove('scrolled');
                    }, 500);
                }
            });
        }
        
        // Disable coming soon button
        const comingSoonBtn = document.querySelector('.floating-button.coming-soon');
        if (comingSoonBtn) {
            comingSoonBtn.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Subscription service coming soon!');
            });
        }
    }
});