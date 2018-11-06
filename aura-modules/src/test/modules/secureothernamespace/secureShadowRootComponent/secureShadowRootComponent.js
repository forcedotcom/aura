import { LightningElement, api } from "lwc";
import * as testUtils from "securemoduletest/testUtil";

export default class SecureShadowRootComponent extends LightningElement {
    @api
    testTemplateHost() {
        const host = this.template.host;
        // NOTE: "this.template.host" returns an opaque object because it belongs to the template of cross namespace parent.
        testUtils.assertEquals(undefined, host.tagName, 'Expected "tagName" to be undefined.');
        testUtils.assertEquals('SecureObject: [object HTMLElement]{ key: {"namespace":"secureothernamespace"} }', host.toString(), 'Expected a SecureObject: [object HTMLElement].');
        testUtils.assertEquals(undefined, host.innerText, 'Expected "innerText" to be undefined.');
        return host;
    }

    @api
    testShadowRoot() {
        testUtils.assertEquals(null, this.shadowRoot, 'Expected "this.shadowRoot" property to be "null"');
    }
}
