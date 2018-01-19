import { Element, api } from "engine";

export default class RadioInput extends Element {
    _checked = false;

    @api
    get checked() {
        return this._checked;
    }

    @api
    set checked(value) {
        this._checked = value;
    }

    handleChange() {
        this._checked = this.root.querySelector('input').checked;
        const detail = {
            checked: this._checked
        };
        this.dispatchEvent(
            new CustomEvent('change', {
                composed: true,
                bubbles: true,
                detail,
            })
        );
    }
}

RadioInput.interopMap = {
    exposeNativeEvent: {
        change: true,
    },
};