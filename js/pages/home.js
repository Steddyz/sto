import { openTelegramChat, buildOrderMessage } from '../components/telegram.js';
import { showLoader, hideLoader } from '../components/loader.js';
import { escapeHtml } from '../components/validation.js';

// Данные отзывов для слайдера (9 отзывов)
const reviewsData = [
    {
        img: 'https://randomuser.me/api/portraits/women/1.jpg',
        name: 'Анна Смирнова',
        text: 'Отличный сервис! Быстро и качественно заменили масло.',
        date: '15 марта 2026'
    },
    {
        img: 'https://randomuser.me/api/portraits/men/2.jpg',
        name: 'Дмитрий Иванов',
        text: 'Сделали тюнинг подвески, машина стала как новая!',
        date: '10 марта 2026'
    },
    {
        img: 'https://randomuser.me/api/portraits/women/3.jpg',
        name: 'Елена Петрова',
        text: 'Лучший автосервис в городе. Рекомендую!',
        date: '5 марта 2026'
    },
    {
        img: 'https://randomuser.me/api/portraits/men/4.jpg',
        name: 'Михаил Соколов',
        text: 'Отремонтировали двигатель быстро и качественно.',
        date: '28 февраля 2026'
    },
    {
        img: 'https://randomuser.me/api/portraits/women/5.jpg',
        name: 'Татьяна Морозова',
        text: 'Развал-схождение сделали отлично!',
        date: '20 февраля 2026'
    },
    {
        img: 'https://randomuser.me/api/portraits/men/6.jpg',
        name: 'Алексей Кузнецов',
        text: 'Профессионалы, всем доволен!',
        date: '15 февраля 2026'
    },
    {
        img: 'https://randomuser.me/api/portraits/women/7.jpg',
        name: 'Ольга Воробьева',
        text: 'Быстро, качественно, недорого. Спасибо!',
        date: '10 февраля 2026'
    },
    {
        img: 'https://randomuser.me/api/portraits/men/8.jpg',
        name: 'Игорь Морозов',
        text: 'Диагностика за 15 минут! Отличные мастера.',
        date: '5 февраля 2026'
    },
    {
        img: 'https://randomuser.me/api/portraits/women/9.jpg',
        name: 'Мария Соловьева',
        text: 'Шиномонтаж быстро и аккуратно. Приеду ещё!',
        date: '28 января 2026'
    }
];

// Функция рендера слайдера отзывов
const renderReviewsSlider = (reviews, container) => {
    let currentIndex = 0;
    let slidesToShow = 3;
    let autoPlayInterval = null;
    
    const updateSlidesToShow = () => {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    };
    
    slidesToShow = updateSlidesToShow();
    const totalSlides = Math.ceil(reviews.length / slidesToShow);
    
    const renderSlider = () => {
        const startIndex = currentIndex * slidesToShow;
        const visibleReviews = reviews.slice(startIndex, startIndex + slidesToShow);
        
        container.innerHTML = `
            <div class="reviews-slider-container">
                <button class="slider-btn slider-btn-prev">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="reviews-slider">
                    ${visibleReviews.map(review => `
                        <div class="review-card glass-card">
                            <img src="${review.img}" alt="${escapeHtml(review.name)}" class="review-avatar">
                            <h4>${escapeHtml(review.name)}</h4>
                            <p>${escapeHtml(review.text)}</p>
                            <small>${escapeHtml(review.date)}</small>
                        </div>
                    `).join('')}
                </div>
                <button class="slider-btn slider-btn-next">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="slider-dots">
                ${Array.from({ length: totalSlides }, (_, i) => `
                    <div class="slider-dot ${i === currentIndex ? 'active' : ''}" data-index="${i}"></div>
                `).join('')}
            </div>
        `;
        
        // Обработчики кнопок
        const prevBtn = container.querySelector('.slider-btn-prev');
        const nextBtn = container.querySelector('.slider-btn-next');
        
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = totalSlides - 1; // Зацикливание: с первой на последнюю
            }
            renderSlider();
            resetAutoPlay();
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
            } else {
                currentIndex = 0; // Зацикливание: с последней на первую
            }
            renderSlider();
            resetAutoPlay();
        });
        
        // Обработчики точек
        container.querySelectorAll('.slider-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                currentIndex = parseInt(dot.dataset.index);
                renderSlider();
                resetAutoPlay();
            });
        });
    };
    
    const startAutoPlay = () => {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            renderSlider();
        }, 5000);
    };
    
    const resetAutoPlay = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }
    };
    
    const handleResize = () => {
        const newSlidesToShow = updateSlidesToShow();
        if (newSlidesToShow !== slidesToShow) {
            slidesToShow = newSlidesToShow;
            currentIndex = 0;
            renderSlider();
            resetAutoPlay();
        }
    };
    
    window.addEventListener('resize', handleResize);
    renderSlider();
    startAutoPlay();
    
    return () => {
        window.removeEventListener('resize', handleResize);
        if (autoPlayInterval) clearInterval(autoPlayInterval);
    };
};

