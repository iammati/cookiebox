export default class GoogleAnalytics implements CookieSource {
    private GA_MEASUREMENT_ID = 'INSERT HERE YOUR GA_MEASUREMENT_ID';
    cookieName: string = 'google-analytics';

    cookieExist: Function = () => {
    };

    cookieDoesNotExist: Function = () => {
        window[`ga-disable-${this.GA_MEASUREMENT_ID}`] = true;
    };
}
