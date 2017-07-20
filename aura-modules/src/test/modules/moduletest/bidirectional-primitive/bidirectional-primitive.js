import { Element } from 'engine';

export default class BidirectionalPrimitive extends Element {
    @api primitive;

    connectedCallback() {
        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            detail : { primitive: 'changedValue' }
        }));
    }
}
