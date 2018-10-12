import { LightningElement, api } from "lwc";
import * as testUtils from "securemoduletest/testUtil";

export default class SecureSlotComponent extends LightningElement {
    @api name = "SecureSlotComponent";

    @api
    testNamedSlot() {
        let secureSlotElement = this.template.querySelector('#named-slot');
        let secureSlotElementName = secureSlotElement.name;
        let secureSlotElementAssignedNodes = secureSlotElement.assignedNodes();
        let secureSlotElementAssignedElements = secureSlotElement.assignedElements();

        testUtils.assertEquals('my-slot', secureSlotElementName, 'Expected named <slot> to have name equal to "my-slot"');
        testUtils.assertEquals('SecureElement: [object HTMLSpanElement]{ key: {"namespace":"secureModuleTest"} }', secureSlotElementAssignedNodes[0] + '', 'Expected first assigned node of named <slot> to be <span>!');
        testUtils.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', secureSlotElementAssignedNodes[1] + '', 'Expected second assigned node of named <slot> to be <div>!');
        testUtils.assertEquals(undefined, secureSlotElementAssignedNodes[4], 'Expected no more assigned nodes to named <slot>!');
        testUtils.assertEquals('SecureElement: [object HTMLSpanElement]{ key: {"namespace":"secureModuleTest"} }', secureSlotElementAssignedElements[0] + '', 'Expected first assigned elements of named <slot> to be <span>!');
        testUtils.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', secureSlotElementAssignedElements[1] + '', 'Expected second assigned elements of named <slot> to be <div>!');
        testUtils.assertEquals(undefined, secureSlotElementAssignedElements[4], 'Expected no more assigned elements to named <slot>!');

        testUtils.assertEquals(0, secureSlotElement.querySelectorAll('div').length, 'Expected 0 <div> tags to be inside the slot!');
        testUtils.assertEquals('', secureSlotElement.innerText, 'Expected named <slot> to be an empty string!');
        testUtils.assertEquals('SecureElement: [object HTMLSlotElement]{ key: {"namespace":"secureModuleTest"} }', secureSlotElement + '', 'Expected named <slot> to be a SecureElement!');
        testUtils.assertTrue(secureSlotElement instanceof HTMLSlotElement, 'Expected named <slot> to be an instance of HTMLSlotElement!');
    }

    @api
    testDefaultSlot() {
        let secureSlotElement = this.template.querySelector('#default-slot');
        let secureSlotElementName = secureSlotElement.name;
        let secureSlotElementAssignedNodes = secureSlotElement.assignedNodes();
        let secureSlotElementAssignedElements = secureSlotElement.assignedElements();

        testUtils.assertEquals('', secureSlotElementName, 'Expected default <slot> to have name equal to an empty string.');
        testUtils.assertEquals('SecureElement: [object HTMLSpanElement]{ key: {"namespace":"secureModuleTest"} }', secureSlotElementAssignedNodes[0] + '', 'Expected first assigned node of named <slot> to be <span>!');
        testUtils.assertEquals('SecureElement: [object HTMLParagraphElement]{ key: {"namespace":"secureModuleTest"} }', secureSlotElementAssignedNodes[1] + '', 'Expected second assigned node of named <slot> to be <p>!');
        testUtils.assertEquals('SecureElement: [object Text]{ key: {"namespace":"secureModuleTest"} }', secureSlotElementAssignedNodes[4] + '', 'Expected no more assigned nodes to named <slot>!');
        testUtils.assertEquals('SecureElement: [object HTMLSpanElement]{ key: {"namespace":"secureModuleTest"} }', secureSlotElementAssignedElements[0] + '', 'Expected first assigned elements of named <slot> to be <span>!');
        testUtils.assertEquals('SecureElement: [object HTMLParagraphElement]{ key: {"namespace":"secureModuleTest"} }', secureSlotElementAssignedElements[1] + '', 'Expected second assigned elements of named <slot> to be <p>!');
        testUtils.assertEquals(undefined, secureSlotElementAssignedElements[4], 'Expected no more assigned elements to named <slot>!');

        testUtils.assertEquals(0, secureSlotElement.querySelectorAll('p').length, 'Expected 0 <p> tags to be inside the slot!');
        testUtils.assertEquals('', secureSlotElement.innerText, 'Expected default <slot> to be an empty string!');
        testUtils.assertEquals('SecureElement: [object HTMLSlotElement]{ key: {"namespace":"secureModuleTest"} }', secureSlotElement + '', 'Expected default <slot> to be a SecureElement!');
        testUtils.assertTrue(secureSlotElement instanceof HTMLSlotElement, 'Expected default <slot> to be an instance of HTMLSlotElement!');
    }
}
