import './Cookiebox.scss';
import Cookiebox from './Cookiebox';

export const config = (...filters: CookieSource[]): Cookiebox => {
    const cookiebox = new Cookiebox();

    for (const filter of filters) {
        cookiebox.addSourceFilter(filter);
    }

    return cookiebox;
};
