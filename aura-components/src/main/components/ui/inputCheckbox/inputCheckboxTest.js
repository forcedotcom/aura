/*
 * Copyright (C) 2012 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    /**
     * @userStory a07T0000001isvY
     * @hierarchy Aura.Components.UI.InputCheckBox
     */
    /**
     * Verify setting disabled attribute.
     */
    testDisabled: {
        attributes : {disabled: true},
        test: function(component){
            aura.test.assertTrue(component.find("checkbox").getElement().disabled, "Element not correctly disabled");
        }
    },
    /**
     * Verify not setting disabled attribute.
     */
    testNotDisabled: {
        attributes : {disabled: false},
        test: function(component){
            aura.test.assertFalse(component.find("checkbox").getElement().disabled, "Element not correctly enabled");
        }
    },
    /**
     * Verify setting name attribute.
     */
    testName: {
        attributes : {name: "checkboxName"},
        test: function(component){
            aura.test.assertEquals("checkboxName", component.find("checkbox").getElement().name, "Name attribute not correctly set");
        }
    },
    /**
     * Verify setting value attribute.
     */
    testSelectedValue: {
        attributes : {value: true},
        test: function(component){
            aura.test.assertTrue(component.find("checkbox").getElement().checked, "Element not correctly selected");
        }
    },
    /**
     * Verify not setting value attribute.
     */
    testUnselectedValue: {
        attributes : {value: false},
        test: function(component){
            aura.test.assertFalse(component.find("checkbox").getElement().checked, "Element not correctly unselected");
        }
    },
    /**
     * Verify type attribute. Universal design requirement.
     */
    testType: {
        test: function(component){
            aura.test.assertEquals("checkbox", component.find("checkbox").getElement().type, "Type attribute not correctly set");
        }
    },

    /**
     * Verify value attribute.
     * When value attribute is set and label not set, value will be used as label.
     * Comment it out as we don't render label for now.
     */
    // TODO: W-943203 - label not displayed
    /*testText: {
        attributes : {text: "my value"},
        test: function(component){
            aura.test.assertEquals("my value", component.find("checkbox").getElement().value, "Text attribute not correctly set");
            this.verifyLabel(component, "my value");
        }
    },*/
    /**
     * Verify label attribute.
     * Comment it out as we don't render label for now.
     */
    // TODO: W-943203 - label not displayed
    /*testLabel: {
        attributes : {text:"my value", label : "I want a pony"},
        test: function(component){
            aura.test.assertEquals("my value", component.find("checkbox").getElement().value, "Value attribute not correctly set");
            this.verifyLabel(component, "I want a pony");
        }
    },*/
    /**
     * Verify updating attributes on rerender.
     */
    testRerender:{
        attributes : {disabled: false, text: "my value", value: false},
        test:function(component){
            aura.test.assertEquals("my value", component.find("checkbox").getElement().value, "Value attribute not correctly set");
            aura.test.assertFalse(component.find("checkbox").getElement().disabled, "Element not correctly enabled");
            aura.test.assertFalse(component.find("checkbox").getElement().checked, "Element not correctly unselected");
            component.getAttributes().setValue('disabled', true);
            component.getAttributes().setValue('text', 'your value');
            component.getAttributes().setValue('value', true);
            component.getAttributes().setValue('label', "I want a pony");
            $A.rerender(component);
            aura.test.assertEquals("your value", component.find("checkbox").getElement().value, "After rerender, value attribute not correctly set with new value");
            aura.test.assertTrue(component.find("checkbox").getElement().disabled, "After rerender, element not disabled");
            aura.test.assertTrue(component.find("checkbox").getElement().checked, "After rerender, element not correctly selected");
            //TODO: W-1150831, W-943203
            //this.verifyLabel(component, "I want a pony");
        }
    },
    /**
     * Verify that clicking on checkbox toggle it from unselected to selected.
     */
    testSelecting:{
        attributes : {value: false},
        test:function(component){
            aura.test.assertFalse(component.find("checkbox").getElement().checked, "Element should be unselected initially");
            component.find("checkbox").getElement().click();
            aura.test.assertTrue(component.find("checkbox").getElement().checked, "Element not correctly selected");
        }
    },

    // Tests using this are currently disabled. Labels are not displayed next to checkbox.
    // W-943203
    verifyLabel: function(component, expectedLabel){
        var elements = component.getElements();
        aura.test.assertTrue($A.test.isInstanceofInputElement(elements[0]), "Input element not found");
        aura.test.assertTrue($A.test.isInstanceOfText(elements[1]), "Label not found with checkbox");
        aura.test.assertEquals(expectedLabel, $A.test.getText(elements[1]), "Label attribute not correctly set");
    }

})
