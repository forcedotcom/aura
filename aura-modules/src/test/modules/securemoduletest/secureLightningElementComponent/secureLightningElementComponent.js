import { LightningElement, api} from 'lwc';
import * as testUtils from 'securemoduletest/testUtil';

export default class SecureLightningElementComponent extends LightningElement {
    @api
    testLightningElementChildQuerySelector() {
        testUtils.assertNull(this.querySelector('DIV'), "[Child] Expected SecureLightningElement.querySelector() in child to not return LWC nodes!");
        testUtils.assertEquals('SecureElement: [object HTMLSpanElement]{ key: {"namespace":"secureModuleTest"} }', this.querySelector('SPAN').toString(), "[Child] Expected SecureLightningElement.querySelector() in child to return slotted LWC nodes!");
    }

    @api
    testLightningElementChildQuerySelectorAll() {
        testUtils.assertEquals(0, this.querySelectorAll('DIV').length, "[Child] Expected SecureLightningElement.querySelectorAll() in child to not return LWC nodes!");
        testUtils.assertEquals(1, this.querySelectorAll('SPAN').length, "[Child] Expected SecureLightningElement.querySelectorAll() in child to return slotted LWC nodes!");
    }

    @api
    testLightningElementChildGetElementsByClassName() {
        testUtils.assertEquals(0, this.getElementsByClassName('testChildClass').length, "[Child] Expected SecureLightningElement.getElementsByClassName() in child to not return LWC nodes!");
        testUtils.assertEquals(1, this.getElementsByClassName('testSlotClass').length, "[Child] Expected SecureLightningElement.getElementsByClassName() in child to return slotted LWC nodes!");
    }

    @api
    testLightningElementChildGetElementsByTagName() {
        testUtils.assertEquals(0, this.getElementsByTagName('DIV').length, "[Child] Expected SecureLightningElement.getElementsByTagName() in child to not return LWC nodes!");
        testUtils.assertEquals(1, this.getElementsByTagName('SPAN').length, "[Child] Expected SecureLightningElement.getElementsByTagName() in child to return slotted LWC nodes!");
    }
}
