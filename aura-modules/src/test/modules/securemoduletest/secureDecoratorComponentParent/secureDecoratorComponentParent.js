import { LightningElement, api } from 'lwc';
import * as testUtil from "securemoduletest/testUtil";

export default class SecureDecoratorComponentParent extends LightningElement {
    @api
    apiProperty = { win: window, el: document.createElement('div') };

    @api
    apiMethod(data) {
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', data.win.toString(), 'Expected "data.win" to be lockerized!');
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', data.el.toString(), 'Expected "data.el" to be lockerized!');
        return { win: window, el: document.createElement('div') };
    }

    @api
    testTrackPropertiesCannotBeAccessedViaCustomElement() {
        const child = this.template.querySelector('securemoduletest-secure-decorator-component');
        testUtil.assertEquals(undefined, child.dataObject, 'Expected child @track property to be "undefined"');
        // ERROR: "eslint-lwc" - The '__proto__' property is deprecated.
        // testUtil.assertEquals(undefined, child.__proto__.dataObject, 'Expected child @track property cannot be accessed by climbing up the prototype chain.');
    }

    @api
    testWirePropertiesCannotBeAccessedViaCustomElement() {
        const child = this.template.querySelector('securemoduletest-secure-decorator-component');
        testUtil.assertEquals(undefined, child.state, 'Expected child @wire property to be "undefined"');
        // ERROR: "eslint-lwc" - The '__proto__' property is deprecated.
        // testUtil.assertEquals(undefined, child.__proto__.state, 'Expected child @wire property cannot be accessed by climbing up the prototype chain.');
    }
}
