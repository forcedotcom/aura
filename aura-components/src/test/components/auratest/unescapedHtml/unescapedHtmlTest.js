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
                $A.test.assertTrue($A.util.isEmpty(cmp.getElements()), "no elements should have been rendered");
                component.find("toggle").get("e.press").fire();
                $A.test.addWaitFor(true, function(){
                    return !component.isDirty("v.value");
                });
            }, function(component){
                var cmp = component.find("value");
                var e = cmp.getElement();
                $A.test.assertEquals("B", e.tagName.toUpperCase());
                $A.test.assertEquals("some value", $A.test.getText(e) || e.innerText, "new value not rendered");
                component.find("toggle").get("e.press").fire();
                $A.test.addWaitFor(true, function(){
                    return !component.isDirty("v.value");
                });
            }, function(component){
                var cmp = component.find("value");
                $A.test.assertTrue($A.util.isEmpty(cmp.getElements()), "previous element was not unrendered");
            }]
    },

    /**
     * Undefined value renders no elements.
     */
    // W-1132685 - https://gus.salesforce.com/a07B0000000KzSX
    testValueMissing: {
        test: [function(component){
                var cmp = component.find("value");
                $A.test.assertTrue($A.util.isEmpty(cmp.getElements()), "no elements should have been rendered");
                component.find("toggle").get("e.press").fire();
                $A.test.addWaitFor(true, function(){
                    return !component.isDirty("v.value");
                });
            }, function(component){
                var cmp = component.find("value");
                var e = cmp.getElement();
                $A.test.assertEquals("B", e.tagName.toUpperCase());
                $A.test.assertEquals("some value", $A.test.getText(e) || e.innerText, "new value not rendered");
                component.find("toggle").get("e.press").fire();
                $A.test.addWaitFor(true, function(){
                    return !component.isDirty("v.value");
                });
            }, function(component){
                var cmp = component.find("value");
                $A.test.assertTrue($A.util.isEmpty(cmp.getElements()), "previous element was not unrendered");
            }]
    },

    /**
     * Null value renders no elements.
     */
    // W-1132685 - https://gus.salesforce.com/a07B0000000KzSX
    testValueNull: {
        test: [function(component){
                var cmp = component.find("null");
                $A.test.assertTrue($A.util.isEmpty(cmp.getElements()), "no elements should have been rendered");
                component.find("toggle").get("e.press").fire();
                $A.test.addWaitFor(true, function(){
                    return !component.isDirty("v.value");
                });
            }, function(component){
                var cmp = component.find("null");
                $A.test.assertTrue($A.util.isEmpty(cmp.getElements()), "still no elements should have been rendered");
            }]
    },

    testRerender: {
        test: [
            function(cmp) {
                var expected = "<b>testRerender</b>";
                var contents;
                var output = cmp.find("output");

                cmp.set("v.value", expected);

                $A.test.addWaitForWithFailureMessage(true, function() {
                    var bold = output.getElement().firstChild;
                    return bold && $A.util.getText(bold) === "testRerender";

                }, "The expected HTML " + expected + " was not present");
            },
            function(cmp) {
                var expected = "<i>testRerender2</i>";
                var contents;
                var output = cmp.find("output");

                cmp.set("v.value", "<b>Initial</b>");
                cmp.set("v.value", expected);

                $A.test.addWaitForWithFailureMessage(true, function() {
                    var italic = output.getElement().firstChild;
                    return italic && $A.util.getText(italic) === "testRerender2";
                }, "The expected HTML " + expected + " was not present", function() {
                    // All the other values in the output are gone.
                    var count = output.getElement().getElementsByTagName("*").length;
                    $A.test.assertEquals(1, count);
                });
            }
        ]
    }
})
