import { LightningElement, api } from 'lwc';
import * as testUtils from 'securemoduletest/testUtil';

const lockerBlacklist = [
    'getElementsByTagName',
    'getElementsByClassName',
    'shadowRoot',
    'slot'
];

export default class SecureLightningElementComponentParent extends LightningElement {
    @api
    testLightningElementSyncWithLockerWrapper() {
        const child = this.template.querySelector('securemoduletest-raw-component');
        const rawProperties = child.getInstanceProperties();
        const secureChild = this.template.querySelector('securemoduletest-secure-component');
        const secureProperties = secureChild.getInstanceProperties();

        testUtils.assertProperties(rawProperties, secureProperties, lockerBlacklist);
    }

    @api
    testBlacklistedProperties() {
        const lightningElement = this;
        const blacklistedProperties = [
            'attachShadow', // NOT EXPOSED!
            'getElementsByTagName',
            'getElementsByClassName',
            'root', // DEPRECATED!
            'shadowRoot',
            'slot'
        ];

        for (let i = 0, n = blacklistedProperties.length; i < n; i++) {
            const blacklistedProperty = blacklistedProperties[i];
            if (blacklistedProperty in lightningElement) {
                testUtils.fail('Expected ' + blacklistedProperty + ' property of SecureLightningElement to be blacklisted.');
            } else {
                testUtils.assertUndefined(lightningElement[blacklistedProperty], 'Expected "' + blacklistedProperty + '" property of SecureLightningElement to be undefined!');
            }
        }
    }

    @api
    testLightningElementQuerySelector() {
        testUtils.assertNull(this.querySelector('DIV'), "[Parent] Expected SecureLightningElement.querySelector() in parent to not return LWC nodes!");

        const childElement = this.template.querySelector('.child-same-namespace');
        testUtils.assertNull(childElement.querySelector('DIV'), "[Parent] Expected childElement.querySelector() in child to not return LWC nodes!");
        testUtils.assertEquals('SecureElement: [object HTMLSpanElement]{ key: {"namespace":"secureModuleTest"} }', childElement.querySelector('SPAN').toString(), "[Parent] Expected childElement.querySelector() in child to return slotted LWC nodes!");

        childElement.testLightningElementChildQuerySelector();
    }

    @api
    testLightningElementQuerySelectorAll() {
        testUtils.assertEquals(0, this.querySelectorAll('DIV').length, "[Parent] Expected SecureLightningElement.querySelectorAll() in parent to not return LWC nodes!");

        const childElement = this.template.querySelector('.child-same-namespace');
        testUtils.assertEquals(0, childElement.querySelectorAll('DIV').length, "[Parent] Expected childElement.querySelectorAll() in child to not return LWC nodes!");
        testUtils.assertEquals(1, childElement.querySelectorAll('SPAN').length, "[Parent] Expected childElement.querySelectorAll() in child to return slotted LWC nodes!");
        
        childElement.testLightningElementChildQuerySelectorAll();
    }

    @api
    testLightningElementGetElementsByClassName() {
        testUtils.assertEquals(0, this.getElementsByClassName('testClass').length, "[Parent] Expected SecureLightningElement.getElementsByClassName() in parent to not return LWC nodes!");
        testUtils.assertEquals(0, this.getElementsByClassName('testChildClass').length, "[Parent] Expected SecureLightningElement.getElementsByClassName() in parent to not return LWC nodes!");

        const childElement = this.template.querySelector('.child-same-namespace');
        testUtils.assertEquals(0, childElement.getElementsByClassName('testChildClass').length, "[Child] Expected childElement.getElementsByClassName() in child to not return LWC nodes!");
        testUtils.assertEquals(1, childElement.getElementsByClassName('testSlotClass').length, "[Child] Expected childElement.getElementsByClassName() in child to return slotted LWC nodes!");

        childElement.testLightningElementChildGetElementsByClassName();
    }

    @api
    testLightningElementGetElementsByTagName() {
        testUtils.assertEquals(0, this.getElementsByTagName('DIV').length, "[Parent] Expected SecureLightningElement.getElementsByTagName() in parent to not return LWC nodes!");

        const childElement = this.template.querySelector('.child-same-namespace');
        testUtils.assertEquals(0, childElement.getElementsByTagName('DIV').length, "[Child] Expected childElement.getElementsByTagName() in child to not return LWC nodes!");
        testUtils.assertEquals(1, childElement.getElementsByTagName('SPAN').length, "[Child] Expected childElement.getElementsByTagName() in child to return slotted LWC nodes!");

        childElement.testLightningElementChildGetElementsByTagName();
    }
}
