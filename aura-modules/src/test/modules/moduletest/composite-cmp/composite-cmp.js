import { Element, api } from 'engine';
export default class Composite extends Element {
    @api literal = "Default literal";
    @api bound = "Default bound";
    @api unbound = "Default unbound";
    @api expression = 'Default expression';
    @api callbackaction;

    constructor() {
        super();
        this.message = 'Test composite';
    }
}
