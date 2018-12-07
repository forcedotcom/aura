import { LightningElement, api } from 'lwc';
import * as testUtil from 'securemoduletest/testUtil';
import defaultFunction from 'securemoduletest/defaultModuleLockerizedExports';

export default class DefaultImportNonLockerizedFromSameNamespaceExportLockerized extends LightningElement {
    @api NAME = 'DefaultImportNonLockerizedFromSameNamespaceExportLockerized { NS: "securemoduletest" }';
    @api COMPONENT = 'Non-Lockerized! [Import]';

    @api
    testDefault() {
        let iterator = defaultFunction();

        let firstYield = iterator.next();
        testUtil.assertEquals('[object Window]', firstYield.value.toString());
        testUtil.assertFalse(firstYield.done);

        let secondYield = iterator.next();
        testUtil.assertEquals('[object HTMLDocument]', secondYield.value.toString());
        testUtil.assertFalse(secondYield.done);

        let thirdYield = iterator.next();
        testUtil.assertEquals('[object HTMLDivElement]', thirdYield.value.toString());
        testUtil.assertFalse(thirdYield.done);

        let finalReturn = iterator.next();
        testUtil.assertEquals('Default!', finalReturn.value.toString());
        testUtil.assertTrue(finalReturn.done);
    }
}
