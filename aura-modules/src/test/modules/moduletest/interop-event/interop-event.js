import { Element } from "engine";

export default class InteropEvent extends Element {
    @api removeCallback;
    @api clickHandler;
    @track removePrevented = '';

    handleClick() {
        const customEvent = new CustomEvent('remove', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: { ids: [113] }
        });

        this.dispatchEvent(customEvent);

        if (customEvent.defaultPrevented) {
            this.removePrevented = 'true';
        }
    }

    handleRemoveWithCallback(evt) {
        this.removeCallback({ domEvent: evt });
    }

    handleClickWithCallback(evt) {
        this.clickHandler({ domEvent: evt });
    }
}
