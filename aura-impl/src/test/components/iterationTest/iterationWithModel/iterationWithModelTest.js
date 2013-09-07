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
/**
 * Note that these tests are only for the Client-side component creation (CSCC) iteration component. The tests should
 * be converted to use the normal iteration component when that supports iteration.
 */
({
    /**
     * Verify adding rows to an iteration does not lose the model data.
     */
    //TODO - W-1818696 - this only fails on jenkins autointegration.  Figure out why
    _testAddNewRowsWithModelData: {
        test: function(cmp) {
            var cmps = cmp.find("innerCmp");
            $A.test.assertStartsWith("one : readonly", $A.util.getText(cmps[0].getElement()));
            $A.test.assertStartsWith("two : readonly", $A.util.getText(cmps[1].getElement()));
            $A.test.assertStartsWith("three : readonly", $A.util.getText(cmps[2].getElement()));

            $A.run(function(){
                cmp.get("addRow").get("e.press").fire();
                cmp.get("addRow").get("e.press").fire();
            });
            // Wait for 5 elements- 3 original plus 2 added
            $A.test.addWaitFor(5, function() {
                return cmp.find("innerCmp").length;
            }, function() {
                cmps = cmp.find("innerCmp");
                $A.test.assertStartsWith("one : readonly", $A.util.getText(cmps[0].getElement()));
                $A.test.assertStartsWith("two : readonly", $A.util.getText(cmps[1].getElement()));
                $A.test.assertStartsWith("three : readonly", $A.util.getText(cmps[2].getElement()));
                $A.test.assertStartsWith("new! : readonly", $A.util.getText(cmps[3].getElement()));
                $A.test.assertStartsWith("new! : readonly", $A.util.getText(cmps[4].getElement()));
            });
        }
    },

    /**
     * Verify removing rows from an iteration does not lose the model data.
     */
    //TODO - W-1818696 - this only fails on jenkins autointegration.  Figure out why
    _testRemoveRowWithModelData: {
        test: function(cmp) {
            var cmps = cmp.find("innerCmp");
            $A.test.assertStartsWith("one : readonly", $A.util.getText(cmps[0].getElement()));
            $A.test.assertStartsWith("two : readonly", $A.util.getText(cmps[1].getElement()));
            $A.test.assertStartsWith("three : readonly", $A.util.getText(cmps[2].getElement()));

            $A.run(function(){
                cmp.get("removeRow").get("e.press").fire();
            });
            // Wait for 2 elements- 3 original minus 1 deleted
            $A.test.addWaitFor(2, function() {
                return cmp.find("innerCmp").length;
            }, function() {
                cmps = cmp.find("innerCmp");
                $A.test.assertStartsWith("two : readonly", $A.util.getText(cmps[0].getElement()));
                $A.test.assertStartsWith("three : readonly", $A.util.getText(cmps[1].getElement()));
            });
        }
    },

    /**
     * Verify that we load the components inside the iteration the expected number of times. Once during the initial
     * load and once per inner component for a change to the iteration items.
     * 
     * Note that if the cmp or initial list to iterate over is changed this test may need to be changed accordingly.
     */
    //TODO - W-1818696 - this only fails on jenkins autointegration.  Figure out why
    _testRenderCount : {
        test : function(cmp) {
            var renderCount = window.__testRenderCount;
            // 6 total renders, 3 for each iteration
            $A.test.assertEquals(6, renderCount, "Each inner component should be rendered once on load.");

            $A.run(function(){
                cmp.get("addRow").get("e.press").fire();
            });
            $A.test.addWaitFor(4, function() {
                return cmp.find("innerCmp").length;
            }, function() {
                var renderCount = window.__testRenderCount;
                // 14 total renders, 6 for initial load, 4 additional for each iteration
                $A.test.assertEquals(14, renderCount, "Unexpected number of total items loaded after adding to list.");
            });
        }
    },

    /**
     * Verify wrapping the component in an html tag does not erase model data.
     */
    // TODO(W-1766576): cmp in iteration cannot be wrapped in html tags
    _testWrapInnerCmpInHtmlTag: {
        test: function(cmp) {
            var cmps = cmp.find("innerCmp2");
            $A.test.assertStartsWith("one : readonly", $A.util.getText(cmps[0].getElement()));
            $A.test.assertStartsWith("two : readonly", $A.util.getText(cmps[1].getElement()));
            $A.test.assertStartsWith("three : readonly", $A.util.getText(cmps[2].getElement()));
        }
    }
})
