import { api, LightningElement } from "lwc";

export default class EventHandlerTests extends LightningElement {
    @api value;

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

    handleValueChange() {
        this.dispatchEvent(
            new CustomEvent('change', {
                bubbles: true,
                composed: true,
                detail: {
                    value: "new",
                },
            })
        );
    }
}
