import { Element, api, track } from "engine";
// eslint-disable-next-line no-unused-vars, lwc/no-aura-libs
import { const1 } from "moduleTest:testLib";
import { log } from "./util.js"; // eslint-disable-line no-unused-vars

export default class Simple extends Element {
    @api literal = "Default literal";
    @api bound = "Default bound";
    @api unbound = "Default unbound";
    @api expression = 'Default expression';
    @api callbackaction;
    @api nested = "Default nested";
    @api date;
    @track state = {
        accessorValue: 'accessor-test-value'
    };

    @api get myAccessor() {
        return this.state.accessorValue;
    }

    handleFireAction() {
        if (this.callbackaction) {
            this.callbackaction({ something: 'true' });
        }
    }

    handlePressEvent() {
        const event = new CustomEvent('press', {
            bubbles   : true,
            cancelable: true,
            composed: true,
            detail    : { value: 'test!' }
        });

        this.dispatchEvent(event);
    }

    handleThrowError() {
        throw new Error('boom!');
    }

    @api test() {
        return 'Test method!';
    }

    handleClick() {
        this.state.accessorValue = 'modified-accessor-value';

        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            composed: true,
            detail : {
                myAccessor: this.myAccessor
            }
        }));
    }

    @track _nullValueTest;

    @api
    get nullValueTest() {
        return this._nullValueTest;
    }

    @api
    set nullValueTest(value) {
        this._nullValueTest = value;
    }

    get hasValue() {
        return !!(
            this._nullValueTest
        );
    }

    get valueText() {
        return this._nullValueTest;
    }

    @track _proxyValue;
    @api
    proxyTest (value) {
        this._proxyValue = value;
        return this._proxyValue;
    }
}
