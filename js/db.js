// Ключ для localStorage
const STORAGE_KEY = 'autoService_services';

// Загрузка начальных данных из JSON файла
const loadInitialData = async () => {
    try {
        const response = await fetch('../db/services.json?t=' + Date.now());
        if (response.ok) {
            return await response.json();
        }
    } catch(e) {
        console.log('Не удалось загрузить JSON, используем данные по умолчанию');
    }
    
    // Данные по умолчанию
    return {
        tuning: [
            { id: 1, name: 'Чип-тюнинг двигателя', oldPrice: 25000, price: 15000, days: 1, popular: true },
            { id: 2, name: 'Установка обвеса', oldPrice: 35000, price: 25000, days: 3, popular: false },
            { id: 3, name: 'Перепрошивка ЭБУ', oldPrice: 12000, price: 8000, days: 1, popular: true },
            { id: 4, name: 'Замена выхлопной системы', oldPrice: 30000, price: 20000, days: 2, popular: false }
        ],
        oils: [
            { id: 5, name: 'Замена масла двигателя', oldPrice: 4000, price: 2500, popular: true },
            { id: 6, name: 'Замена масла в АКПП', oldPrice: 5500, price: 3500, popular: true },
            { id: 7, name: 'Замена масла в раздатке', oldPrice: 3500, price: 2000, popular: false },
            { id: 8, name: 'Замена масла в редукторе', oldPrice: 3500, price: 2000, popular: false },
            { id: 9, name: 'Замена масляного фильтра', oldPrice: 1500, price: 800, popular: true },
            { id: 10, name: 'Замена воздушного фильтра', oldPrice: 1200, price: 600, popular: false },
            { id: 11, name: 'Замена салонного фильтра', oldPrice: 1000, price: 500, popular: false }
        ],
        services: [
            { id: 12, name: 'Шиномонтаж', oldPrice: 1000, price: 600, popular: true },
            { id: 13, name: 'Ремонт двигателя', oldPrice: 25000, price: 15000, popular: false },
            { id: 14, name: 'Ремонт подвески', oldPrice: 15000, price: 8000, popular: true },
            { id: 15, name: 'Компьютерная диагностика', oldPrice: 2500, price: 1500, popular: true }
        ]
    };
};

// Загрузка данных (сначала из localStorage, если нет — из JSON)
export const loadData = async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {}
    }
    const initialData = await loadInitialData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
};

// Сохранение данных (только в localStorage)
export const saveData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('servicesUpdated'));
    return true;
};

// Получение услуг
export const getServices = async (type) => {
    const data = await loadData();
    return [...(data[type] || [])];
};

// Добавление услуги
export const addService = async (type, service) => {
    const data = await loadData();
    const maxId = Math.max(...data[type].map(s => s.id), 0);
    const newId = maxId + 1;
    const newService = { id: newId, ...service };
    data[type].push(newService);
    saveData(data);
    return newService;
};

// Обновление услуги
export const updateService = async (type, id, updatedData) => {
    const data = await loadData();
    const index = data[type].findIndex(s => s.id === id);
    if (index !== -1) {
        data[type][index] = { ...data[type][index], ...updatedData };
        saveData(data);
        return data[type][index];
    }
    return null;
};

// Удаление услуги
export const deleteService = async (type, id) => {
    const data = await loadData();
    data[type] = data[type].filter(s => s.id !== id);
    saveData(data);
    return true;
};