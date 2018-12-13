import { LightningElement, api } from "lwc";
import * as testUtil from "securemoduletest/testUtil";

export default class crossComponentSource extends LightningElement {

    @api
    testGetElementByIDCrossComponentSameNamespace() {
        let elementFound = false;
        for (let i = 0; i < 10; i++) {
          if (document.getElementById(`same-namespace-target-${i}`) !== null) {
              elementFound = true;
              break;
          }
        }
        // Since document is patched to not allow access to shadow dom nodes
        testUtil.assertFalse(elementFound,
            "Expected no shadow dom element accessible from document.getElementById");
    }

    @api
    testGetElementByIDComponentOtherNamespace() {
        let elementFound = false;
        for (let i = 0; i < 10; i++) {
          if (document.getElementById(`other-namespace-target-${i}`) !== null) {
              elementFound = true;
              break;
          }
        }

        testUtil.assertFalse(elementFound,
            "Expected no cross-namespace dom element accessible from document.getElementById");
    }

    @api
    testGetElementByClassNameCrossComponentSameNamespace() {
        const elements = document.getElementsByClassName("same-namespace-target");
        // Since document is patched to not allow access to shadow dom nodes
        testUtil.assertEquals(0, elements.length,
            "Expected no shadow dom element accessible from document.getElementsByClassName");
    }

    @api
    testGetElementByClassNameComponentOtherNamespace() {
        const elements = document.getElementsByClassName("other-namespace-target");
        testUtil.assertEquals(0, elements.length,
            "Expected no cross-namespace element accessible from document.getElementsByClassName");
    }

    @api
    testQuerySelectorIDCrossComponentSameNamespace() {
        let count = 0;
        for (let i = 0; i < 10; i++) {
          if (document.querySelector(`#same-namespace-target-${i}`) !== null) {
              count++;
          }
        }

        // Since document is patched to not allow access to shadow dom nodes
        testUtil.assertEquals(0, count,
            "Expected no shadow dom element accessible from document.querySelector");
    }

    @api
    testQuerySelectorIDCrossComponentOtherNamespace() {
        let count = 0;
        for (let i = 0; i < 10; i++) {
            if (document.querySelector(`#other-namespace-target-${i}`) !== null) {
                count++;
            }
        }

        testUtil.assertEquals(0, count,
            "Expected no cross-namespace element accessible from document.querySelector");
    }

    @api
    testQuerySelectorClassCrossComponentSameNamespace() {
        const element = document.querySelector(".same-namespace-target");
        // Since document is patched to not allow access to shadow dom nodes
        testUtil.assertNull(element, "Expected no shadow dom element accessible from document.querySelector");
    }

    @api
    testQuerySelectorClassCrossComponentOtherNamespace() {
        const element = document.querySelector(".other-namespace-target");
        // Since document is patched to not allow access to shadow dom nodes
        testUtil.assertNull(element, "Expected no cross-namespace dom element accessible from document.querySelector");
    }

}