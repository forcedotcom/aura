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
     * Add 5 components to a facet and verify they render in order.
     */
    testAddingFacetCollection: {
        test: function(cmp) {
            var expected = "12345";
            var div = cmp.find("output").getElement();

            cmp.add();
            cmp.add();
            cmp.add();
            cmp.add();
            cmp.add();

            $A.test.addWaitFor(expected, function() {
                return $A.util.getText(div);
            });

        }
    },

    /**
     * Add then remove some elements and verify the output
     * 1. Add 5 elements
     * 2. Wait for render
     * 3. Remove 2 elements
     * 4. Wait for render
     * 5. Verify output is as expected.
     */
    testAddRemoveFacetCollection: {
        test: function(cmp) {
            var expected = "123";
            var div = cmp.find("output").getElement();

            cmp.add();
            cmp.add();
            cmp.add();
            cmp.add();
            cmp.add();

            $A.test.addWaitFor("12345", function() {
                return $A.util.getText(div);
            }, function() {
                cmp.remove();
                cmp.remove();

                $A.test.addWaitFor(expected, function() {
                    return $A.util.getText(div);
                });
            });
        }
    },
    
    /**
     * Add then remove then add some more elements and verify the output
     * 1. Add 3 elements
     * 2. Wait for render
     * 3. Remove 2 elements
     * 4. Wait for render
     * 5. Add 2 more elements
     * 5. Verify output is as expected.
     */
    testAddRemoveAddFacetCollection: {
        test: function(cmp) {
            var expected = "123";
            var div = cmp.find("output").getElement();

            cmp.add();
            cmp.add();
            cmp.add();

            // Added 3
            $A.test.addWaitFor(expected, function() {
                return $A.util.getText(div);
            }, function() {
                cmp.remove();
                cmp.remove();

                // Removed 2
                $A.test.addWaitFor("1", function() {
                    return $A.util.getText(div);
                }, function() {
                        cmp.add();
                        cmp.add();
                        // Added 2 again to return us to 123
                        $A.test.addWaitFor(expected, function() {
                            return $A.util.getText(div);
                        });
                });
            });
        }
    },

    /**
     * Add some elements, then remove all the elements, add some more and verify the last 3 are the only ones shown.
     * 1. Add 3 elements
     * 2. Wait for render
     * 3. Remove 3 elements
     * 4. Wait for render
     * 5. Add 3 more elements
     * 5. Verify output is as expected.
     */
    testClearAndAddFacetCollection: {
        test: [
            function(cmp) {
                var expected = "123";
                var div = cmp.find("output").getElement();

                cmp.add();
                cmp.add();
                cmp.add();

                $A.test.addWaitFor(expected, function() {
                    return $A.util.getText(div);
                }, function() {

                    cmp.remove();
                    cmp.remove();
                    cmp.remove();
                    $A.test.addWaitFor("", function() {
                        return $A.util.getText(div);
                    }, function() {

                        cmp.add();
                        cmp.add();
                        cmp.add();

                        $A.test.addWaitFor(expected, function() {
                            return $A.util.getText(div);
                        });
                    });
                });
            }
        ]
    }
})