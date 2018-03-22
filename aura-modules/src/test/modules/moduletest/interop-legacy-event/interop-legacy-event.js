import { Element, api, unwrap } from "engine";

export default class InteropLegacyEvent extends Element {
    @api
    focus() {
        this.root.querySelector('#trigger-click').focus();
    }

    handleButtonFocus(event) {
        let detail = {};

        if (this.getAttribute('data-aura-rendered-by')) {
            detail._originalEvent = unwrap(event);
        }

        const customEvent = new CustomEvent('focus', { detail });
        this.dispatchEvent(customEvent);
    }
}

InteropLegacyEvent.interopMap = {
    exposeNativeEvent: {
        'click': true,
        'focus': true
    }
};

