import { LightningElement, api } from "lwc";

export default class SimpleInput extends LightningElement {
    @api
    get value() {
        return this.template.querySelector('input').value;
    }

    set value(value) {
        this.template.querySelector('input').value = value;
    }

    @api
    get validity() {
        return this.value;
    }

    @api
    get inputValidity() {
        return this.template.querySelector('input').validity;
    }
}

SimpleInput.interopMap = {
    exposeNativeEvent: {
        change: true,
    },
};
