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
    /* checked checkbox */
    testChecked: {
        attributes : {value : true},
        test: function(component){
            var expectedElem = component.find("img1").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "checked"), "missing class: checked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            aura.test.assertUndefinedOrNull(component.find("img2"), "img2 shouldn't be rendered");
        }
    },

    /* unchecked checkbox */
    testUnchecked: {
        attributes : {value : false},
        test: function(component){
            var expectedElem = component.find("img2").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "unchecked"), "missing class: unchecked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            aura.test.assertUndefinedOrNull(component.find("img1"), "img1 shouldn't be rendered");
        }
    },

    /* unchecked -> checked checkbox */
    // W-978654, W-1014086 - rerendered img is missing uiOutputCheckbox class
    _testRerenderChecked: {
        attributes : {value : false},
        test: function(component){
            var expectedElem = component.find("img2").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "unchecked"), "missing class: unchecked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            aura.test.assertUndefinedOrNull(component.find("img1"), "img1 shouldn't be rendered");

            component.getAttributes().setValue("value",true);
            $A.renderingService.rerender(component);

            expectedElem = component.find("img1").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "checked"), "missing class: checked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            // can't check null since unrendered element may be in trash still
            var oldElem = component.find("img2").getElement();
            var elems = component.getElements();
            for(e in elems){
                if(oldElem===elems[e]){
                    aura.test.fail("img2 should have been unrendered");
                }
            }
        }
    },

    /* unchecked -> checked checkbox */
    // W-978654, W-1014086 - rerendered img is missing uiOutputCheckbox class
    _testRerenderUnchecked: {
        attributes : {value : true},
        test: function(component){
            var expectedElem = component.find("img1").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "checked"), "missing class: checked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            aura.test.assertUndefinedOrNull(component.find("img2"), "img2 shouldn't be rendered");

            component.getAttributes().setValue("value",false);
            $A.renderingService.rerender(component);

            expectedElem = component.find("img2").getElement();
            aura.test.assertTrue($A.util.hasClass(expectedElem, "unchecked"), "missing class: unchecked");
            aura.test.assertTrue($A.util.hasClass(expectedElem, "uiOutputCheckbox"), "missing class: uiOutputCheckbox");
            // can't check null since unrendered element may be in trash still
            var oldElem = component.find("img1").getElement();
            var elems = component.getElements();
            for(e in elems){
                if(oldElem===elems[e]){
                    aura.test.fail("img1 should have been unrendered");
                }
            }
      }
    }
})
