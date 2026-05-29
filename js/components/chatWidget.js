import { openTelegramChat, buildOrderMessage } from './telegram.js';

/**
 * Рендерит виджет живого чата
 * @param {Object} store - Хранилище
 * @returns {HTMLElement}
 */
export const renderChatWidget = (store) => {
    const widget = document.createElement('div');
    widget.className = 'chat-widget';
    
    widget.innerHTML = `
        <button class="chat-button" id="chatToggleBtn">
            <i class="fas fa-comment-dots"></i>
        </button>
        <div class="chat-popup" id="chatPopup">
            <h4>Живой чат</h4>
            <p>Напишите нам в Telegram для быстрой связи</p>
            <button class="btn" id="quickTelegramBtn" style="width: 100%; margin-top: 10px;">
                <i class="fab fa-telegram"></i> Написать в Telegram
            </button>
            <button id="closeChatBtn" style="margin-top: 10px; background: none; border: none; cursor: pointer; color: var(--text-primary);">
                <i class="fas fa-times"></i> Закрыть
            </button>
        </div>
    `;
    
    const toggleBtn = widget.querySelector('#chatToggleBtn');
    const popup = widget.querySelector('#chatPopup');
    const closeBtn = widget.querySelector('#closeChatBtn');
    const telegramBtn = widget.querySelector('#quickTelegramBtn');
    
    toggleBtn.addEventListener('click', () => {
        popup.classList.toggle('active');
    });
    
    closeBtn.addEventListener('click', () => {
        popup.classList.remove('active');
    });
    
    telegramBtn.addEventListener('click', (e) => {
        const carData = store.getState().carData;
        const message = buildOrderMessage('Консультация', 0, 1, carData);
        openTelegramChat({ message }, e);
    });
    
    return widget;
};