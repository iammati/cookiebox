import './HTMLElement';
import Cookies from 'js-cookie';

export default class Cookiebox {
    public DEBUG_MODE: boolean = false;
    public PREFIX: string = 'Cookiebox »';
    protected ACCEPT_ALL: string = 'cookiebox__button--all';
    protected ACCEPT_SELECTION: string = 'cookiebox__button--selection';
    private cookiebox: HTMLDivElement = document.querySelector('body > .cookiebox');
    private sourceFilters: string[] = [];

    /**
     * @public
     * @function init
     * @description Initialization of the whole cookiebox which includes:
     *  - show more population of description + subcookies
     *  - handling of CTAs (call-to-action buttons).
     * @returns {void}
     */
    public init(): void {
        if (!this.cookiebox) {
            console.error(`${this.PREFIX} Cookiebox not found!`);

            if (window['COOKIEBOX_NOT_ENABLED'] === true) {
                console.warn(`${this.PREFIX} Cookiebox is disabled.`);
            }

            return;
        }

        this.showMore();
        this.checkboxes();
        this.buttons();
        this.triggerOpenButtons();

        const cookiebox = Cookies.get('cookiebox');

        if (cookiebox === undefined) {
            this.show();
        } else {
            this.iterateSourceFiltersStack(cookiebox);
        }
    }

    /**
     * @public
     * @function show
     * @param {string} highlight Optional. If provided, it'll (visually) highlight.
     *  Note that the highlight represents the identifier (HTML attribute `id`) of an input checkbox.
     * @description Shows the cookiebox visually in the frontend.
     * @returns {Cookiebox}
     */
    public show(highlight: string = ''): this {
        !this.cookiebox.classList.contains('show') && 
            this.cookiebox.classList.add('show');

        let cookies = Cookies.get('cookiebox');
        if (cookies !== undefined) {
            cookies = cookies.split(',');
            
            for (const cookie of cookies) {
                const input: HTMLInputElement = this.cookiebox.querySelector(`input#cookiebox__${cookie}`);
                input.checked = true;
                input.setAttribute('checked', 'checked');
            }
        }

        if (highlight !== '') {
            const input = this.cookiebox.querySelector(`#cookiebox__${highlight}`) as HTMLInputElement;

            if (this.DEBUG_MODE) {
                this.log('highlight input');
                console.log(input);
            }

            const wrap = input.parents('.wrap');
            const showmore = wrap.parents('.wrap').querySelector('.showmore') as HTMLDivElement;

            showmore.dispatchEvent(
                new Event('click', { bubbles: true, cancelable: false })
            );

            !wrap.classList.contains('highlight') && 
                wrap.classList.add('highlight')
            ;
        }

        return this;
    }

    /**
     * @public
     * @function hide
     * @description Hides the cookiebox visually in the frontend and removes all highlights as well.
     * @returns {Cookiebox}
     */
    public hide(): this {
        this.cookiebox.classList.contains('show') && 
            this.cookiebox.classList.remove('show');

        const highlights: NodeListOf<HTMLDivElement> = this.cookiebox.querySelectorAll('.highlight');
        for (const highlight of highlights) {
            highlight.classList.remove('highlight');

            const wrap = highlight.parents('.wrap');
            const subcookies = wrap.querySelector('.subcookies');
            const description = wrap.querySelector('.description');

            wrap.querySelector('.showmore').removeAttribute('style');
            wrap.classList.contains('active') && wrap.classList.remove('active');

            subcookies.classList.contains('active') && subcookies.classList.remove('active');
            description.classList.contains('active') && description.classList.remove('active');
        }

        return this;
    }

    /**
     * @public
     * @function addSourceFilter
     * @description So called source-filter are e.g. YouTube, Google-Maps/-Analytics etc.
     *  which own 3 properties.
     *  - The first is the `cookieName` which should be self-
     *  explaining.
     *  - The second `cookieExist` is a function-callback, which will be
     *  triggered automatically if the Cookiebox finds a cookie equaling the name
     *  of `cookieName` inside your own source-filter.
     *  - The third `cookieDoesNotExist` is also a function-callback which will be
     *  triggered automatically if the Cookiebox cannot find a cookie equal the name
     *  of your custom `cookieName` inside your source-filter class.
     * @returns {void}
     */
    public addSourceFilter(...filter) {
        this.sourceFilters.push(...filter);
    }

    /**
     * @private
     * @function showMore
     * @description Show more label population via click-event, which
     *  shows the description and subcookies of a specific cookie.
     * @returns {void}
     */
    private showMore(): void {
        const showmores = this.cookiebox.querySelectorAll('.cookies .showmore') as NodeListOf<HTMLDivElement>;

        for (const node of showmores) {
            node.addEventListener('click', e => {
                const target = e.target as HTMLDivElement;
                target.parentElement.classList.add('active');

                for (const key of [
                    'description',
                    'subcookies',
                ]) {
                    target.parentElement.querySelector(`.${key}`).classList.add('active');
                }

                target.style.display = 'none';
            });
        }
    }

