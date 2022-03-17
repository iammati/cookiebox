interface CookieSource {
    cookieName: string;
    cookieExist: Function;
    cookieDoesNotExist: Function;
}
