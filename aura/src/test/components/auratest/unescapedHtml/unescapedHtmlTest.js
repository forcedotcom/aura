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
     * Empty string value renders no elements.
     */
    // W-1132685 - https://gus.salesforce.com/a07B0000000KzSX
    testValueEmptyString: {
        attributes : { value: "" },
        test: [function(component){
                var cmp = component.find("value");
                $A.test.assertTrue($A.util.isUndefined(cmp.getElements()), "no elements should have been rendered");
//                component.find("toggle").get("e.press").fire();
//                $A.test.addWaitFor(true, function(){
//                    return !component.getValue("v.value").isDirty();
//                });
//            }, function(component){
//                var cmp = component.find("value");
//                var e = cmp.getElement();
//                $A.test.assertEquals("B", e.tagName.toUpperCase());
//                $A.test.assertEquals("some value", $A.test.getText(e) || e.innerText, "new value not rendered");
//                component.find("toggle").get("e.press").fire();
//                $A.test.addWaitFor(true, function(){
//                    return !component.getValue("v.value").isDirty();
//                });
//            }, function(component){
//                var cmp = component.find("value");
//                $A.test.assertTrue($A.util.isUndefined(cmp.getElements()), "previous element was not unrendered");
            }]
    },

    /**
     * Undefined value renders no elements.
     */
    // W-1132685 - https://gus.salesforce.com/a07B0000000KzSX
    testValueMissing: {
        test: [function(component){
                var cmp = component.find("value");
                $A.test.assertTrue($A.util.isUndefined(cmp.getElements()), "no elements should have been rendered");
//                component.find("toggle").get("e.press").fire();
//                $A.test.addWaitFor(true, function(){
//                    return !component.getValue("v.value").isDirty();
//                });
//            }, function(component){
//                var cmp = component.find("value");
//                var e = cmp.getElement();
//                $A.test.assertEquals("B", e.tagName.toUpperCase());
//                $A.test.assertEquals("some value", $A.test.getText(e) || e.innerText, "new value not rendered");
//                component.find("toggle").get("e.press").fire();
//                $A.test.addWaitFor(true, function(){
//                    return !component.getValue("v.value").isDirty();
//                });
//            }, function(component){
//                var cmp = component.find("value");
//                $A.test.assertTrue($A.util.isUndefined(cmp.getElements()), "previous element was not unrendered");
            }]
    },

    /**
     * Null value renders no elements.
     */
    // W-1132685 - https://gus.salesforce.com/a07B0000000KzSX
    testValueNull: {
        test: [function(component){
                var cmp = component.find("null");
                $A.test.assertTrue($A.util.isUndefined(cmp.getElements()), "no elements should have been rendered");
//                component.find("toggle").get("e.press").fire();
//                $A.test.addWaitFor(true, function(){
//                    return !component.getValue("v.value").isDirty();
//                });
//            }, function(component){
//                var cmp = component.find("null");
//                $A.test.assertTrue($A.util.isUndefined(cmp.getElements()), "still no elements should have been rendered");
            }]
    }
})
