import { Element, api } from "engine";

export default class LockerizedCmp extends Element {
    @api
    divide(a, b) {
        return a / b;
    }
}
