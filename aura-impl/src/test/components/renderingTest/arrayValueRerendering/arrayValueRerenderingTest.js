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
    testRerenderOrdering : {
        test : function(component) {
            var values = component.getElement().childNodes;
            for (var n = 0; n < values.length; n++) {
                $A.test.assertEquals("Value " + (n + 1), $A.test.getText(values[n]));
            }
            var body = component.find("me").getValue("v.body");
            function addComponent(label, insertFunction) {
                // Note that usually we'd want have a wait until the callback with the newly created cmp is called, but
                // since we don't need to make a server trip the cmp is created and callback called synchronously.
                $A.componentService.newComponentAsync(
                    this,
                    function(newCmp){
                        insertFunction(body, newCmp);
                    },
                    {
                        componentDef: { descriptor:"markup://aura:html" },
                        attributes: {
                            values: {
                                tag: "div",
                                body: [{
                                    componentDef: { descriptor:"markup://aura:text" },
                                    attributes: {
                                        values: {
                                            value: label
                                        }
                                    }
                                }]
                            }
                        }
                    }
                );
            }
            function iteration(values, toAdd, insertFunction) {
                var startIndex = values.length;
                // Add a few items to the end of the body
                for (var n = startIndex; n < startIndex + toAdd; n++) {
                    addComponent("Value " + (n + 1), insertFunction);
                }
                $A.rerender(component);
                values = component.getElement().childNodes;
                for (n = 0; n < values.length; n++) {
                    $A.test.assertEquals("Value " + (n + 1), $A.test.getText(values[n]));
                }
            }
            //test adding new component to the array
            iteration(values, 4, function(body, c) {
                body.push(c);
            });
            iteration(values, 4, function(body, c) {
                body.push(c);
            });
            // Now lets do some splicing. Insert Value to index first, middle, and last index
            addComponent("Value inserted at index 0", function(body, c) {
                body.insert(0, c);
            });
            $A.rerender(component);
            $A.test.assertEquals("Value inserted at index 0", $A.test.getText(values[0]));
            $A.test.assertEquals(13, values.length);
            addComponent("Value inserted at index 1", function(body, c) {
                body.insert(1, c);
            });
            $A.rerender(component);
            $A.test.assertEquals("Value inserted at index 1", $A.test.getText(values[1]), "Value not inserted at proper index");
            $A.test.assertEquals(14, values.length);
            addComponent("Value inserted at last index", function(body, c) {
                body.insert(14, c);
            });
            $A.rerender(component);
            $A.test.assertEquals("Value inserted at last index", $A.test.getText(values[14]), "Value not inserted at end of array");
            $A.test.assertEquals(15, values.length);
            //test removing component from array
            //remove the first
            body.remove(0);
            $A.rerender(component);
            $A.test.assertEquals("Value inserted at index 1", $A.test.getText(values[0]),"error after removing the first cmp of array");
            $A.test.assertEquals(14, values.length);
            //remove the second
            body.remove(1);
            $A.rerender(component);
            $A.test.assertEquals("Value 2", $A.test.getText(values[1]),"error after removing the 2nd cmp of array");
            $A.test.assertEquals(13, values.length);
            //remove the last
            body.remove(12);
            $A.rerender(component);
            $A.test.assertEquals("Value 12", $A.test.getText(values[11]),"error after removing the last cmp of array");
            $A.test.assertEquals(12, values.length);
            //clean the array and test inserting to an empty array
            body.clear(); 
            $A.test.assertEquals(0,body.getLength());
            //we clear the body, AuraRenderingService.rerender -> ArrayValue.rerender will put a comment as a reference node
            //before rerender, value length is still 12
            $A.test.assertEquals(12,values.length);
            $A.rerender(component);
            //after rerender, value length become 1
            $A.test.assertEquals(1,values.length);
            //make sure the node is a comment node
            $A.test.assertEquals(8,values[0].nodeType);
            addComponent("Value inserted at index 0 to an empty array", function(body, c) {
                body.insert(0, c);
            });
            $A.rerender(component);
            $A.test.assertEquals("Value inserted at index 0 to an empty array", $A.test.getText(values[0]));
            $A.test.assertEquals(1, values.length);
        }
    }
})
