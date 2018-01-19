import { Element, api } from 'engine';

export default class BidirectionalPrimitive extends Element {
    @api primitive;

    connectedCallback() {
        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            composed: true,
            detail : { primitive: 'changedValue' }
        }));
    }
}
