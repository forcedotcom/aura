import { LightningElement, api } from "lwc";
import * as testUtils from "securemoduletest/testUtil";

const parentComponentTagName = "SECUREMODULETEST-SECURE-TEMPLATE-COMPONENT-PARENT";

export default class SecureTemplateComponentParent extends LightningElement {
    @api
    testHost() {
        const host = this.template.host;
        testUtils.assertEquals(parentComponentTagName, host.tagName, 'Expected tagName to be "SECUREMODULETEST-SECURE-TEMPLATE-COMPONENT-PARENT"');
        testUtils.assertEquals('SecureElement: [object HTMLElement]{ key: {"namespace":"secureModuleTest"} }', host.toString(), 'Expected a SecureElement: [object HTMLElement].');
        testUtils.assertEquals('', host.innerText, 'Expected "innerText" to be an empty string.');

        const child = this.template.querySelector('securemoduletest-secure-template-component');
        const childHost = child.host;
        testUtils.assertEquals(undefined, childHost);
        child.testHost();
    }

    @api
    testHostOtherNamespace() {
        const childOther = this.template.querySelector('secureothernamespace-secure-template-component');
        const childOtherHost = childOther.host;
        testUtils.assertEquals(undefined, childOtherHost);
        childOther.testHost();
    }
}