export const renderHomePage = (store) => {
    const container = document.createElement('div');
    container.className = 'container';
    
    const targetCount = 1247;
    
    container.innerHTML = `
        <section class="hero">
            <video class="hero-video" autoplay muted loop playsinline>
                <source src="https://assets.mixkit.co/videos/preview/mixkit-car-on-a-road-while-the-sun-is-setting-39867-large.mp4" type="video/mp4">
            </video>
            <div class="hero-content glass-card">
                <h1>Автосервис <span class="animated-brand" id="animatedBrand">"Мотор-Техно"</span></h1>
                <p>Профессиональный ремонт и обслуживание автомобилей с 2010 года</p>
                <button class="btn" id="mainOrderBtn">
                    <i class="fas fa-calendar-alt"></i> Записаться
                </button>
            </div>
        </section>
        
        <h2 style="margin: 3rem 0 1.5rem;">Наши преимущества</h2>
        <div class="grid-3">
            <div class="glass-card" style="padding: 2rem; text-align: center;">
                <i class="fas fa-stethoscope" style="font-size: 3rem; color: var(--accent);"></i>
                <h3>Бесплатная диагностика</h3>
                <p>При любом ремонте диагностика бесплатно</p>
            </div>
            <div class="glass-card" style="padding: 2rem; text-align: center;">
                <i class="fas fa-cogs" style="font-size: 3rem; color: var(--accent);"></i>
                <h3>Все марки авто</h3>
                <p>Работаем с любыми марками и моделями</p>
            </div>
            <div class="glass-card" style="padding: 2rem; text-align: center;">
                <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--accent);"></i>
                <h3>Гарантия 12 месяцев</h3>
                <p>На все виды работ даем гарантию</p>
            </div>
        </div>
        
        <div class="calculator glass-card">
            <h3><i class="fas fa-calculator"></i> Калькулятор ремонта</h3>
            <div class="form-group">
                <label>Стоимость запчастей: <span id="partsValue">0</span> ₽</label>
                <input type="range" id="partsRange" min="0" max="100000" step="1000" value="20000">
            </div>
            <div class="form-group">
                <label>Сложность работ: <span id="complexityValue">0</span> %</label>
                <input type="range" id="complexityRange" min="0" max="100" value="50">
            </div>
            <div class="form-group">
                <label>Примерная цена ремонта: <strong><span id="totalPrice">0</span> ₽</strong></label>
            </div>
        </div>
        
        <div class="counter-wrapper" style="text-align: center; margin: 2rem 0;">
            <div class="glass-card" style="padding: 2rem; display: inline-block;">
                <i class="fas fa-wrench" style="font-size: 3rem;"></i>
                <h2>Машин починили за всё время</h2>
                <p id="counterDisplay" style="font-size: 4rem; font-weight: 800; color: var(--accent);">0</p>
            </div>
        </div>
        
        <div class="reviews-section">
            <h2 style="margin: 3rem 0 1.5rem;">Отзывы клиентов</h2>
            <div id="reviewsSlider"></div>
        </div>
    `;
    
    // Анимация только для "Мотор-Техно"
    const animateBrand = () => {
        const brandElement = container.querySelector('#animatedBrand');
        if (!brandElement) return;
        
        const text = brandElement.textContent;
        brandElement.innerHTML = '';
        
        const letters = text.split('');
        letters.forEach((letter, index) => {
            const span = document.createElement('span');
            span.textContent = letter;
            span.className = 'animated-letter';
            span.style.animationDelay = `${index * 0.08}s`;
            brandElement.appendChild(span);
        });
    };
    
    showLoader();
    
    setTimeout(() => {
        animateBrand();
    }, 200);
    
    setTimeout(() => {
        hideLoader();
    }, 300);
    
    // Калькулятор
    const partsRange = container.querySelector('#partsRange');
    const complexityRange = container.querySelector('#complexityRange');
    const partsValue = container.querySelector('#partsValue');
    const complexityValue = container.querySelector('#complexityValue');
    const totalPriceSpan = container.querySelector('#totalPrice');
    
    const updateCalculator = () => {
        const parts = parseInt(partsRange.value);
        const complexity = parseInt(complexityRange.value);
        const total = parts + (parts * complexity / 100);
        partsValue.textContent = parts;
        complexityValue.textContent = complexity;
        totalPriceSpan.textContent = Math.floor(total);
    };
    
    if (partsRange) partsRange.addEventListener('input', updateCalculator);
    if (complexityRange) complexityRange.addEventListener('input', updateCalculator);
    updateCalculator();
    
    // Анимация счетчика
    const counterElement = container.querySelector('#counterDisplay');
    if (counterElement) {
        const animateCounter = () => {
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
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter();
                    observer.disconnect();
                }
            });
        });
        observer.observe(counterElement);
    }
    
    // Кнопка записи
    const orderBtn = container.querySelector('#mainOrderBtn');
    if (orderBtn) {
        orderBtn.addEventListener('click', (e) => {
            const carData = store.getState().carData;
            const message = buildOrderMessage('Запись на ремонт', 0, 1, carData);
            openTelegramChat({ message }, e);
        });
    }
    
    // Инициализация слайдера отзывов
    const sliderContainer = container.querySelector('#reviewsSlider');
    if (sliderContainer) {
        renderReviewsSlider(reviewsData, sliderContainer);
    }
    
    return container;
};