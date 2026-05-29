// Проверка авторизации
const loginTime = sessionStorage.getItem('admin_login_time');
if (sessionStorage.getItem('admin_logged_in') !== 'true' || !loginTime || (Date.now() - parseInt(loginTime)) > 3600000) {
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_login_time');
    window.location.href = 'admin-login.html';
}

import { loadData, saveData, addService, updateService, deleteService } from './db.js';

let servicesStore = {
    tuning: [],
    oils: [],
    services: []
};

let currentTab = 'tuning';
let searchTerm = '';

// Загрузка данных
const loadServices = async () => {
    servicesStore = await loadData();
    renderAdminPage();
};

// Сохранение и обновление
const saveAndRefresh = () => {
    saveData(servicesStore);
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
        right: 20px;
        background: ${isError ? '#ff7675' : '#00b894'};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        z-index: 10001;
        font-size: 0.9rem;
        animation: fadeIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    notification.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
};

const calculateDiscount = (oldPrice, price) => {
    if (!oldPrice || oldPrice <= 0) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
};

// Модальное окно подтверждения удаления
const showConfirmModal = (message, onConfirm) => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-modal-overlay';
    overlay.innerHTML = `
        <div class="confirm-modal">
            <div class="confirm-modal-icon">
                <i class="fas fa-trash-alt"></i>
            </div>
            <h3>Подтверждение удаления</h3>
            <p>${escapeHtml(message)}</p>
            <div class="confirm-modal-buttons">
                <button class="confirm-btn-yes" id="confirmYes">
                    <i class="fas fa-check"></i> Да, удалить
                </button>
                <button class="confirm-btn-no" id="confirmNo">
                    <i class="fas fa-times"></i> Отмена
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
    
    const yesBtn = overlay.querySelector('#confirmYes');
    const noBtn = overlay.querySelector('#confirmNo');
    
    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };
    
    yesBtn.addEventListener('click', () => {
        closeModal();
        onConfirm();
    });
    
    noBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
};

// Модальное окно добавления
const openAddModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-window">
            <div class="modal-close-btn" id="modalCloseBtn">
                <i class="fas fa-times"></i>
            </div>
            <div class="modal-icon">
                <i class="fas fa-plus-circle"></i>
            </div>
            <h2>Добавить новую услугу</h2>
            
            <div class="modal-form">
                <div class="form-group-modal">
                    <label><i class="fas fa-tag"></i> Название услуги <span class="required">*</span></label>
                    <input type="text" id="modalName" placeholder="Например: Чип-тюнинг двигателя">
                </div>
                
                <div class="form-row-modal">
                    <div class="form-group-modal half">
                        <label><i class="fas fa-ruble-sign"></i> Цена со скидкой <span class="required">*</span></label>
                        <input type="number" id="modalPrice" placeholder="15000">
                    </div>
                    <div class="form-group-modal half">
                        <label><i class="fas fa-percent"></i> Скидка (%) <span class="optional">(необязательно)</span></label>
                        <input type="number" id="modalDiscount" placeholder="40">
                    </div>
                </div>
                
                ${currentTab === 'tuning' ? `
                <div class="form-group-modal">
                    <label><i class="fas fa-calendar-alt"></i> Срок выполнения (дни)</label>
                    <input type="number" id="modalDays" placeholder="1" value="1">
                </div>
                ` : ''}
                
                <div class="form-group-modal checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="modalPopular">
                        <span class="checkbox-custom"></span>
                        <span><i class="fas fa-star"></i> Отметить как популярную услугу</span>
                    </label>
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="btn-modal btn-save" id="modalSaveBtn">
                    <i class="fas fa-save"></i> Добавить услугу
                </button>
                <button class="btn-modal btn-cancel" id="modalCancelBtn">
                    <i class="fas fa-times"></i> Отмена
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    const saveBtn = modal.querySelector('#modalSaveBtn');
    const cancelBtn = modal.querySelector('#modalCancelBtn');
    const closeBtn = modal.querySelector('#modalCloseBtn');
    
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    };
    
    saveBtn.addEventListener('click', async () => {
        const name = modal.querySelector('#modalName').value.trim();
        let price = parseInt(modal.querySelector('#modalPrice').value);
        const discountPercent = parseInt(modal.querySelector('#modalDiscount').value);
        
        if (!name) {
            showMessage('Введите название услуги', true);
            return;
        }
        if (!price || price <= 0) {
            showMessage('Введите корректную цену', true);
            return;
        }
        
        let oldPrice = null;
        let finalPrice = price;
        
        if (discountPercent && discountPercent > 0 && discountPercent < 100) {
            oldPrice = Math.round(price * 100 / (100 - discountPercent));
            finalPrice = price;
        }
        
        const newService = {
            name: name,
            price: finalPrice,
            oldPrice: oldPrice,
            popular: modal.querySelector('#modalPopular')?.checked || false
        };
        
        if (currentTab === 'tuning') {
            const days = parseInt(modal.querySelector('#modalDays').value);
            newService.days = days || 1;
        }
        
        await addService(currentTab, newService);
        showMessage(`✅ "${name}" добавлена`);
        await loadServices();
        closeModal();
    });
    
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
};

// Модальное окно редактирования
const openEditModal = (service) => {
    const hasDiscount = service.oldPrice && service.oldPrice > service.price;
    const discountPercent = hasDiscount ? Math.round(((service.oldPrice - service.price) / service.oldPrice) * 100) : '';
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-window">
            <div class="modal-close-btn" id="modalCloseBtn">
                <i class="fas fa-times"></i>
            </div>
            <div class="modal-icon edit-icon">
                <i class="fas fa-pen"></i>
            </div>
            <h2>Редактировать услугу</h2>
            
            <div class="modal-form">
                <div class="form-group-modal">
                    <label><i class="fas fa-tag"></i> Название услуги <span class="required">*</span></label>
                    <input type="text" id="modalName" value="${escapeHtml(service.name)}">
                </div>
                
                <div class="form-row-modal">
                    <div class="form-group-modal half">
                        <label><i class="fas fa-ruble-sign"></i> Цена со скидкой <span class="required">*</span></label>
                        <input type="number" id="modalPrice" value="${service.price}">
                    </div>
                    <div class="form-group-modal half">
                        <label><i class="fas fa-percent"></i> Скидка (%) <span class="optional">(необязательно)</span></label>
                        <input type="number" id="modalDiscount" placeholder="40" value="${discountPercent}">
                    </div>
                </div>
                
                ${currentTab === 'tuning' ? `
                <div class="form-group-modal">
                    <label><i class="fas fa-calendar-alt"></i> Срок выполнения (дни)</label>
                    <input type="number" id="modalDays" value="${service.days || 1}">
                </div>
                ` : ''}
                
                <div class="form-group-modal checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="modalPopular" ${service.popular ? 'checked' : ''}>
                        <span class="checkbox-custom"></span>
                        <span><i class="fas fa-star"></i> Популярная услуга</span>
                    </label>
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="btn-modal btn-save" id="modalSaveBtn">
                    <i class="fas fa-save"></i> Сохранить изменения
                </button>
                <button class="btn-modal btn-cancel" id="modalCancelBtn">
                    <i class="fas fa-times"></i> Отмена
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    const saveBtn = modal.querySelector('#modalSaveBtn');
    const cancelBtn = modal.querySelector('#modalCancelBtn');
    const closeBtn = modal.querySelector('#modalCloseBtn');
    
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    };
    
    saveBtn.addEventListener('click', async () => {
        const name = modal.querySelector('#modalName').value.trim();
        let price = parseInt(modal.querySelector('#modalPrice').value);
        const discountPercent = parseInt(modal.querySelector('#modalDiscount').value);
        
        if (!name) {
            showMessage('Введите название', true);
            return;
        }
        if (!price || price <= 0) {
            showMessage('Введите цену', true);
            return;
        }
        
        let oldPrice = null;
        let finalPrice = price;
        
        if (discountPercent && discountPercent > 0 && discountPercent < 100) {
            oldPrice = Math.round(price * 100 / (100 - discountPercent));
            finalPrice = price;
        }
        
        const updatedData = {
            name: name,
            price: finalPrice,
            oldPrice: oldPrice,
            popular: modal.querySelector('#modalPopular')?.checked || false
        };
        
        if (currentTab === 'tuning') {
            const days = parseInt(modal.querySelector('#modalDays').value);
            updatedData.days = days || 1;
        }
        
        await updateService(currentTab, service.id, updatedData);
        showMessage(`✅ "${name}" обновлена`);
        await loadServices();
        closeModal();
    });
    
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
};

// Основной рендер админки
const renderAdminPage = () => {
    const container = document.getElementById('adminContent');
    if (!container) return;
    
    const services = servicesStore[currentTab] || [];
    let filtered = services;
    if (searchTerm) {
        filtered = services.filter(s => s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    const stats = {
        total: services.length,
        revenue: services.reduce((sum, s) => sum + (s.price || 0), 0),
        oldRevenue: services.reduce((sum, s) => sum + (s.oldPrice || s.price || 0), 0),
        popular: services.filter(s => s.popular).length,
        avg: services.length > 0 ? Math.round(services.reduce((sum, s) => sum + (s.price || 0), 0) / services.length) : 0
    };
    
    container.innerHTML = `
        <div class="admin-stats">
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <h3>Всего услуг</h3>
                <div class="stat-number">${stats.total}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <h3>Выручка со скидкой</h3>
                <div class="stat-number">${stats.revenue.toLocaleString()} ₽</div>
                <small>Было: ${stats.oldRevenue.toLocaleString()} ₽</small>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <h3>Популярные</h3>
                <div class="stat-number">${stats.popular}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📈</div>
                <h3>Средняя цена</h3>
                <div class="stat-number">${stats.avg.toLocaleString()} ₽</div>
            </div>
        </div>
        
        <div class="admin-tabs-container">
            <button class="tab-btn ${currentTab === 'tuning' ? 'active' : ''}" data-tab="tuning">
                <i class="fas fa-tachometer-alt"></i> Тюнинг <span class="tab-count">${servicesStore.tuning?.length || 0}</span>
            </button>
            <button class="tab-btn ${currentTab === 'oils' ? 'active' : ''}" data-tab="oils">
                <i class="fas fa-oil-can"></i> Замена масел <span class="tab-count">${servicesStore.oils?.length || 0}</span>
            </button>
            <button class="tab-btn ${currentTab === 'services' ? 'active' : ''}" data-tab="services">
                <i class="fas fa-wrench"></i> Другие услуги <span class="tab-count">${servicesStore.services?.length || 0}</span>
            </button>
        </div>
        
        <div class="admin-controls">
            <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="searchInput" class="search-input" placeholder="Поиск по названию..." value="${escapeHtml(searchTerm)}">
            </div>
            <button class="btn-add" id="addServiceBtn">
                <i class="fas fa-plus"></i> Добавить услугу
            </button>
        </div>
        
        <div class="admin-table-wrapper">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Было</th>
                        <th>Стало</th>
                        <th>Скидка</th>
                        ${currentTab === 'tuning' ? '<th>Срок</th>' : ''}
                        <th>Популярное</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(service => {
                        const hasDiscount = service.oldPrice && service.oldPrice > service.price;
                        const discount = hasDiscount ? Math.round(((service.oldPrice - service.price) / service.oldPrice) * 100) : 0;
                        return `
                        <tr class="service-row">
                            <td data-label="ID">#${service.id}</td>
                            <td data-label="Название"><strong>${escapeHtml(service.name)}</strong></td>
                            <td data-label="Было" class="${hasDiscount ? 'old-price-cell' : ''}">
                                ${hasDiscount ? `<span class="old-price-value">${service.oldPrice.toLocaleString()} ₽</span>` : '—'}
                            </td>
                            <td data-label="Стало" class="price-cell">${service.price.toLocaleString()} ₽</td>
                            <td data-label="Скидка" class="discount-cell">
                                ${hasDiscount ? `<span class="discount-badge-admin">-${discount}%</span>` : '<span class="no-discount">—</span>'}
                            </td>
                            ${currentTab === 'tuning' ? `<td data-label="Срок"><i class="fas fa-calendar-alt"></i> ${service.days || 1} дн.</td>` : ''}
                            <td data-label="Популярное" class="popular-cell">
                                <label class="switch">
                                    <input type="checkbox" class="popular-checkbox" data-id="${service.id}" ${service.popular ? 'checked' : ''}>
                                    <span class="slider round"></span>
                                </label>
                            </td>
                            <td data-label="Действия" class="actions-cell">
                                <button class="action-btn edit-btn" data-id="${service.id}" title="Редактировать">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete-btn" data-id="${service.id}" title="Удалить">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    `}).join('')}
                    ${filtered.length === 0 ? `
                        <tr class="empty-row">
                            <td colspan="7">
                                <div class="empty-state">
                                    <i class="fas fa-box-open"></i>
                                    <p>Нет услуг в этой категории</p>
                                    <button class="btn-add-small" id="emptyAddBtn">➕ Добавить первую услугу</button>
                                </div>
                            </td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
    `;
    
    // Поиск
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderAdminPage();
    });
    
    // Вкладки
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTab = btn.dataset.tab;
            searchTerm = '';
            renderAdminPage();
        });
    });
    
    // Популярность (switch)
    document.querySelectorAll('.popular-checkbox').forEach(cb => {
        cb.addEventListener('change', async () => {
            const id = parseInt(cb.dataset.id);
            const service = servicesStore[currentTab].find(s => s.id === id);
            if (service) {
                service.popular = cb.checked;
                saveAndRefresh();
                showMessage(service.popular ? '⭐ Отмечено как популярное' : '⭐ Популярность снята');
                renderAdminPage();
            }
        });
    });
    
    // Редактирование
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const service = servicesStore[currentTab].find(s => s.id === id);
            if (service) openEditModal(service);
        });
    });
    
    // Удаление с модальным окном
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = parseInt(btn.dataset.id);
            const service = servicesStore[currentTab].find(s => s.id === id);
            if (service) {
                showConfirmModal(`Удалить услугу "${service.name}"? Это действие нельзя отменить.`, async () => {
                    await deleteService(currentTab, id);
                    showMessage(`🗑️ "${service.name}" удалена`);
                    await loadServices();
                });
            }
        });
    });
    
    // Добавление
    document.getElementById('addServiceBtn')?.addEventListener('click', () => openAddModal());
    document.getElementById('emptyAddBtn')?.addEventListener('click', () => openAddModal());
};

// Выход
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.clear();
    window.location.href = 'index.html';
});

// Запуск
loadServices();