import './Cookiebox.scss';
import Cookiebox from './Cookiebox';

export const initCookiebox = (filters: CookieSource[], debugMode: boolean = false) => {
    window.addEventListener('load', e => {
        const cookiebox = new Cookiebox();
        cookiebox.DEBUG_MODE = debugMode;

        cookiebox.addSourceFilter(filters);
        cookiebox.init();
    });
};
