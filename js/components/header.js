import { initTheme, toggleTheme } from './theme.js';

export const renderHeader = (store) => {
    const header = document.createElement('header');
    const currentTheme = store.getState().theme;
    
    header.innerHTML = `
        <nav class="nav-bar">
            <div class="nav-container">
                <div class="logo" id="mainLogo">
                    <i class="fas fa-car"></i> Мотор-Техно
                </div>
                <div class="nav-links">
                    <a data-route="home">Главная</a>
                    <a data-route="tuning">Тюнинг</a>
                    <a data-route="oils">Замена масел</a>
                    <a data-route="services">Услуги</a>
                    <a data-route="contacts">Контакты</a>
                </div>
                <button class="theme-toggle" aria-label="Сменить тему">
                    <i class="fas ${currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
                </button>
                <button class="burger-menu" id="burgerMenu" aria-label="Меню">
                    <span class="burger-line"></span>
                    <span class="burger-line"></span>
                    <span class="burger-line"></span>
                </button>
            </div>
        </nav>
        
        <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
        <div class="mobile-menu" id="mobileMenu">
            <div class="mobile-menu-header">
                <i class="fas fa-car"></i> Меню
            </div>
            <button class="mobile-menu-close" id="mobileMenuClose">
                <i class="fas fa-times"></i>
            </button>
            <a data-route="home" class="mobile-nav-link">
                <i class="fas fa-home"></i> Главная
            </a>
            <a data-route="tuning" class="mobile-nav-link">
                <i class="fas fa-tachometer-alt"></i> Тюнинг
            </a>
            <a data-route="oils" class="mobile-nav-link">
                <i class="fas fa-oil-can"></i> Замена масел
            </a>
            <a data-route="services" class="mobile-nav-link">
                <i class="fas fa-wrench"></i> Услуги
            </a>
            <a data-route="contacts" class="mobile-nav-link">
                <i class="fas fa-map-marker-alt"></i> Контакты
            </a>
            <button class="mobile-theme-toggle" id="mobileThemeToggle">
                <i class="fas ${currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
                <span>${currentTheme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
            </button>
        </div>
    `;
    
    // ========== ЛОГИКА БУРГЕР-МЕНЮ ==========
    const burgerBtn = header.querySelector('#burgerMenu');
    const mobileMenu = header.querySelector('#mobileMenu');
    const mobileOverlay = header.querySelector('#mobileMenuOverlay');
    const mobileClose = header.querySelector('#mobileMenuClose');
    const mobileThemeBtn = header.querySelector('#mobileThemeToggle');
    
    const openMenu = () => {
        burgerBtn.classList.add('active');
        mobileMenu.classList.add('active');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    const closeMenu = () => {
        burgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    if (burgerBtn) burgerBtn.addEventListener('click', openMenu);
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
    
    // Закрытие при клике на ссылку в мобильном меню
    const mobileLinks = header.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // ========== КЛИК ПО ЛОГОТИПУ (ПЕРЕХОД НА ГЛАВНУЮ) ==========
    const mainLogo = header.querySelector('#mainLogo');
    if (mainLogo) {
        mainLogo.addEventListener('click', () => {
            // Если мы уже на главной странице
            if (window.location.hash === '#home' || window.location.hash === '') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Переходим на главную страницу
                window.location.hash = 'home';
            }
        });
    }
    
    // ========== КНОПКА ТЕМЫ В МОБИЛЬНОМ МЕНЮ ==========
    if (mobileThemeBtn) {
        mobileThemeBtn.addEventListener('click', () => {
            toggleTheme(store);
            const newTheme = store.getState().theme;
            const icon = mobileThemeBtn.querySelector('i');
            const span = mobileThemeBtn.querySelector('span');
            icon.className = `fas ${newTheme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
            span.textContent = newTheme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
            
            // Обновляем основную кнопку темы
            const themeBtn = header.querySelector('.theme-toggle');
            if (themeBtn) {
                const themeIcon = themeBtn.querySelector('i');
                themeIcon.className = `fas ${newTheme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
            }
        });
    }
    
    // ========== КНОПКА ТЕМЫ В ХЕДЕРЕ ==========
    const themeBtn = header.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            toggleTheme(store);
            const icon = themeBtn.querySelector('i');
            const newTheme = store.getState().theme;
            icon.className = `fas ${newTheme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
            
            // Обновляем кнопку темы в мобильном меню
            if (mobileThemeBtn) {
                const mobileIcon = mobileThemeBtn.querySelector('i');
                const mobileSpan = mobileThemeBtn.querySelector('span');
                mobileIcon.className = `fas ${newTheme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
                mobileSpan.textContent = newTheme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
            }
        });
    }
    
    return header;
};