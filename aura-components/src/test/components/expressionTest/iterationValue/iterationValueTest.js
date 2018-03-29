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
    testRemoveFirstItemFromIteration: {
        test: function(cmp) {
            var iteration = cmp.get("v.cmps")[0];
            iteration.set("v.items", ["item2", "item3"]);

            var outputElement = cmp.find("output").getElement();
            $A.test.addWaitFor(true, function() {
                    return $A.test.getText(outputElement).indexOf("item1") < 0;
                }, function() {
                    var expected = "item2item3";
                    var actual = $A.test.getText(outputElement);
                    $A.test.assertEqualsIgnoreWhitespace(expected, actual);
                });
        }
    },

    testRemoveLastItemFromIteration: {
        test: function(cmp) {
            var iteration = cmp.get("v.cmps")[0];
            iteration.set("v.items", ["item1", "item2"]);

            var outputElement = cmp.find("output").getElement();
            $A.test.addWaitFor(true, function() {
                    return $A.test.getText(outputElement).indexOf("item3") < 0;
                }, function() {
                    var expected = "item1item2";
                    var actual = $A.test.getText(outputElement);
                    $A.test.assertEqualsIgnoreWhitespace(expected, actual);
                });
        }
    },

    testRemoveFirstItemAndReorder: {
        test: function(cmp) {
            var iteration = cmp.get("v.cmps")[0];
            iteration.set("v.items", ["item3", "item2"]);

            var outputElement = cmp.find("output").getElement();
            $A.test.addWaitFor(true, function() {
                    return $A.test.getText(outputElement).indexOf("item1") < 0;
                }, function() {
                    var expected = "item3item2";
                    var actual = $A.test.getText(outputElement);
                    $A.test.assertEqualsIgnoreWhitespace(expected, actual);
                });
        }
    }
})