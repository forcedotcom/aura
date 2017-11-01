import { Element } from "engine";
// eslint-disable-next-line no-unused-vars, raptor/no-aura-libs
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

    static publicMethods = ['test'];

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
            detail    : { value: 'test!' }
        });

        this.dispatchEvent(event);
    }

    handleThrowError() {
        throw new Error('boom!');
    }

    test() {
        return 'Test method!';
    }

    handleClick() {
        this.state.accessorValue = 'modified-accessor-value';

        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            detail : {
                myAccessor: this.myAccessor
            }
        }));
    }
}
