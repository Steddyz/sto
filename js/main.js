import { createStore } from './core/store.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { initRouter } from './components/router.js';
import { renderChatWidget } from './components/chatWidget.js';
import { initTheme } from './components/theme.js';

const initApp = () => {
    const store = createStore();
    initTheme(store);
    
    const headerPlaceholder = document.getElementById('header-placeholder');
    const header = renderHeader(store);
    headerPlaceholder.appendChild(header);
    
    const footerPlaceholder = document.getElementById('footer-placeholder');
    const footer = renderFooter();
    footerPlaceholder.appendChild(footer);
    
    const chatPlaceholder = document.getElementById('chat-widget-placeholder');
    const chatWidget = renderChatWidget(store);
    chatPlaceholder.appendChild(chatWidget);
    
    initRouter(store);
};

document.addEventListener('DOMContentLoaded', initApp);

// ============================================
// АНИМАЦИИ ПРИ СКРОЛЛЕ
// ============================================

const initScrollAnimations = () => {
    // Добавляем классы для анимации элементам
    const elementsToAnimate = [
        { selector: '.grid-3 .glass-card', className: 'scroll-animate-up', delay: true },
        { selector: '.calculator', className: 'scroll-animate-left', delay: false },
        { selector: '.counter-wrapper', className: 'scroll-animate-scale', delay: false },
        { selector: '.reviews-section', className: 'scroll-animate', delay: false },
        { selector: '.review-card', className: 'scroll-animate-right', delay: true },
        { selector: '.map-container', className: 'scroll-animate', delay: false },
        { selector: '.grid-4 .glass-card', className: 'scroll-animate-up', delay: true }
    ];
    
    // Применяем классы
    elementsToAnimate.forEach(item => {
        document.querySelectorAll(item.selector).forEach((el, index) => {
            if (item.className) {
                el.classList.add(item.className);
                if (item.delay) {
                    el.style.transitionDelay = `${index * 0.1}s`;
                }
            }
        });
    });
    
    // Создаём Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    
    // Наблюдаем за элементами
    document.querySelectorAll('.scroll-animate-up, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale, .scroll-animate').forEach(el => {
        observer.observe(el);
    });
};

// ============================================
// ЭФФЕКТ RIPPLE ДЛЯ КНОПОК
// ============================================

const initRippleEffect = () => {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.removeEventListener('click', rippleHandler);
        btn.addEventListener('click', rippleHandler);
    });
};

const rippleHandler = (e) => {
    const btn = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    
    btn.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
};

// ============================================
// ПАРАЛЛАКС ЭФФЕКТ ДЛЯ HERO
// ============================================

const initParallax = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const video = hero.querySelector('.hero-video');
    if (!video) return;
    
    let ticking = false;
    
    const handleScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                video.style.transform = `translateY(${scrolled * 0.2}px)`;
                ticking = false;
            });
            ticking = true;
        }
    };
    
    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);
};

// ============================================
// ПЛАВНЫЙ СКРОЛЛ К ЯКОРЯМ
// ============================================

const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', smoothScrollHandler);
        anchor.addEventListener('click', smoothScrollHandler);
    });
};

const smoothScrollHandler = function(e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '#home' || href === '#admin2026') return;
    
    const target = document.querySelector(href);
    if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// ============================================
// АНИМАЦИЯ ЧИСЛА В СЧЁТЧИКЕ
// ============================================

const initCounterAnimation = () => {
    const counterElement = document.getElementById('counterDisplay');
    if (!counterElement) return;
    
    const targetCount = 1247;
    let animated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                let current = 0;
                const step = Math.ceil(targetCount / 60);
                const interval = setInterval(() => {
                    current += step;
                    if (current >= targetCount) {
                        current = targetCount;
                        clearInterval(interval);
                    }
                    counterElement.textContent = current;
                }, 20);
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(counterElement);
};

// ============================================
// ОБНОВЛЕНИЕ АНИМАЦИЙ ПРИ СМЕНЕ СТРАНИЦЫ
// ============================================

const refreshAnimations = () => {
    setTimeout(() => {
        initScrollAnimations();
        initRippleEffect();
        initCounterAnimation();
    }, 200);
};

// Слушаем событие обновления контента (роутер)
window.addEventListener('servicesUpdated', refreshAnimations);

// Также слушаем изменения хеша (переходы между страницами)
window.addEventListener('hashchange', refreshAnimations);

// ============================================
// ЗАПУСК ВСЕХ АНИМАЦИЙ ПОСЛЕ ЗАГРУЗКИ
// ============================================

window.addEventListener('load', () => {
    setTimeout(() => {
        initScrollAnimations();
        initRippleEffect();
        initParallax();
        initSmoothScroll();
        initCounterAnimation();
    }, 300);
});

setTimeout(() => {
    initScrollAnimations();
    initRippleEffect();
    initParallax();
    initSmoothScroll();
    initCounterAnimation();
}, 500);