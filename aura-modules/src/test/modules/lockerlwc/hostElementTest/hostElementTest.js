import { LightningElement, api } from 'lwc';
import * as testUtils from "securemoduletest/testUtil";

export default class ComponentInstanceTester extends LightningElement {
    @api
    testInternalFieldsOnHostElement() {
        const internalFields = Object.getOwnPropertySymbols(this.template.host);
        testUtils.assertEquals(0, internalFields.length, 'Did not expect internal symbols to be exposed on host element');
    }
}
