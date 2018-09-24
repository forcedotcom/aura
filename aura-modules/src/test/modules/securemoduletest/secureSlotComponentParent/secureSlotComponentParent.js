import { LightningElement, api } from "lwc";
import * as testUtils from "securemoduletest/testUtil";

export default class SecureSlotComponentParent extends LightningElement {
    @api name = "SecureSlotComponentParent";

    @api
    testElement() {
        let secureSpanElement = this.template.querySelector('#childComponent span');
        testUtils.assertEquals('my-slot', secureSpanElement.slot, 'Expected slot attribute to be "my-slot"');
        testUtils.assertEquals('SecureElement: [object HTMLSlotElement]{ key: {"namespace":"secureModuleTest"} }', secureSpanElement.assignedSlot.toString(), 'Expected assigned slot to be <slot name="my-slot">!');
        testUtils.assertEquals('my-slot', secureSpanElement.assignedSlot.name, 'Expected assigned slot to be <slot name="my-slot">!');
    }

    @api
    testNamedSlot() {
        let childComponent = this.template.querySelector('#childComponent');
        childComponent.testNamedSlot();
    }

    @api
    testDefaultSlot() {
        let childComponent = this.template.querySelector('#childComponent');
        childComponent.testDefaultSlot();
    }
}
