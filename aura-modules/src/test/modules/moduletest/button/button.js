import { Element, api } from 'engine';

export default class Button extends Element {
    @api label;
    @api disabled = false;
}
