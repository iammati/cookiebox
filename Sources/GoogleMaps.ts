export default class GoogleMaps implements CookieSource {
    private iframes = document.getElementsByTagName('iframe');

    cookieName: string = 'google-maps';

    cookieExist: Function = () => {
        for (const iframe of this.iframes) {
            const src = iframe.hasAttribute('src') ? iframe.getAttribute('src') : iframe.getAttribute('data-src');

            if (!src.includes('/maps/embed')) {
                continue;
            }

            !iframe.hasAttribute('src') && iframe.setAttribute('src', src);
            iframe.removeAttribute('data-src');
            !iframe.parentElement.classList.contains('allowed') &&
                iframe.parentElement.classList.add('allowed')
            ;
        }
    };

    cookieDoesNotExist: Function = () => {
        for (const iframe of this.iframes) {
            const src = iframe.hasAttribute('src') ? iframe.getAttribute('src') : iframe.getAttribute('data-src');

            if (!src.includes('/maps/embed')) {
                continue;
            }

            iframe.hasAttribute('src') && iframe.removeAttribute('src');
            iframe.setAttribute('data-src', src);
            iframe.parentElement.classList.contains('allowed') &&
                iframe.parentElement.classList.remove('allowed')
            ;
        }
    };
}
