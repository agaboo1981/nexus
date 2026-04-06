// Function to handle the preloader removal
const removePreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out-loader');
        // Remove from DOM after transition
        setTimeout(() => {
            if (preloader.parentNode) {
                preloader.remove();
            }
        }, 800);
    }
};

// Main initialization function
const init = () => {
    // 1. Secure Preloader - Faster & More Professional
    // We run this after a short delay to ensure it's visible for a bit
    setTimeout(removePreloader, 800);

    // 2. Dynamic Navbar
    const header = document.querySelector('nav');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleMenu = (open) => {
        if (open) {
            mobileMenu.classList.add('opacity-100');
            mobileMenu.classList.remove('pointer-events-none');
            document.body.style.overflow = 'hidden';
            mobileMenuClose.focus();
        } else {
            mobileMenu.classList.remove('opacity-100');
            mobileMenu.classList.add('pointer-events-none');
            document.body.style.overflow = '';
            mobileMenuToggle.focus();
        }
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('pointer-events-none')) {
            toggleMenu(false);
        }
    });

    if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', () => toggleMenu(true));
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', () => toggleMenu(false));
    mobileLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));

    // 3. Advanced Scroll Animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // --- Subscription Form ---
    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = subscribeForm.querySelector('input');
            const btn = subscribeForm.querySelector('button');
            const originalBtnText = btn.textContent;

            if (input && input.value) {
                btn.disabled = true;
                btn.textContent = 'Joining...';
                
                try {
                    await subscribeNewsletter(input.value);
                    input.value = '';
                    btn.textContent = 'Success!';
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.textContent = originalBtnText;
                    }, 3000);
                } catch (error) {
                    btn.disabled = false;
                    btn.textContent = originalBtnText;
                }
            }
        });
    }

    // Native Stat Counter
    const stats = document.querySelectorAll('.stat-number');
    const animateValue = (obj, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            
            if (obj.innerText.includes('$')) {
                obj.innerHTML = `$${value}B+`;
            } else if (obj.innerText.includes('M')) {
                obj.innerHTML = `${value}M+`;
            } else if (obj.innerText.includes('%')) {
                obj.innerHTML = `${(progress * (end - start) + start).toFixed(1)}%`;
            } else {
                obj.innerHTML = `${value}+`;
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.innerText;
                const finalValue = parseFloat(text.replace(/[^0-9.]/g, ''));
                if (!isNaN(finalValue)) {
                    animateValue(target, 0, finalValue, 2000);
                }
                statsObserver.unobserve(target);
            }
        });
    });

    stats.forEach(stat => statsObserver.observe(stat));
};

// Execute initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}