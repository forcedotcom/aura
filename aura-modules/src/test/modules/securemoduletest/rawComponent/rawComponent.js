import { LightningElement, api } from "lwc";

export default class RawComponent extends LightningElement {
    @api
    getInstanceProperties() {
        let properties = new Set();
        for (let o = this; o !== null; o = Object.getPrototypeOf(o)) {
          Object.getOwnPropertyNames(o).forEach(properties.add.bind(properties));
        }
        return Array.from(properties);
    }

    @api
    getTemplateProperties() {
        let properties = new Set();
        for (let o = this.template; o !== null; o = Object.getPrototypeOf(o)) {
          Object.getOwnPropertyNames(o).forEach(properties.add.bind(properties));
        }
        return Array.from(properties);
    }
}
