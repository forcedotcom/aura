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
        test: [
            function(cmp) {
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
            }
        ]
    },

    /**
     * This test is to cover some existing components. They intendedly remove rendered element from the DOM tree.
     */
    testRerenderAfterRemoveMarkerFromDOM: {
        test: function(cmp) {
            var expected = "new item";

            // remove marker which is shared by root component and ui:button from DOM tree
            var marker = cmp.find("button").getElement();
            marker.parentNode.removeChild(marker);

            cmp.set("v.items", [expected]);

            $A.test.addWaitForWithFailureMessage(true, function() {
                    var output = cmp.find("output");
                    return $A.test.getText(output.getElement()).indexOf(expected) > -1;
                },
                "The new component never gets rendered."
            );
        }
    },

    /**
     * Rerender after component marker has been removed from the DOM. If there is any new component on facet gets rendered,
     * the new rendered elements will be in component's element collection, but will not be inserted into DOM.
     */
    testRerenderWithNewRenderedComponentAfterRemoveMarkerFromDOM: {
        test: function(cmp) {
            // remove marker which is shared by root component and ui:button from DOM tree
            var marker = cmp.find("button").getElement();
            marker.parentNode.removeChild(marker);

            // the aura:text in 'else' will be rendered
            cmp.set("v.showButton", false);

            $A.test.expectAuraWarning("Rendering Error: The element for the following component was removed from the DOM outside of the Aura lifecycle.");
            $A.test.addWaitForWithFailureMessage(true, function() {
                    // button is unrendered during re-render
                    return !cmp.find("button");
                },
                "The root component never gets rerendered.",
                function() {
                    var elementInAuraIf = cmp.find("showButton").getElement();
                    var actual = $A.test.getText(elementInAuraIf);
                    // the element will not be in the DOM tree, because we lost the marker to insert the
                    // new rendered elements.
                    $A.test.assertEqualsIgnoreWhitespace("a button was here!", actual,
                            "The aura:if should renders a text element in 'else'.");
                }
            );
        }
    },

    /**
     * Rerender after the order of rendered elements in DOM are changed into different order of component elements collection.
     *
     * 1. Change the order of elements rendered by aura:iteration
     * 2. Set new components to attribute 'items'
     * 3. Verify aura:iteration re-renders correctly
     */
    testRerenderWhenElementsOrderIsChangedInDOM: {
        test: function(cmp) {
            // Arrange
            var outputElement = cmp.find("output").getElement();
            var elementsOnDOM = outputElement.querySelectorAll("div");
            var previousSibling = elementsOnDOM[0].previousSibling;
            var fragment = document.createDocumentFragment();
            // re-ordering elements in the DOM
            for (var i = 0, len = elementsOnDOM.length; i < len; i++) {
                var element = elementsOnDOM[i];
                outputElement.removeChild(element);
                fragment.insertBefore(element, fragment.firstChild)
            }
            outputElement.appendChild(fragment, previousSibling);

            $A.test.assertEqualsIgnoreWhitespace("4321", $A.test.getText(outputElement),
                    "Test Setup Failed: the order of elements in the DOM should be reversed.");

            // Act
            var expected = "3421";
            cmp.set("v.items", [3, 4, 2, 1]);

            // Assert
            $A.test.addWaitForWithFailureMessage(true, function() {
                    return $A.test.getText(outputElement).indexOf("4321") < 0;
                },
                "The root component never gets rerendered.",
                function() {
                    var actual = $A.test.getText(outputElement);
                    $A.test.assertEqualsIgnoreWhitespace(expected, actual);
                }
            );
        }
    }
})