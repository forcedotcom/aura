import { Element } from 'engine';
export default class Composite extends Element {
    literal = "Default literal";
    bound = "Default bound";
    unbound = "Default unbound";
    expression = 'Default expression';
    callbackaction;

    constructor() {
        super();
        this.message = 'Test composite';
    }
}