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
     * Rerender after the dom has been messed with.
     * The issue that was occuring was that after a drag and drop process
     * The dom nodes got shifted. Because we expect to know exactly how things are
     * in the dom, we're trying to insert the element into the wrong place (itself)
     *
     * 1. Add an interation to the page with 2 items.
     * 2. Between the two elements those items create, insert another DOM element (can be anything including a comment)
     * 3. Swap the position of the two items so we rerender ONLY.
     * 4. After Rerender, verify output
     */
    testRerenderAfterUnexpectedDom: {
        attributes: {
            "items": [1, 2]
        },
        test: [function(cmp) {
                    var iteration = cmp.find("iteration");
                    var items = iteration.get("v.items");
                    var elements = iteration.getElements();
        
                    var newElement = document.createElement("div");
                    newElement.appendChild(document.createTextNode("{inserted}"));
                    elements[0].parentNode.insertBefore(newElement, elements[1]);
        
                    items = items.reverse();
                    iteration.set("v.items", items);
                },
                function(cmp) {
                    var expected = "{inserted}21";
                    var output = cmp.find("output");
                    var elements = output.getElements();

                    var actual = $A.test.getTextByComponent(output);

                    $A.test.assertEquals(expected, actual);
                }]
    },

    /**
     * Rerender after the dom has been messed with.
     * Similar to the test above (testRerenderAfterUnexpectedDom) only uses more elements. 
     * This was catching issues around having the injected dom node not be the second to last element.
     * 
     * 1. Add an interation to the page with 4 items.
     * 2. Between the first two elements that the iteration creates, insert another DOM element (can be anything including a comment)
     * 3. Swap the position of the all the items so we rerender ONLY (no render or unrender operations).
     * 4. After Rerender, verify output
     */
    testRerenderAfterUnexpectedDomWithFourItems: {
        attributes: {
            "items": [1, 2, 3, 4]
        },
        test: [function(cmp) {
                    var iteration = cmp.find("iteration");
                    var items = iteration.get("v.items");
                    var elements = iteration.getElements();
        
                    var newElement = document.createElement("div");
                    newElement.appendChild(document.createTextNode("{inserted}"));
                    elements[1].parentNode.insertBefore(newElement, elements[2]);
        
                    items = items.reverse();
                    iteration.set("v.items", items);
                },
                function(cmp) {
                    var expected = "{inserted}4321";
                    var output = cmp.find("output");
                    var elements = output.getElements();

                    var actual = $A.test.getTextByComponent(output);

                    $A.test.assertEquals(expected, actual);
                }]
    }
})