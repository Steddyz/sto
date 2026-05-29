/**
 * Создает хранилище состояния через замыкание
 * @returns {Object} API хранилища
 */
export const createStore = () => {
    // Состояние приложения (замкнуто)
    let state = {
        theme: 'dark',
        cart: [],
        carData: {
            brand: '',
            model: '',
            year: ''
        }
    };
    
    // Подписчики на изменения
    let listeners = [];
    
    // Получение состояния
    const getState = () => {
        return { ...state };
    };
    
    // Обновление состояния
    const setState = (newState) => {
        state = { ...state, ...newState };
        // Уведомляем всех подписчиков
        listeners.forEach(listener => listener(state));
    };
    
    // Подписка на изменения
    const subscribe = (listener) => {
        listeners.push(listener);
        // Возвращаем функцию отписки
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    };
    
    // Методы для работы с корзиной/заказами
    const addToOrder = (item) => {
        const currentCart = [...state.cart];
        currentCart.push(item);
        setState({ cart: currentCart });
    };
    
    const updateCarData = (data) => {
        setState({ carData: { ...state.carData, ...data } });
    };
    
    return {
        getState,
        setState,
        subscribe,
        addToOrder,
        updateCarData
    };
};