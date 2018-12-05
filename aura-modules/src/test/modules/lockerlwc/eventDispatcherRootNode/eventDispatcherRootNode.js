import { LightningElement, api } from 'lwc';

const COMPOSED_EVENT_NAME = 'composedevent';
const EVENT_NAME = 'customevent'

export default class EventDispatcherRootNode extends LightningElement {
    @api
    dispatchComposedEventOnChildNode() {
        const target = this.template.querySelector('.lockerlwc-rootnode-div');
        const event = new CustomEvent(COMPOSED_EVENT_NAME, { composed: true , bubbles: true });
        target.dispatchEvent(event);
    }

    @api
    dispatchEventOnSelf() {
        const event = new CustomEvent(EVENT_NAME, { bubbles: true});
        this.dispatchEvent(event);
    }
}