export const renderContactsPage = () => {
    const container = document.createElement('div');
    container.className = 'container';
    
    container.innerHTML = `
        <h1 style="margin-bottom: 2rem;">Контакты</h1>
        
        <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem;">
            <div class="grid-3">
                <div>
                    <h3><i class="fas fa-map-marker-alt"></i> Адрес</h3>
                    <p>г. Москва, ул. Автомобильная, д. 15</p>
                    <p>БЦ "Автоцентр", 1 этаж</p>
                </div>
                <div>
                    <h3><i class="fas fa-phone"></i> Телефон</h3>
                    <p>+7 (495) 123-45-67</p>
                    <p>+7 (999) 123-45-67 (WhatsApp)</p>
                </div>
                <div>
                    <h3><i class="fas fa-clock"></i> Режим работы</h3>
                    <p>Пн-Пт: 09:00 - 21:00</p>
                    <p>Сб-Вс: 10:00 - 18:00</p>
                </div>
            </div>
        </div>
        
        <div class="map-container glass-card">
            <iframe 
                src="https://yandex.ru/map-widget/v1/?ll=37.617698,55.755864&z=12&pt=37.617698,55.755864,pm2rdm"
                allowfullscreen>
            </iframe>
        </div>
        
        <div class="glass-card" style="padding: 2rem; text-align: center;">
            <h3>Свяжитесь с нами</h3>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                <a href="https://t.me/auto_moto_r_tech_2026" target="_blank" style="font-size: 2rem; color: var(--accent);">
                    <i class="fab fa-telegram"></i>
                </a>
                <a href="https://wa.me/79991234567" target="_blank" style="font-size: 2rem; color: var(--accent);">
                    <i class="fab fa-whatsapp"></i>
                </a>
                <a href="mailto:info@motor-techno.ru" style="font-size: 2rem; color: var(--accent);">
                    <i class="fas fa-envelope"></i>
                </a>
            </div>
        </div>
    `;
    
    return container;
};