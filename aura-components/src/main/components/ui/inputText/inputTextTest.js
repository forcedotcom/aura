/*
 * Copyright (C) 2013 salesforce.com, inc.
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
     * Verify setting value to null will clear out the field.
     */
    testSetValueNull: {
        attributes: {value: "test"},
        test: [ function(component) {
            component.set("v.value", null);
        } , function(component) {
            $A.test.assertEquals('', component.getElement().value, "input text value is not cleared.");
        }]
    },

    testInputGetElementWithLabel: {
        attributes: {label: "text label"},
        test: [ function(component) {
            var inputCmp = component.getSuper();
            var helper = component.getDef().getHelper();
            var inputElement = helper.getInputElement(inputCmp);
            $A.test.assertEquals("input", inputElement.tagName.toLowerCase(), "should find the correct input element");
        }]
    },

    testInputGetElementWithoutLabel: {
        test: [ function(component) {
            var inputCmp = component.getSuper();
            var helper = component.getDef().getHelper();
            var inputElement = helper.getInputElement(inputCmp);
            $A.test.assertEquals("input", inputElement.tagName.toLowerCase(), "should find the correct input element");
        }]
    },

    testInputGetElementLabelDestroyed: {
        attributes: {label: "text label"},
        test: [ function(component) {
            var inputCmp = component.getSuper();
            var helper = component.getDef().getHelper();
            inputCmp.find("inputLabel").destroy();
            var inputElement = helper.getInputElement(inputCmp);
            $A.test.assertEquals("input", inputElement.tagName.toLowerCase(), "should find the correct input element");
        }]
    },

    testLegendWhenIsCompoundFieldSet: {
        attributes: { isCompound: true, label: "inputLabel" },
        test: [function(component) {
            var legendElms = component.getElement().getElementsByTagName("legend");
            $A.test.assertEquals(1, legendElms.length,
                "Compound fieldset <input/> should have 1 <legend/> tag");
            $A.test.assertEquals("inputLabel", $A.test.getText(legendElms[0]),
                "When isCompound=true, v.label should be used for <legend/>");
        }]
    },
    
    testAriaRequiredWhenIsCompoundFieldSet: {
        attributes: { isCompound: true, label: "inputLabel", required: "true" },
        test: [function(component) {
            var inputCmp = component.getSuper();
            var helper = component.getDef().getHelper();
            var inputElement = helper.getInputElement(inputCmp);
            $A.test.assertUndefinedOrNull(inputElement.getAttribute("aria-required"), "Input should not have aria-required");
        }]
    },
    
    testAriaRequiredWhenIsSimpleInput: {
        attributes: { isCompound: false, label: "inputLabel", required: "true" },
        test: [function(component) {
            var inputCmp = component.getSuper();
            var helper = component.getDef().getHelper();
            var inputElement = helper.getInputElement(inputCmp);
            $A.test.assertNotUndefinedOrNull(inputElement.getAttribute("aria-required"), "Input should have aria-required");
        }]
    },
    
    testLabelWhenIsSimpleInput: {
        attributes: { isCompound: false, label: "inputLabel" },
        test: [function(component) {
            var labelElms = component.getElement().getElementsByTagName("label");
            $A.test.assertEquals(1, labelElms.length,
                "Non-compound simple <input/> should have 1 <label/> tag");
            $A.test.assertEquals("inputLabel", $A.test.getText(labelElms[0]),
                "When isCompound=false, v.label should be used for <label/>");
        }]
    }

})//eslint-disable-line semi
