![Npm package version](https://badgen.net/npm/v/@iammati/cookiebox)


# @iammati/cookiebox

## Features
- Resources won't load until you write a custom so-called Source
- Simple and yet fast, colors of the cookiebox is customizable
- Lightweight – Less than 2kb JavaScript and CSS!

Blocking resources is managed server-side – via PHP.

## Why another cookie library?

To list exactly what the core issues were you may take a look at the following:

- Static cached HTML files issue (see below for more)
- Lightweight
- [RFC 6265 - HTTP State Management Mechanism](https://datatracker.ietf.org/doc/html/rfc6265) compliant (thanks to js-cookie)
- No jQuery
- Modern compiler, optional TypeScript & ES6 support
- Extending is super simple

#### Static cached HTML files issue
**Imagine the following problem:**

- There are no caches on your web-server right now
- Client performs a HTTP request to your server (opening example.org) - has no cookies yet
- Server (depending on the CMS, framework etc.) builds an HTML and echo'd that output back to the client
- Also the server: caches the HTML response thinking it's only static content, nothing special
- Server doesn't know you serve iframes, scripts etc. which should be blocked since the user has not consent yet to get e.g. tracked, YouTube setting cookies etc.
- All other clients who request example.org receive the wrong-cached static HTML file now

**Solution:**

- Ship by default blocked third-party iframes/scripts etc. server-side
- Unblock them only client-side via JavaScript

## Installation

Install this package via `npm i @iammati/cookiebox`, `yarn add @iammati/cookiebox` or `pnpm add @iammati/cookiebox`. 

Once installed, you can add it via an import statement as in:
```ts
import * as Cookiebox from '@iammati/cookiebox'
import YouTube from '@iammati/cookiebox/src/Sources/YouTube'
import GoogleMaps from '@iammati/cookiebox/src/Sources/GoogleMaps'

window.addEventListener('load', e => {
    Cookiebox.config(
        new YouTube(),
        new GoogleMaps(),
    ).init()
})
```

This will initialize the cookiebox with `YouTube` and `GoogleMaps` as so-called Sources.

### What is a Source
Sources are e.g. YouTube, Google Maps, Google Analytics, Meta Pixel, Hotjar, Etracker, Matomo etc.
So for each Source you need to write a corresponding Source-class, which could look like this:
```ts
export default class YouTube implements CookieSource {
    private iframes = document.getElementsByTagName('iframe');

    /**
     * The name of the cookie, which will also be saved inside the Cookie Storage of the browser.
     * Using kebabCase (see https://lodash.com/docs#kebabCase) is appropriate.
     */
    cookieName: string = 'youtube';

    /**
     * Callback function will be called, if the cookie with the name
     * of this class' cookieName property exists, it'll call this
     * function to handle the necessary logic.
     */
    cookieExist: Function = () => {
        for (const iframe of this.iframes) {
            const src = iframe.hasAttribute('src') ? iframe.getAttribute('src') : iframe.getAttribute('data-src');

            if (!src.includes('youtube.com/')) {
                continue;
            }

            !iframe.hasAttribute('src') && iframe.setAttribute('src', src);
            iframe.removeAttribute('data-src');
            !iframe.parentElement.classList.contains('allowed') &&
                iframe.parentElement.classList.add('allowed')
            ;
        }
    };

    /**
     * Callback function will be called if the cookie
     * does not exist inside the Cookie Storage of the browser aka.
     * the client has not yet accept that cookie.
     */
    cookieDoesNotExist: Function = () => {
        for (const iframe of this.iframes) {
            const src = iframe.hasAttribute('src') ? iframe.getAttribute('src') : iframe.getAttribute('data-src');
            if (!src.includes('youtube.com/')) {
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
```

## Adding your own Source

Depending on your compiler (you should be more than enough covered using webpack/vite) all you have to do is to create a new JavaScript class and instancing it inside the `Cookiebox.config` function, just like `YouTube` and `GoogleMaps` have been done.

```ts
export default class Test implements CookieSource {
    cookieName: string = 'test';

    cookieExist: Function = () => {
        console.log('My awesome test source cookieExist function has beel called!');
    };

    cookieDoesNotExist: Function = () => {
        console.warn('My awesome test source cookieDoesNotExist function has beel called!');
    };
}
```

Note: You can choice by yourself using TypeScript or JavaScript.

In case you project is not using TypeScript at all, simply remove the type-hints and the implementation of the `CookieSource` interface:
```ts
export default class Test {
    cookieName = 'test';

    cookieExist = () => {
        console.log('My awesome test source cookieExist function has beel called!');
    };

    cookieDoesNotExist = () => {
        console.warn('My awesome test source cookieDoesNotExist function has beel called!');
    };
}
```

Heading back to your main entrypoint of your project's JavaScript code (assuming it's called `index.js`):
```js
window.addEventListener('load', e => {
    Cookiebox.config(
        new YouTube(),
        new GoogleMaps(),
        new Test()
    ).init()
})
```

As you may noticed, you simply add just another class and you are good to go.

## Concepts
- Blocking third-party iframes/scripts is managed via PHP
- The cookie is set to a duration of 365 days
- Focus is the european [GDPR](https://gdpr.eu/)

## TODOs / Proofments
- Coverage of US cookie consent law (since there's no GDPR law atm?)

## Credits

This package was created by myself, for myself (and educational purpose).
Thanks, Mati
