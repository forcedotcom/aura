import { LightningElement, api } from "lwc";

export default class RadioInput extends LightningElement {
    _checked = false;

    @api
    get checked() {
        return this._checked;
    }

    set checked(value) {
        this._checked = value;
    }

    handleChange() {
        this._checked = this.template.querySelector('input').checked;
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