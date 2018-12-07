import { LightningElement, api } from "lwc";
import * as testUtil from "securemoduletest/testUtil";

export default class crossComponentSource extends LightningElement {

    @api
    testGetElementByIDCrossComponentSameNamespace() {
        let count = 0;
        for (let i = 0; i < 10; i++) {
          const element = document.getElementById(`same-namespace-target-${i}`);
          if (element !== null) {
            count++;
          }
        }

        testUtil.assertEquals(1, count,
            "Expected one element returned");
    }

    @api
    testGetElementByIDComponentOtherNamespace() {
        let count = 0;
        for (let i = 0; i < 10; i++) {
          const element = document.getElementById(`other-namespace-target-${i}`);
          if (element !== null) {
            count++;
          }
        }

        testUtil.assertEquals(0, count,
            "Expected no element accessible");
    }

    @api
    testGetElementByClassNameCrossComponentSameNamespace() {
        const elements = document.getElementsByClassName("same-namespace-target");

        testUtil.assertEquals(1, elements.length,
            "Expected one element returned");
    }

    @api
    testGetElementByClassNameComponentOtherNamespace() {
        const elements = document.getElementsByClassName("other-namespace-target");

        testUtil.assertEquals(0, elements.length,
            "Expected no element accessible");
    }

    @api
    testQuerySelectorIDCrossComponentSameNamespace() {
        let count = 0;
        for (let i = 0; i < 10; i++) {
          const element = document.querySelector(`#same-namespace-target-${i}`);
          if (element !== null) {
            count++;
          }
        }

        testUtil.assertEquals(1, count,
            "Expected one element returned");
    }

    @api
    testQuerySelectorIDCrossComponentOtherNamespace() {
        let count = 0;
        for (let i = 0; i < 10; i++) {
          const element = document.querySelector(`#other-namespace-target-${i}`);
          if (element !== null) {
            count++;
          }
        }

        testUtil.assertEquals(0, count,
            "Expected no element accessible");
    }

    @api
    testQuerySelectorClassCrossComponentSameNamespace() {
        const element = document.querySelector(".same-namespace-target");

        testUtil.assertNotNull(element,
            "Expected one element returned");
    }

    @api
    testQuerySelectorClassCrossComponentOtherNamespace() {
        const element = document.querySelector(".other-namespace-target");

        testUtil.assertNull(element,
            "Expected no element accessible");
    }

}