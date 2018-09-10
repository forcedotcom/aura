import { LightningElement, api } from "lwc";

export default class BidirectionalPrimitive extends LightningElement {
    @api primitive;

    connectedCallback() {
        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            composed: true,
            detail : { primitive: 'changedValue' }
        }));
    }
}
