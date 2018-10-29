import { LightningElement, api } from "lwc";
import * as testUtils from "securemoduletest/testUtil";

const childComponentTagName = "SECUREOTHERNAMESPACE-SECURE-TEMPLATE-COMPONENT";

export default class SecureTemplateComponent extends LightningElement {
    @api
    testHost() {
        const host = this.template.host;
        testUtils.assertEquals(childComponentTagName, host.tagName);
        testUtils.assertEquals('SecureObject: [object HTMLElement]{ key: {"namespace":"secureothernamespace"} }', host.toString(), 'Expected a SecureObject: [object HTMLElement].');
        testUtils.assertEquals('', host.innerText, 'Expected "innerText" to be an empty string.');
    }
}
