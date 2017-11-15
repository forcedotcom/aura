import { Element } from "engine";

export default class EventHandlerTests extends Element {
    handleSomething() {
        const event = new CustomEvent('something', {
            detail: { somethingName: 'salesforce.com' },
            composed: true
        });
        this.dispatchEvent(event);
    }

    handleChange() {
        const event = new Event('change');
        this.dispatchEvent(event);
    }
}
