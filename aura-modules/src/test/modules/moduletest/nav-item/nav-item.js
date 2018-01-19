import { Element, api } from 'engine';

const DEFAULT_HREF = 'javascript:void(0);'; // eslint-disable-line no-script-url

export default class NavItem extends Element {
    @api href = DEFAULT_HREF;

    connectedCallback() {
        this.dispatchEvent(
            new CustomEvent('itemregister', {
                bubbles: true,
                cancelable: true,
                composed: true
            })
        );
    }
}