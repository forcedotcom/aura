import { Element } from "engine";
import { const1 } from "moduleTest:testLib";
import { log } from "util.js";

export default class Simple extends Element {
    constructor () {
        super();
        log('>>> const:', const1);
    }

    literal = "Default literal";
    bound = "Default bound";
    unbound = "Default unbound";
    expression = 'Default expression';
    callbackaction;

    static publicMethods = ['test'];

    handleFireAction () {
        if (this.callbackaction) {
            this.callbackaction({ something: 'true' });
        }
    }
    
    handlePressEvent () {
        const event = new CustomEvent('press', {
            bubbles: true,
            cancelable: true,
            detail: { value: 'test!' }
        });

        this.dispatchEvent(event);
    }

    test () {
        console.log('Test method!');
    }
}

