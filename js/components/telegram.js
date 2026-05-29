import { escapeHtml } from './validation.js';

/**
 * Обфусцированный юзернейм Telegram
 * Разбит на части для защиты от парсинга
 */
const getTelegramUsername = () => {
    const parts = ['auto', 'moto', 'r_tech', '2026'];
    const separator = '_';
    const username = parts[0] + separator + parts[1] + separator + parts[2] + separator + parts[3];
    return username;
};

/**
 * Формирует ссылку для Telegram
 * @param {Object} orderData - Данные заказа
 * @returns {string} Ссылка на Telegram
 */
export const buildTelegramLink = (orderData) => {
    const username = getTelegramUsername();
    const message = orderData.message || '';
    const encodedMessage = encodeURIComponent(message);
    return `https://t.me/${username}?text=${encodedMessage}`;
};

/**
 * Открывает чат Telegram с предзаполненным сообщением
 * @param {Object} orderData - Данные заказа
 * @param {Event} event - Событие для проверки isTrusted
 */
export const openTelegramChat = (orderData, event) => {
    // Защита: проверка isTrusted
    if (!event || !event.isTrusted) {
        console.warn('Несанкционированный вызов');
        return false;
    }
    
    const link = buildTelegramLink(orderData);
    window.open(link, '_blank');
    return true;
};

/**
 * Создает сообщение для заказа
 * @param {string} serviceName - Название услуги
 * @param {number} price - Цена
 * @param {number} quantity - Количество
 * @param {Object} carData - Данные автомобиля
 * @returns {string}
 */
export const buildOrderMessage = (serviceName, price, quantity, carData) => {
    const escapedService = escapeHtml(serviceName);
    const escapedBrand = escapeHtml(carData.brand || 'не указана');
    const escapedModel = escapeHtml(carData.model || 'не указана');
    const escapedYear = escapeHtml(carData.year || 'не указан');
    
    return `Здравствуйте! Хочу заказать: ${escapedService} — ${price} ₽. Количество: ${quantity}. Автомобиль: ${escapedBrand} ${escapedModel} (${escapedYear})`;
};