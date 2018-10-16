import { LightningElement, api } from "lwc";
import * as testUtils from "securemoduletest/testUtil";

export default class SecureTemplateTester extends LightningElement {
    @api
    testChildNodes() {
      const childNodes = this.template.childNodes;
      testUtils.assertEquals(true, childNodes instanceof Array);
      testUtils.assertEquals(3, childNodes.length);

      for (let i = 0; i < childNodes.length; i++) {
        testUtils.assertEquals(true, childNodes[i] instanceof Node);
      }

      testUtils.assertTrue(childNodes[0].className === 'div-in-parent');
      testUtils.assertTrue(childNodes[1].className === 'span-in-parent');
      testUtils.assertTrue(childNodes[2].className === 'parentsecure');
    }

    @api
    testQuerySelector() {
        const result = this.template.querySelector('.div-in-parent');
        testUtils.assertDefined(result);
        assertNodeDetail(result, {tagName: 'DIV', className: 'div-in-parent'});
    }

    @api
    testQuerySelectorAll() {
        const childNodes = this.template.querySelectorAll('*');
        testUtils.assertEquals(3, childNodes.length);
        assertNodeDetail(childNodes[0], {tagName: 'DIV', className: 'div-in-parent'});
        assertNodeDetail(childNodes[1], {tagName: 'SPAN', className: 'span-in-parent'});
        assertNodeDetail(childNodes[2], {tagName: 'LOCKERLWC-PARENTSECURE', className: 'parentsecure'});
    }
}

const secureElementRegex = /^SecureElement: \[object .*\]{ key: {"namespace":"lockerlwc"} }/;
function assertNodeDetail(actualNode, expectedDetail) {
    for ( let [prop, expectedPropValue] of Object.entries(expectedDetail)) {
        testUtils.assertEquals(expectedPropValue, actualNode[prop]);
    }
    testUtils.assertTrue(secureElementRegex.test(actualNode.toString()));
}
