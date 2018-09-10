import { LightningElement, api } from "lwc";

export default class LockerizedCmp extends LightningElement {
    @api
    divide(a, b) {
        return a / b;
    }
}
