import { LightningElement, api } from 'lwc';
import * as testUtil from "securemoduletest/testUtil";

export default class SecureComponent extends LightningElement {
    @api
    apiProperty = { win: window, el: document.createElement('div') };

    @api
    apiMethod(data) {
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', data.win.toString(), 'Expected "data.win" to be lockerized!');
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', data.el.toString(), 'Expected "data.el" to be lockerized!');
        return { win: window, el: document.createElement('div') };
    }
}
