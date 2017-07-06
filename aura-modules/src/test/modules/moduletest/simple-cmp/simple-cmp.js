import { Element } from "engine";
import { const1 } from "moduleTest:testLib"; // eslint-disable-line no-unused-vars
import { log } from "util.js"; // eslint-disable-line no-unused-vars

export default class Simple extends Element {
    @api literal = "Default literal";
    @api bound = "Default bound";
    @api unbound = "Default unbound";
    @api expression = 'Default expression';
    @api callbackaction;
    @api nested = "Default nested";
    @api date;

    static publicMethods = ['test'];

    handleFireAction() {
        if (this.callbackaction) {
            this.callbackaction({ something: 'true' });
        }
    }

    handlePressEvent() {
        const event = new CustomEvent('press', {
            bubbles: true,
            cancelable: true,
            detail: { value: 'test!' }
        });

        this.dispatchEvent(event);
    }

    test() {
        window.console.log('Test method!');
    }
}
