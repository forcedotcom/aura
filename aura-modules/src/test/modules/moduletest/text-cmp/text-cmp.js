import { Element, api } from 'engine';
import { dep } from 'moduletest-class-dep'; // eslint-disable-line no-unused-vars

export default class Text extends Element {
    @api text;
}
