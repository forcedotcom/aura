import { LightningElement, api } from "lwc";
import { dep } from 'moduletest-class-dep'; // eslint-disable-line no-unused-vars

export default class Text extends LightningElement {
    @api text;
    
}
