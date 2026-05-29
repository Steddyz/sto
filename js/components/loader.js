/**
 * Показывает анимацию загрузки
 */
export const showLoader = () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.remove('hidden');
    }
};

/**
 * Скрывает анимацию загрузки
 */
export const hideLoader = () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('hidden');
    }
};