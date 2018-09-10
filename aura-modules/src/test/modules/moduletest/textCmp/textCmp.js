import { LightningElement, api } from "lwc";
import { dep } from "moduletest/classDep"; // eslint-disable-line no-unused-vars

export default class Text extends LightningElement {
    @api text;
    
}
