import { LightningElement, api } from "lwc";
import url from "@test/testImage"; // Somewhere a custom resolver needs to be registered

export default class Marker extends LightningElement {
    get schemaResolved() {
        return url;
    }

    @api
    getSchemaTestResource() {
        return url;
    }
}
