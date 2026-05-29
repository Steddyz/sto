/**
 * Рендерит подвал сайта
 * @returns {HTMLElement}
 */
export const renderFooter = () => {
    const footer = document.createElement('footer');
    footer.style.background = 'var(--bg-secondary)';
    footer.style.backdropFilter = 'blur(16px)';
    footer.style.padding = '2rem';
    footer.style.marginTop = 'auto';
    footer.style.borderTop = 'var(--glass-border)';
    
    footer.innerHTML = `
        <div class="container" style="text-align: center;">
            <p>&copy; 2026 Автосервис "Мотор-Техно". Все права защищены.</p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                <i class="fas fa-map-marker-alt"></i> г. Москва, ул. Автомобильная, 15
            </p>
        </div>
    `;
    
    return footer;
};