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
    testRerenderOrdering : {
        test : function(component) {
            var values = component.getElement().childNodes;
            for (var n = 0; n < values.length; n++) {
                $A.test.assertEquals("Value " + (n + 1), values[n].textContent);
            }

            var body = component.find("me").getValue("v.body");

            function addComponent(label, insertFunction) {
                var c = $A.componentService.newComponent({
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
                });

                insertFunction(body, c);
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
                    $A.test.assertEquals("Value " + (n + 1), values[n].textContent);
                }
            }

            iteration(values, 4, function(body, c) {
                body.push(c);
            });

            iteration(values, 4, function(body, c) {
                body.push(c);
            });

            // DCHASMAN TODO Still some kinks in the insert() story - next round of ArrayValue mods will address that
            /*// Now lets do some splicing
            addComponent("Value inserted at index 0", function(body, c) {
                body.insert(0, c);
            });
            $A.rerender(component);*/

            addComponent("Value inserted at index 1", function(body, c) {
                body.insert(1, c);
            });
            $A.rerender(component);

            $A.test.assertEquals("Value inserted at index 1", values[1].textContent);
        }
    }
})
