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
        attributes : {value: "test"},
        test: [ function(component) {
            component.set("v.value", null);
        } , function(component) {
            $A.test.assertEquals('', component.getElement().value, "input text value is not cleared.");
        }]
    },

    testInputGetElementWithLabel: {
        attributes : {label: "text label"},
        test: [ function(component) {
            var inputCmp = component.getSuper(),
                helper = component.getDef().getHelper();
            var inputElement = helper.getInputElement(inputCmp);
            $A.test.assertEquals("input", inputElement.tagName.toLowerCase(), "should find the correct input element");
        }]
    },

    testInputGetElementWithoutLabel: {
        test: [ function(component) {
            var inputCmp = component.getSuper(),
                helper = component.getDef().getHelper();
            var inputElement = helper.getInputElement(inputCmp);
            $A.test.assertEquals("input", inputElement.tagName.toLowerCase(), "should find the correct input element");
        }]
    },

    testInputGetElementLabelDestroyed: {
        attributes : {label: "text label"},
        test: [ function(component) {
            var inputCmp = component.getSuper(),
                helper = component.getDef().getHelper();
            inputCmp.find("inputLabel").destroy();
            var inputElement = helper.getInputElement(inputCmp);
            $A.test.assertEquals("input", inputElement.tagName.toLowerCase(), "should find the correct input element");
        }]
    }
/*eslint-disable semi*/
})
/*eslint-enable semi*/