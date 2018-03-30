import { Element, api, track } from "engine";

export default class InteropEvent extends Element {
    @api value;
    @api detailsAsProxy;
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

	handleDispatchEventWithDetailsClick() {
        const evtName = this.detailsAsProxy ? 'eventtwithdetailsasproxy' : 'eventtwithdetails';
        const detail = this.detailsAsProxy ? this.value :  { v: this.value, };

        const evt = new CustomEvent(evtName, {
            composed: false,
            bubbles: false,
            detail,
		});

		this.dispatchEvent(evt);
	}
}
