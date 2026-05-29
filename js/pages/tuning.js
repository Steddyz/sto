import { openTelegramChat, buildOrderMessage } from '../components/telegram.js';
import { validateOrder, escapeHtml } from '../components/validation.js';
import { loadData } from '../db.js';

let cachedServices = [];

const loadTuningServices = async () => {
    const data = await loadData();
    cachedServices = data.tuning || [];
    return cachedServices;
};

export const renderTuningPage = (store) => {
    const container = document.createElement('div');
    container.className = 'container';
    
    container.innerHTML = `
        <h1 style="margin-bottom: 2rem;">🔧 Тюнинг автомобилей</h1>
        
        <div class="form-group glass-card" style="padding: 1.5rem; margin-bottom: 2rem;">
            <h3>📋 Данные автомобиля</h3>
            <div class="grid-3">
                <div>
                    <label>Марка</label>
                    <select id="carBrand">
                        <option value="">Выберите марку</option>
                        <option>Toyota</option><option>Honda</option><option>BMW</option>
                        <option>Mercedes</option><option>Audi</option><option>Volkswagen</option>
                        <option>Hyundai</option><option>Kia</option>
                    </select>
                </div>
                <div><label>Модель</label><input type="text" id="carModel" placeholder="Модель"></div>
                <div><label>Год</label><input type="text" id="carYear" placeholder="Год выпуска"></div>
            </div>
        </div>
        
        <div class="grid-3" id="servicesGrid"></div>
    `;
    
    const grid = container.querySelector('#servicesGrid');
    const brandSelect = container.querySelector('#carBrand');
    const modelInput = container.querySelector('#carModel');
    const yearInput = container.querySelector('#carYear');
    
    const updateCarData = () => {
        store.updateCarData({
            brand: brandSelect?.value || '',
            model: modelInput?.value || '',
            year: yearInput?.value || ''
        });
    };
    
    if (brandSelect) brandSelect.addEventListener('change', updateCarData);
    if (modelInput) modelInput.addEventListener('input', updateCarData);
    if (yearInput) yearInput.addEventListener('input', updateCarData);
    
    const renderServices = async () => {
        const services = await loadTuningServices();
        if (!grid) return;
        grid.innerHTML = '';
        
        services.forEach(service => {
            const card = document.createElement('div');
            card.className = 'glass-card service-card';
            card.style.padding = '1.5rem';
            card.style.position = 'relative';
            
            let quantity = 1;
            
            // Проверяем, есть ли скидка
            const hasDiscount = service.oldPrice && service.oldPrice > service.price;
            const discount = hasDiscount ? Math.round(((service.oldPrice - service.price) / service.oldPrice) * 100) : 0;
            const popularBadge = service.popular ? '<div class="popular-badge"><i class="fas fa-star"></i> Популярное</div>' : '';
            
            card.innerHTML = `
                ${popularBadge}
                <h3>${escapeHtml(service.name)}</h3>
                <div class="price-container">
                    ${hasDiscount ? `
                        <div class="price-wrapper">
                            <span class="old-price">${service.oldPrice.toLocaleString()} ₽</span>
                            <span class="current-price">${service.price.toLocaleString()} ₽</span>
                            <span class="discount-badge">-${discount}%</span>
                        </div>
                    ` : `
                        <div class="price-wrapper">
                            <span class="current-price single-price">${service.price.toLocaleString()} ₽</span>
                        </div>
                    `}
                </div>
                <p><i class="fas fa-clock"></i> Срок: ${service.days || 1} день</p>
                <div class="quantity-selector">
                    <button class="quantity-minus quantity-btn">-</button>
                    <span class="quantity-value">${quantity}</span>
                    <button class="quantity-plus quantity-btn">+</button>
                </div>
                <div class="total-price" style="margin-top: 10px;">Итого: ${(service.price * quantity).toLocaleString()} ₽</div>
                <button class="btn order-btn" style="width: 100%; margin-top: 1rem;"><i class="fas fa-shopping-cart"></i> Купить</button>
                <button class="quick-order-btn" style="width: 100%; margin-top: 0.5rem;"><i class="fab fa-telegram"></i> Быстрый заказ</button>
            `;
            
            const minusBtn = card.querySelector('.quantity-minus');
            const plusBtn = card.querySelector('.quantity-plus');
            const quantitySpan = card.querySelector('.quantity-value');
            const totalPriceSpan = card.querySelector('.total-price');
            const orderBtn = card.querySelector('.order-btn');
            const quickBtn = card.querySelector('.quick-order-btn');
            
            const updateQuantity = (delta) => {
                quantity = Math.max(1, quantity + delta);
                quantitySpan.textContent = quantity;
                totalPriceSpan.textContent = `Итого: ${(service.price * quantity).toLocaleString()} ₽`;
            };
            
            minusBtn.addEventListener('click', () => updateQuantity(-1));
            plusBtn.addEventListener('click', () => updateQuantity(1));
            
            const handleOrder = (event) => {
                if (!event.isTrusted) return;
                
                const carData = {
                    brand: brandSelect?.value || '',
                    model: modelInput?.value || '',
                    year: yearInput?.value || ''
                };
                
                const orderData = { serviceName: service.name, quantity, carData };
                const validation = validateOrder(orderData);
                if (!validation.isValid) {
                    alert('Ошибка: ' + validation.errors.join(', '));
                    return;
                }
                
                const totalPrice = service.price * quantity;
                const message = buildOrderMessage(service.name, totalPrice, quantity, carData);
                openTelegramChat({ message }, event);
            };
            
            orderBtn.addEventListener('click', handleOrder);
            quickBtn.addEventListener('click', handleOrder);
            
            grid.appendChild(card);
        });
    };
    
    renderServices();
    
    window.addEventListener('servicesUpdated', renderServices);
    
    return container;
};