    /**
     * @private
     * @function checkboxes
     * @description Opt-in logic handling is built-in this function.
     *  It covers when selecting the parent-input's child (sub input checkboxes)
     *  in case a parent-input is checked, all its sub inputs will be checked as well.
     *  If only 1 out of more than 1 sub inputs is checked, the parent input won't be checked.
     * @returns {void}
     */
    private checkboxes() {
        const cookies = this.cookiebox.querySelectorAll('.cookies .cookie');
        const subcookiesWraps = this.cookiebox.querySelectorAll('.subcookies .wrap');

        for (const cookie of cookies) {
            cookie.querySelector('input').addEventListener('change', e => {
                const target = e.target as HTMLInputElement;
                const { checked } = target;
                const wrap = target.parents('.wrap');

                for (const input of wrap.querySelectorAll('input') as NodeListOf<HTMLInputElement>) {
                    if (input.getAttribute('id') === target.getAttribute('id')) {
                        continue;
                    }

                    input.checked = checked;
                    checked ? input.setAttribute('checked', 'checked') : (input.hasAttribute('checked') && 
                        input.removeAttribute('checked')
                    );
                }
            });
        }

        for (const subcookie of subcookiesWraps) {
            subcookie.querySelector('input').addEventListener('change', e => {
                const target = e.target as HTMLInputElement;
                const parent = target.parents('.subcookies');
                let allChecked = true;

                for (const input of parent.querySelectorAll('input')) {
                    if (!input.checked) {
                        allChecked = false;
                        break;
                    }
                }

                const parentInput: HTMLInputElement = parent.parentElement.querySelector('.switch input');
                parentInput.checked = allChecked;
                allChecked ? parentInput.setAttribute('checked', 'checked') : (parentInput.hasAttribute('checked') &&
                    parentInput.removeAttribute('checked')
                );
            });
        }
    }

    /**
     * @private
     * @function buttons
     * @description Handling of the checked boxes / opt-in all checkboxes via accept-all button.
     *  The buttons function also covers the creation of a 1-year cookie
     *  which is called "cookiebox". This cookie holds the necessary information about allowed cookies.
     * @returns {void}
     */
    private buttons() {
        const buttons = this.cookiebox.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;

        for (const button of buttons) {
            button.addEventListener('click', e => {
                const target = e.target as HTMLButtonElement;
                const { id } = target;
                let cookies = '';

                if (id === this.ACCEPT_ALL) {
                    const inputs = this.cookiebox.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

                    for (const [i, input] of inputs.entries()) {
                        const { id } = input;
                        input.checked = true;
                        input.setAttribute('checked', 'checked');
                        cookies += id.replace('cookiebox__', '') + (i !== inputs.length - 1 ? ',' : '');
                    }
                }

                if (id === this.ACCEPT_SELECTION) {
                    const inputs = this.cookiebox.querySelectorAll('input:checked') as NodeListOf<HTMLInputElement>;

                    for (const [i, input] of inputs.entries()) {
                        const { id } = input;
                        cookies += id.replace('cookiebox__', '') + (i !== inputs.length - 1 ? ',' : '');
                    }
                }

                Cookies.set('cookiebox', cookies, {
                    expires: 365,
                });

                this.iterateSourceFiltersStack(cookies);
                this.hide();
            });
        }
    }

    /**
     * @private
     * @function triggerOpenButtons
     * @description Buttons with the following scheme `button.cookiebox__button--open`
     *  will automatically listen to a click-event, handled by Cookiebox, and opens
     *  the Cookiebox. If an `data-identifier` attribute has been defined - where its
     *  value equals the name of a cookie-identifier (e.g. `google-maps` or `youtube`) -
     *  it will highlight that inside the Cookiebox itself as well.
     * @returns {void}
     */
    private triggerOpenButtons() {
        const buttons: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.cookiebox__button--open');

        for (const button of buttons) {
            button.addEventListener('click', e => {
                const target = e.target as HTMLButtonElement;
                const identifier = target.hasAttribute('data-identifier') ?
                    target.getAttribute('data-identifier') :
                    ''
                ;

                if (this.DEBUG_MODE && identifier.length > 0) {
                    this.log(`triggerOpenButtons identifier: ${identifier}`);
                }

                this.show(identifier);
            });
        }
    }

    /**
     * @private
     * @function iterateSourceFiltersStack
     * @param {string} cookies
     * @description Internal function to iterate through available source-filters
     *  to block/allow resources such as iframes, third-party-scripts etc. being loaded.
     * @returns {void}
     */
    private iterateSourceFiltersStack(cookies: string) {
        if (this.DEBUG_MODE) {
            this.log(`Cookiebox » Detected sourceFilters: `, this.sourceFilters);
        }

        this.sourceFilters.forEach((filter: CookieSource) => {
            if (this.exists(filter.cookieName)) {
                if (this.DEBUG_MODE) {
                    this.log(`"${filter.cookieName}"-cookie enabled`);
                }

                filter.cookieExist();
            } else {
                if (this.DEBUG_MODE) {
                    this.log(`"${filter.cookieName}"-cookie disabled`);
                }

                filter.cookieDoesNotExist();
            }
        });
    }

    private log(message: string) {
        console.info(`${this.PREFIX} ${message}`);
    }

    public exists(name: string, cookiebox: string = ''): boolean {
        if (cookiebox.length === 0) {
            cookiebox = Cookies.get('cookiebox');
        }

        if (cookiebox === undefined) {
            return;
        }

        return cookiebox.split(',').includes(name);
    }
}
