import { LightningElement, api } from 'lwc';
import * as testUtil from 'securemoduletest/testUtil';
import defaultFunction from 'securemoduletest/defaultModuleNonLockerizedExports';

export default class DefaultImportLockerizedFromSameNamespaceExportNonLockerized extends LightningElement {
    @api NAME = 'DefaultImportLockerizedFromSameNamespaceExportNonLockerized { NS: "securemoduletest" }';
    @api COMPONENT = 'Lockerized! [Import]';

    @api
    testDefault() {
        let iterator = defaultFunction();

        let firstYield = iterator.next();
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', firstYield.value.toString());
        testUtil.assertFalse(firstYield.done);

        let secondYield = iterator.next();
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', secondYield.value.toString());
        testUtil.assertFalse(secondYield.done);

        let thirdYield = iterator.next();
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', thirdYield.value.toString());
        testUtil.assertFalse(thirdYield.done);

        let finalReturn = iterator.next();
        testUtil.assertEquals('Default!', finalReturn.value.toString());
        testUtil.assertTrue(finalReturn.done);
    }
}
