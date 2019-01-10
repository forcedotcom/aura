import { LightningElement } from "lwc";

export default class Child extends LightningElement {
    renderedCallback() {
        const div = this.template.querySelector('.lwc-firing');
        div.dispatchEvent(new CustomEvent('lwc-event-foo', { bubbles: true, composed: true }));
    }
}