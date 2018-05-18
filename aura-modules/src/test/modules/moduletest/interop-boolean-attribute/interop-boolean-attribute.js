import { Element, api } from 'engine';

export default class InteropBooleanAttribute extends Element {
    @api get foo() {
        // Returns default value of boolean false
        return this._disabled || false;
    }
    @api set foo(value) {
        // Saves the raw value without doing any boolean normalization
        this._disabled = value;
    }
}
