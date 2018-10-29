import { LightningElement, api } from "lwc";
import * as testUtils from "securemoduletest/testUtil";

const childComponentTagName = "SECUREMODULETEST-SECURE-TEMPLATE-COMPONENT";

export default class SecureTemplateComponent extends LightningElement {
    @api
    testHost() {
        const host = this.template.host;
        testUtils.assertEquals(childComponentTagName, host.tagName);
        testUtils.assertEquals('SecureElement: [object HTMLElement]{ key: {"namespace":"secureModuleTest"} }', host.toString(), 'Expected a SecureElement: [object HTMLElement].');
        testUtils.assertEquals('', host.innerText, 'Expected "innerText" to be an empty string.');
    }
}
