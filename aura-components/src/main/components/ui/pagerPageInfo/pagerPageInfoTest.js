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
     * Verify the values of default labels
     */
    testDefaultLabels: {
        test: function(cmp) {
            $A.test.assertEquals("0 - 0 of 0", $A.test.getTextByComponent(cmp));
        }
    },

    /**
     * Verify that user can set their own labels for page info
     */
    testCustomLabels: {
        attributes: { Labels_To: " toto ", Labels_Of: " ofof " },
        test: function(cmp) {
            $A.test.assertEquals("0 toto 0 ofof 0", $A.test.getTextByComponent(cmp));
        }
    },

    /**
     * Verify that page info is correctly displaying the right numbers
     */
    testInfoDisplayed: {
        attributes: { totalItems: 100, pageSize: 10, currentPage: 2 },
        test: function(cmp) {
            $A.test.assertEquals("11 - 20 of 100", $A.test.getTextByComponent(cmp));
        }
    },

    /**
     * Verify that when totalItems = 0, cmp should have class 'empty'
     */
    testZeroItemCSS: {
        attributes: { totalItems: 0 },
        test: function(cmp) {
            $A.test.assertTrue($A.util.hasClass(cmp.getElement(), "empty"),
                    "Element should have class 'empty' when totalItems is 0");
        }
    },

    /**
     * Default Page size should be 25
     */
    testDefaultPageSize: {
        test: function(cmp){
            var pageSize = cmp.get('v.pageSize');
            $A.test.assertEquals(25, pageSize, "Default Page size should be 25");
        }
    },

    /**
     * verify all calculated fields are correct
     */
    testCalculatedFieldsForFirstPage: {
        attributes: {currentPage: 1, pageSize: 10, totalItems: 55},
        test: function(cmp){
            this.verifyCalculatedFields(cmp, {startIndex: 0, endIndex: 9, pageCount: 6});
        }
    },

    testCalculatedFieldsForLastPage: {
        attributes: {currentPage: 6, pageSize: 10, totalItems: 55},
        test: function(cmp){
            this.verifyCalculatedFields(cmp, {startIndex: 50, endIndex: 54, pageCount: 6});
        }
    },

    /****************************************************************
     * Helper Functions
     ****************************************************************/
    verifyCalculatedFields: function(cmp, expected) {
        var startIndex = cmp.get('v.startIndex');
        $A.test.assertEquals(expected.startIndex, startIndex,
                "Index of the first item on the page should be " + expected.startIndex);

        var endIndex = cmp.get('v.endIndex');
        $A.test.assertEquals(expected.endIndex, endIndex,
                "Index of the last item on the page should be " + expected.endIndex);

        var pageCount = cmp.get('v.pageCount');
        $A.test.assertEquals(expected.pageCount, pageCount,
                "Total Number of pages should be " + expected.pageCount);
    }
})//eslint-disable-line semi
