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
    /* checked checkbox */
    testChecked: {
        attributes : {value : true},
        test: function(component){
        	var expectedElem = component.find("img1").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "checked"), "missing class: checked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            aura.test.assertFalse(component.find("img2").isRendered(), "img2 shouldn't be rendered");
        }
    },

    /* unchecked checkbox */
    testUnchecked: {
        attributes : {value : false},
        test: function(component){
            var expectedElem = component.find("img2").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "unchecked"), "missing class: unchecked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            aura.test.assertFalse(component.find("img1").isRendered(), "img1 shouldn't be rendered");
        }
    },

    /* unchecked -> checked checkbox */
    testRerenderChecked: {
        attributes : {value : false},
        test: function(component){
        	var expectedElem = component.find("img2").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "unchecked"), "missing class: unchecked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            aura.test.assertFalse(component.find("img1").isRendered(), "img1 shouldn't be rendered");

            component.set("v.value",true);
            $A.renderingService.rerender(component);

            expectedElem = component.find("img1").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "checked"), "missing class: checked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            //check to see if img2 is not rendered on the page after checkbox is checked
            var oldElem = component.find("img2");
            aura.test.assertFalse(oldElem.isRendered(), "img2 shouldn't be rendered");
        }
    },

    /* checked -> unchecked checkbox */
    testRerenderUnchecked: {
        attributes : {value : true},
        test: function(component){
            var expectedElem = component.find("img1").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "checked"), "missing class: checked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            aura.test.assertFalse(component.find("img2").isRendered(), "img2 shouldn't be rendered");

            component.set("v.value",false);
            $A.renderingService.rerender(component);

            expectedElem = component.find("img2").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "unchecked"), "missing class: unchecked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            //check to see if img1 is not rendered on the page after checkbox is unchecked
            var oldElem = component.find("img1");
            aura.test.assertFalse(oldElem.isRendered(), "img1 shouldn't be rendered");
      }
    }
})
