import { LightningElement, api } from 'lwc';
import { getHost } from 'moduletest/getHostUtil';
import * as testUtil from 'securemoduletest/testUtil';

const MY_TAG_NAME = 'MODULETEST-GET-HOST-TESTER';

export default class GetHostTester extends LightningElement {
    animals = ['Cat', 'Dog', 'Hamster'];
    @api
    assertHostOfElementInTemplate() {
        const host = getHost(this.template.querySelector('h1'));
        testUtil.assertEquals(MY_TAG_NAME, host.tagName);
    }

    @api
    assertHostOfDynamicallyCreatedElementInTemplate() {
        const div = document.createElement('div');
        div.id = 'dynamic';
        this.template.querySelector('[id^="holder"]').appendChild(div);
        const host = getHost(this.template.querySelector('#dynamic'));
        testUtil.assertEquals(MY_TAG_NAME, host.tagName);
    }

    @api
    assertHostOfNestedElementInTemplate() {
        const div = this.template.querySelector('[id^="nestedDiv"]');
        testUtil.assertEquals(MY_TAG_NAME, getHost(div).tagName);
    }

    @api
    assertHostOfInnerTemplateElement() {
        const li = this.template.querySelector('li');
        testUtil.assertEquals(MY_TAG_NAME, getHost(li).tagName);
    }

    @api
    assertHostOfTextNode() {
        const text = this.template.querySelector('[id^="text"]').childNodes[0];
        testUtil.assertEquals(MY_TAG_NAME, getHost(text).tagName);
    }

    @api
    assertHostOfCustomElement() {
        const child = this.template.querySelector('moduletest-slot-receiver');
        testUtil.assertEquals(MY_TAG_NAME, getHost(child).tagName);
    }

    @api
    assertHostOfShadowRoot() {
        testUtil.assertEquals(MY_TAG_NAME, getHost(this.template).tagName);
    }

    @api
    assertHostOfSlotContent() {
        const p = this.template.querySelector('[id^="slotContent"]');
        testUtil.assertEquals(MY_TAG_NAME, getHost(p).tagName);
    }

    @api
    assertHostOfDefaultSlotContentInChild() {
        this.template.querySelector('moduletest-slot-receiver').assertGetHostOfDefaultSlotContent()
    }

    @api
    assertHostOfAssignedSlotContentInReceivingChild() {
        this.template.querySelector('moduletest-slot-receiver').assertGetHostOfAssignedContent();
    }

    @api
    assertHostOfSlotNodeInReceivingChild() {
        this.template.querySelector('moduletest-slot-receiver').assertGetHostOfSlotNode();
    }
}
