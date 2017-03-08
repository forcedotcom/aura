import { HTMLElement } from "engine";
import { module1, const1 } from "modules:testLib";

export default class Simple extends HTMLElement {
    constructor () {
        console.log('>>> const:', const1);
        super();
    }

    literal = "Default literal";
    bound = "Default bound";
    unbound = "Default unbound";
    expression = 'Default expression';
    callbackaction;

    static publicMethods = ['test'];

    handleFireAction (e) {
        if (this.callbackaction) {
            this.callbackaction({ something: 'true' });
        }
    }
    
    handlePressEvent (e) {
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

