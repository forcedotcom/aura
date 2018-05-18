import { Element, api } from "engine";

export default class SimpleInput extends Element {
    @api
    get value() {
        return this.root.querySelector('input').value;
    }

    @api
    set value(value) {
        this.root.querySelector('input').value = value;
    }

    @api
    get validity() {
        return this.value;
    }

    @api
    get inputValidity() {
        return this.root.querySelector('input').validity;
    }
}

SimpleInput.interopMap = {
    exposeNativeEvent: {
        change: true,
    },
};
