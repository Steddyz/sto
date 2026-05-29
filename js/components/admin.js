let servicesStore = {
    tuning: [],
    oils: [],
    services: []
};

// Загрузка данных из localStorage
const loadServices = () => {
    const saved = localStorage.getItem('autoService_services');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.tuning && Array.isArray(parsed.tuning)) servicesStore.tuning = parsed.tuning;
            if (parsed.oils && Array.isArray(parsed.oils)) servicesStore.oils = parsed.oils;
            if (parsed.services && Array.isArray(parsed.services)) servicesStore.services = parsed.services;
        } catch(e) { console.error('Ошибка загрузки:', e); }
    }
    
    // Данные по умолчанию (с ценами и скидками)
    if (servicesStore.tuning.length === 0) {
        servicesStore.tuning = [
            { id: 1, name: 'Чип-тюнинг двигателя', oldPrice: 25000, price: 15000, days: 1, popular: true },
            { id: 2, name: 'Установка обвеса', oldPrice: 35000, price: 25000, days: 3, popular: false },
            { id: 3, name: 'Перепрошивка ЭБУ', oldPrice: 12000, price: 8000, days: 1, popular: true },
            { id: 4, name: 'Замена выхлопной системы', oldPrice: 30000, price: 20000, days: 2, popular: false }
        ];
    }
    
    if (servicesStore.oils.length === 0) {
        servicesStore.oils = [
            { id: 5, name: 'Замена масла двигателя', oldPrice: 4000, price: 2500, popular: true },
            { id: 6, name: 'Замена масла в АКПП', oldPrice: 5500, price: 3500, popular: true },
            { id: 7, name: 'Замена масла в раздатке', oldPrice: 3500, price: 2000, popular: false },
            { id: 8, name: 'Замена масла в редукторе', oldPrice: 3500, price: 2000, popular: false },
            { id: 9, name: 'Замена масляного фильтра', oldPrice: 1500, price: 800, popular: true },
            { id: 10, name: 'Замена воздушного фильтра', oldPrice: 1200, price: 600, popular: false },
            { id: 11, name: 'Замена салонного фильтра', oldPrice: 1000, price: 500, popular: false }
        ];
    }
    
    if (servicesStore.services.length === 0) {
        servicesStore.services = [
            { id: 12, name: 'Шиномонтаж', oldPrice: 1000, price: 600, popular: true },
            { id: 13, name: 'Ремонт двигателя', oldPrice: 25000, price: 15000, popular: false },
            { id: 14, name: 'Ремонт подвески', oldPrice: 15000, price: 8000, popular: true },
            { id: 15, name: 'Компьютерная диагностика', oldPrice: 2500, price: 1500, popular: true },
            { id: 16, name: 'Регулировка фар', oldPrice: 1500, price: 800, popular: false },
            { id: 17, name: 'Замена ремня ГРМ', oldPrice: 8000, price: 5000, popular: false },
            { id: 18, name: 'Развал-схождение', oldPrice: 3500, price: 2000, popular: true }
        ];
    }
    
    saveServices();
};

const saveServices = () => {
    localStorage.setItem('autoService_services', JSON.stringify(servicesStore));
    // Отправляем событие для обновления страниц сайта
    window.dispatchEvent(new CustomEvent('servicesUpdated'));
};

// Функция для получения услуг (используется страницами сайта)
export const getServices = (type) => {
    loadServices();
    return [...servicesStore[type]];
};

const escapeHtml = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

const showMessage = (message, isError = false) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isError ? '#ff7675' : '#00b894'};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 10001;
        font-size: 0.9rem;
        animation: fadeIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    notification.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
};

// Хеширование пароля
const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const PASSWORD_HASH = '04445e6487736590d1ef50186b414e737e0164683cbbec64e00e73c000fd3bef';

