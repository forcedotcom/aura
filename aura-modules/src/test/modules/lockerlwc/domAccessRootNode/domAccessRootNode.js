import { LightningElement, api } from 'lwc';
import * as testUtils from "securemoduletest/testUtil";

export default class RootNode extends LightningElement {
    renderedCallback() {
        // Manually insert nodes using innerHtml property
        const prop = "innerHTML";
        const div = document.createElement('div');
        div.className = 'inTheShadow lockerlwc-rootnode-js-div';
        div.id = 'lockerlwc-rootnode-js-div';
        div[prop] = "<span class='inTheShadow lockerlwc-rootnode-js-div-span'>Manually injected to lockerlwc-rootnode shadow dom</span>"
        const templateNode = this.template.querySelector('.lockerlwc-rootnode-span');
        templateNode.appendChild(div);
        // Manually insert nodes using textContent
        const span = document.createElement('span');
        span.textContent = "Manually injected span to lockerlwc-rootnode shadow dom";
        span.className = 'inTheShadow lockerlwc-rootnode-js-span';
        templateNode.appendChild(span);
    }

    @api
    documentQuerySelector() {
        testUtils.assertNull(
            document.querySelector('.inTheShadow'),
            'document.querySelector() leaks shadow dom elements in LWC component'
        );
    }

    @api
    documentQuerySelectorAll() {
        testUtils.assertEquals(
            0,
            document.querySelectorAll('.inTheShadow').length,
            'document.querySelectorAll() leaks shadow dom elements in LWC component'
        );
    }

    @api
    nodeTraverse_firstChild() {
        const child = this.template.querySelector('.lockerlwc-rootnode-child-node');
        // LWC shadow dom gap, firstChild is not patched
        testUtils.assertNull(child.firstChild, 'Expected firstChild of child custom element to be null');
    }

    @api
    nodeTraverse_lastChild() {
        const child = this.template.querySelector('.lockerlwc-rootnode-child-node');
        // LWC shadow dom gap, lastChild is not patched
        testUtils.assertNull(child.lastChild, 'Expected lastChild of child custom element to be null');
    }

    @api
    nodeTraverse_childNodes() {
        const child = this.template.querySelector('.lockerlwc-rootnode-child-node');
        testUtils.assertEquals(0, child.childNodes.length, 'Expected childNodes list of child custom element node to be empty');
    }

    @api
    node_innerText() {
        const child = this.template.querySelector('.lockerlwc-rootnode-child-node');
        // LWC shadow dom gap, innerText is not patched. But this test works because of locker's innerText handling in SecureElement
        testUtils.assertEquals("", child.innerText, 'innerText of custom element should be empty to protect shadow dom semantics');
    }

    @api
    element_children() {
        const child = this.template.querySelector('.lockerlwc-rootnode-child-node');
        testUtils.assertEquals(0, child.children.length, 'Expected children list of child custom element node to be empty');
    }

    @api
    element_firstElementChild() {
        const child = this.template.querySelector('.lockerlwc-rootnode-child-node');
        // LWC shadow dom gap, firstElementChild is not patched
        testUtils.assertNull(child.firstElementChild, 'Expected firstElementChild of child custom element to be null');
    }

    @api
    element_lastElementChild() {
        const child = this.template.querySelector('.lockerlwc-rootnode-child-node');
        // LWC shadow dom gap, lastElementChild is not patched
        testUtils.assertNull(child.lastElementChild, 'Expected lastElementChild of child custom element to be null');
    }

    @api
    element_innerHTML() {
        const child = this.template.querySelector('.lockerlwc-rootnode-child-node');
        const prop = "innerHTML"
        testUtils.assertEquals("", child[prop], 'innerHTML of custom element should be empty to protect shadow dom semantics');
    }

    @api
    element_insertAdjacentHTML() {
        const div = this.template.querySelector('.lockerlwc-rootnode-div');
        const prop = "insertAdjacentHTML";
        div[prop]('afterbegin', '<span class="inTheShadow lockerlwc-rootnode-js-div-span insertAdjacentHTML">Manually injected to lockerlwc-rootnode shadow dom</span>');
    }
}
