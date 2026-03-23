document.addEventListener('DOMContentLoaded', () => {
    // 1. Secure Preloader - Faster & More Professional
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('fade-out-loader');
            // Remove from DOM after transition
            setTimeout(() => preloader.remove(), 800);
        }
    }, 800);

    // 2. Dynamic Navbar
    const header = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

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

    // 4. Native Stat Counter
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
                animateValue(target, 0, finalValue, 2000);
                statsObserver.unobserve(target);
            }
        });
    });

    stats.forEach(stat => statsObserver.observe(stat));
});