// Форма входа
const renderLoginForm = (onSuccess) => {
    const oldModal = document.getElementById('adminLoginModal');
    if (oldModal) oldModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'adminLoginModal';
    
    modal.innerHTML = `
        <div class="modal-content admin-login-modal">
            <div class="modal-header">
                <h2><i class="fas fa-shield-alt"></i> Вход в админ-панель</h2>
                <button class="close-modal" id="closeLoginModal">✕</button>
            </div>
            <div class="admin-login-form">
                <div class="form-row">
                    <label><i class="fas fa-lock"></i> Пароль администратора</label>
                    <input type="password" id="adminPassword" class="password-input" placeholder="Введите пароль" autocomplete="off">
                </div>
                <div id="loginError" class="login-error"></div>
                <div class="modal-buttons" style="margin-top: 1.5rem;">
                    <button class="btn" id="submitLoginBtn" style="width: 100%;">
                        <i class="fas fa-sign-in-alt"></i> Войти
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    const passwordInput = modal.querySelector('#adminPassword');
    const submitBtn = modal.querySelector('#submitLoginBtn');
    const errorDiv = modal.querySelector('#loginError');
    const closeBtn = modal.querySelector('#closeLoginModal');
    
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    };
    
    const attemptLogin = async () => {
        const password = passwordInput.value;
        if (!password) {
            errorDiv.textContent = 'Введите пароль';
            errorDiv.style.display = 'block';
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Проверка...';
        
        const hashed = await hashPassword(password);
        
        if (hashed === PASSWORD_HASH) {
            closeModal();
            sessionStorage.setItem('admin_authenticated', 'true');
            onSuccess();
        } else {
            errorDiv.textContent = 'Неверный пароль';
            errorDiv.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
    };
    
    submitBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    passwordInput.focus();
};

// Основная админ-панель
const renderAdminDashboard = (store) => {
    loadServices();
    
    const existingModal = document.getElementById('adminDashboard');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'adminDashboard';
    
    let currentTab = 'tuning';
    let searchTerm = '';
    
    const refreshSitePages = () => {
        const currentPage = window.location.hash.slice(1) || 'home';
        // Отправляем событие для обновления страниц
        window.dispatchEvent(new CustomEvent('servicesUpdated'));
    };
    
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    };
    
    const calculateDiscount = (oldPrice, price) => {
        if (!oldPrice || oldPrice <= 0) return 0;
        return Math.round(((oldPrice - price) / oldPrice) * 100);
    };
    
    const renderContent = () => {
        const services = servicesStore[currentTab];
        let filtered = services;
        if (searchTerm) {
            filtered = services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        
        const stats = {
            total: services.length,
            revenue: services.reduce((sum, s) => sum + (s.price || 0), 0),
            oldRevenue: services.reduce((sum, s) => sum + (s.oldPrice || s.price || 0), 0),
            popular: services.filter(s => s.popular).length,
            avg: services.length > 0 ? Math.round(services.reduce((sum, s) => sum + (s.price || 0), 0) / services.length) : 0
        };
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1100px; width: 95%;">
                <div class="modal-header">
                    <h2><i class="fas fa-shield-alt"></i> Админ-панель управления услугами</h2>
                    <button class="close-modal" id="closeAdminBtn">✕</button>
                </div>
                
                <div class="admin-stats">
                    <div class="stat-card"><h3>📊 Всего услуг</h3><div class="stat-number">${stats.total}</div></div>
                    <div class="stat-card"><h3>💰 Выручка со скидкой</h3><div class="stat-number">${stats.revenue.toLocaleString()} ₽</div><small style="opacity:0.7;">Было: ${stats.oldRevenue.toLocaleString()} ₽</small></div>
                    <div class="stat-card"><h3>⭐ Популярные</h3><div class="stat-number">${stats.popular}</div></div>
                    <div class="stat-card"><h3>📈 Средняя цена</h3><div class="stat-number">${stats.avg.toLocaleString()} ₽</div></div>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
                    <button class="tab-btn ${currentTab === 'tuning' ? 'btn' : 'btn-outline'}" data-tab="tuning">🏎️ Тюнинг (${servicesStore.tuning.length})</button>
                    <button class="tab-btn ${currentTab === 'oils' ? 'btn' : 'btn-outline'}" data-tab="oils">🛢️ Замена масел (${servicesStore.oils.length})</button>
                    <button class="tab-btn ${currentTab === 'services' ? 'btn' : 'btn-outline'}" data-tab="services">🔧 Другие услуги (${servicesStore.services.length})</button>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <input type="text" id="searchInput" placeholder="🔍 Поиск..." value="${escapeHtml(searchTerm)}" style="flex: 1; padding: 8px 12px; border-radius: 12px; border: var(--glass-border); background: var(--bg-primary);">
                    <button class="btn" id="addServiceBtn" style="background: var(--success);"><i class="fas fa-plus"></i> Добавить</button>
                    <button class="btn-outline" id="logoutAdminBtn"><i class="fas fa-sign-out-alt"></i> Выйти</button>
                </div>
                
                <div class="admin-table">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="position: sticky; top: 0; background: var(--bg-secondary);">
                            <tr style="border-bottom: 2px solid var(--accent);">
                                <th style="padding: 12px; text-align: left;">Название</th>
                                <th style="padding: 12px; text-align: left;">Было</th>
                                <th style="padding: 12px; text-align: left;">Стало</th>
                                <th style="padding: 12px; text-align: left;">Скидка</th>
                                ${currentTab === 'tuning' ? '<th style="padding: 12px; text-align: left;">Срок</th>' : ''}
                                <th style="padding: 12px; text-align: center;">Популярное</th>
                                <th style="padding: 12px; text-align: center;">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(service => {
                                const discount = calculateDiscount(service.oldPrice, service.price);
                                return `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <td style="padding: 12px;"><strong>${escapeHtml(service.name)}</strong></td>
                                    <td style="padding: 12px; text-decoration: line-through; opacity:0.7;">${(service.oldPrice || service.price).toLocaleString()} ₽</td>
                                    <td style="padding: 12px; color: var(--accent); font-weight: 600;">${service.price.toLocaleString()} ₽</td>
                                    <td style="padding: 12px;"><span style="background: var(--accent); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem;">-${discount}%</span></td>
                                    ${currentTab === 'tuning' ? `<td style="padding: 12px;"><i class="fas fa-calendar"></i> ${service.days || 1} дн.</td>` : ''}
                                    <td style="padding: 12px; text-align: center;">
                                        <input type="checkbox" class="popular-checkbox" data-id="${service.id}" ${service.popular ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <button class="edit-btn" data-id="${service.id}"><i class="fas fa-edit"></i> Изменить</button>
                                        <button class="delete-btn" data-id="${service.id}"><i class="fas fa-trash"></i> Удалить</button>
                                    </td>
                                </tr>
                            `}).join('')}
                            ${filtered.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:40px;">Нет услуг. Нажмите "Добавить"</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Поиск
        const searchInput = modal.querySelector('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                renderContent();
            });
        }
        
        // Вкладки
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentTab = btn.dataset.tab;
                searchTerm = '';
                renderContent();
            });
        });
        
        // Популярность
        modal.querySelectorAll('.popular-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                const id = parseInt(cb.dataset.id);
                const service = servicesStore[currentTab].find(s => s.id === id);
                if (service) {
                    service.popular = cb.checked;
                    saveServices();
                    refreshSitePages();
                    showMessage(service.popular ? '✅ Отмечено как популярное' : '⭐ Популярность снята');
                    renderContent();
                }
            });
        });
        
        // Редактирование
        modal.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const service = servicesStore[currentTab].find(s => s.id === id);
                if (service) {
                    const newName = prompt('✏️ Введите новое название:', service.name);
                    if (newName && newName.trim()) {
                        const newPrice = parseInt(prompt('💰 Введите новую цену со скидкой (₽):', service.price));
                        if (newPrice && newPrice > 0) {
                            const newOldPrice = parseInt(prompt('📈 Введите старую цену (было, ₽):', service.oldPrice || service.price));
                            service.name = newName.trim();
                            service.price = newPrice;
                            service.oldPrice = newOldPrice || newPrice;
                            if (currentTab === 'tuning') {
                                const newDays = parseInt(prompt('📅 Введите новый срок (дни):', service.days || 1));
                                if (newDays && newDays > 0) service.days = newDays;
                            }
                            saveServices();
                            refreshSitePages();
                            renderContent();
                            showMessage('✅ Услуга обновлена');
                        } else {
                            showMessage('❌ Неверная цена', true);
                        }
                    }
                }
            });
        });
        
        // Удаление
        modal.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const service = servicesStore[currentTab].find(s => s.id === id);
                if (service && confirm(`Удалить услугу "${service.name}"?`)) {
                    servicesStore[currentTab] = servicesStore[currentTab].filter(s => s.id !== id);
                    saveServices();
                    refreshSitePages();
                    renderContent();
                    showMessage('🗑️ Услуга удалена');
                }
            });
        });
        
        // Добавление
        const addBtn = modal.querySelector('#addServiceBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const name = prompt('📝 Введите название услуги:');
                if (!name) return;
                const price = parseInt(prompt('💰 Введите цену со скидкой (₽):'));
                if (!price || price <= 0) {
                    showMessage('❌ Неверная цена', true);
                    return;
                }
                const oldPrice = parseInt(prompt('📈 Введите старую цену (было, ₽):', Math.round(price * 1.3))) || price;
                
                const newService = {
                    id: Date.now(),
                    name: name,
                    price: price,
                    oldPrice: oldPrice,
                    popular: false
                };
                if (currentTab === 'tuning') {
                    const days = parseInt(prompt('📅 Введите срок выполнения (дни):')) || 1;
                    newService.days = days;
                }
                servicesStore[currentTab].push(newService);
                saveServices();
                refreshSitePages();
                renderContent();
                showMessage(`✅ "${name}" добавлена`);
            });
        }
        
        // Выход
        const logoutBtn = modal.querySelector('#logoutAdminBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('admin_authenticated');
                closeModal();
                showMessage('👋 Выход из админ-панели');
            });
        }
        
        // Закрытие
        const closeBtn = modal.querySelector('#closeAdminBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    };
    
    renderContent();
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
};

export const showAdminPanel = (store) => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    
    if (isAuth) {
        renderAdminDashboard(store);
    } else {
        renderLoginForm(() => {
            renderAdminDashboard(store);
        });
    }
};