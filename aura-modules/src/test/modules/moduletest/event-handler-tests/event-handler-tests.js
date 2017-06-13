import { Element } from "engine";

export default class EventHandlerTests extends Element {

    handleSomething() {
        const event = new CustomEvent('something', { detail: { somethingName: 'salesforce.com' }});
        this.dispatchEvent(event);
    }
}
