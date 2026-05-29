/**
 * Инициализирует тему из хранилища
 * @param {Object} store - Хранилище
 */
export const initTheme = (store) => {
    const theme = store.getState().theme;
    document.documentElement.setAttribute('data-theme', theme);
};

/**
 * Переключает тему
 * @param {Object} store - Хранилище
 */
export const toggleTheme = (store) => {
    const currentTheme = store.getState().theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    store.setState({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
};