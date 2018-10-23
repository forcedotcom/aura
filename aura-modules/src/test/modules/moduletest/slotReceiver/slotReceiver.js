import { LightningElement, api } from 'lwc';
import { getHost } from 'moduletest/getHostUtil';
import * as testUtil from 'securemoduletest/testUtil';

const MY_TAG_NAME = 'MODULETEST-SLOT-RECEIVER';

export default class SlotReceiver extends LightningElement {
    @api
    assertGetHostOfDefaultSlotContent() {
        const defaultSlotContent = this.template.querySelector('span');
        testUtil.assertEquals(MY_TAG_NAME, getHost(defaultSlotContent).tagName);
    }

    @api
    assertGetHostOfSlotNode() {
        const slot = this.template.querySelector('slot');
        testUtil.assertEquals(MY_TAG_NAME, getHost(slot).tagName);
    }

    @api
    assertGetHostOfAssignedContent() {
        const slot = this.template.querySelector('slot').assignedNodes()[0];
        testUtil.assertEquals('MODULETEST-GET-HOST-TESTER', getHost(slot).tagName);
    }
}