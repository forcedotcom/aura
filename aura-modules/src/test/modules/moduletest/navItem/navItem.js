import { LightningElement, api } from "lwc";

const DEFAULT_HREF = 'javascript:void(0);'; // eslint-disable-line no-script-url

export default class NavItem extends LightningElement {
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