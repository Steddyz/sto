/**
 * Экранирует HTML для защиты от XSS
 * @param {string} str - Входная строка
 * @returns {string} Безопасная строка
 */
export const escapeHtml = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

/**
 * Валидирует данные заказа
 * @param {Object} orderData - Данные заказа
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateOrder = (orderData) => {
    const errors = [];
    
    if (!orderData.serviceName || orderData.serviceName.trim() === '') {
        errors.push('Выберите услугу');
    }
    
    if (!orderData.quantity || orderData.quantity < 1) {
        errors.push('Укажите корректное количество (минимум 1)');
    }
    
    if (!orderData.carData || !orderData.carData.brand || orderData.carData.brand.trim() === '') {
        errors.push('Укажите марку автомобиля');
    }
    
    if (!orderData.carData.model || orderData.carData.model.trim() === '') {
        errors.push('Укажите модель автомобиля');
    }
    
    if (!orderData.carData.year || orderData.carData.year.trim() === '') {
        errors.push('Укажите год выпуска');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Валидирует данные автомобиля
 * @param {Object} carData - Данные авто
 * @returns {boolean}
 */
export const validateCarData = (carData) => {
    return carData && 
           carData.brand && 
           carData.brand.trim() !== '' &&
           carData.model && 
           carData.model.trim() !== '' &&
           carData.year && 
           carData.year.trim() !== '';
};