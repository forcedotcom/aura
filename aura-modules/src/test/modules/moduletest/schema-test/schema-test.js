import { Element, api } from 'engine';
import url from "@test/testImage"; // Somewhere a custom resolver needs to be registered

export default class Marker extends Element {
    get schemaResolved() {
        return url;
    }

    @api
    getSchemaTestResource() {
        return url;
    }
}
