import { LightningElement, api } from "lwc";

export default class List extends LightningElement {
    @api items = [];

    get hasItems() {
        return !!(this.items && this.items.length);
    }
}
