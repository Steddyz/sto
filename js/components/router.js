import { showLoader, hideLoader } from './loader.js';
import { renderHomePage } from '../pages/home.js';
import { renderTuningPage } from '../pages/tuning.js';
import { renderOilsPage } from '../pages/oils.js';
import { renderServicesPage } from '../pages/services.js';
import { renderContactsPage } from '../pages/contacts.js';

const routes = {
    home: renderHomePage,
    tuning: renderTuningPage,
    oils: renderOilsPage,
    services: renderServicesPage,
    contacts: renderContactsPage
};

export const initRouter = (store) => {
    const contentContainer = document.getElementById('page-content');
    
    const handleRoute = async () => {
        showLoader();
        
        let route = window.location.hash.slice(1) || 'home';
        
        // ЕСЛИ ЭТО СЕКРЕТНЫЙ АДМИН-РОУТ - НЕ ТРОГАЕМ ЕГО
        if (route === 'admin2026') {
            hideLoader();
            return;  // Выходим, не трогаем админку
        }
        
        const renderFn = routes[route];
        if (!renderFn) {
            route = 'home';
            window.location.hash = 'home';
        }
        
        const pageContent = await routes[route](store);
        
        contentContainer.innerHTML = '';
        contentContainer.appendChild(pageContent);
        contentContainer.classList.add('page-transition');
        
        setTimeout(() => {
            contentContainer.classList.remove('page-transition');
            hideLoader();
        }, 300);
    };
    
    const navigate = (route) => {
        window.location.hash = route;
    };
    
    window.addEventListener('hashchange', handleRoute);
    
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('[data-route]');
        if (link) {
            e.preventDefault();
            const route = link.dataset.route;
            navigate(route);
        }
    });
    
    handleRoute();
    
    return { navigate };
};