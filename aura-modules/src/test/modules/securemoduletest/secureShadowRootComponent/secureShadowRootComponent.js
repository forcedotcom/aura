import { LightningElement, api } from "lwc";
import * as testUtils from "securemoduletest/testUtil";

export default class SecureShadowRootComponent extends LightningElement {
    @api
    testTemplateHost() {
        const host = this.template.host;
        testUtils.assertEquals('SECUREMODULETEST-SECURE-SHADOW-ROOT-COMPONENT', host.tagName, 'Expected "tagName" to be "SECUREMODULETEST-SECURE-SHADOW-ROOT-COMPONENT".');
        testUtils.assertEquals('SecureElement: [object HTMLElement]{ key: {"namespace":"secureModuleTest"} }', host.toString(), 'Expected a SecureElement: [object HTMLElement].');
        testUtils.assertEquals('', host.innerText, 'Expected "innerText" to be an empty string.');
        return host;
    }

    @api
    testShadowRoot() {
        testUtils.assertEquals(null, this.shadowRoot, 'Expected "this.shadowRoot" property to be "null"');
    }
}
