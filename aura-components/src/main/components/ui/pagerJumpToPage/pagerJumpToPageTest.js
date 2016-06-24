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
            this.verifyLabels(cmp, "Page ", " of ");
        }
    },

    /**
     * Verify that user can set their own labels for page info
     */
    testCustomLabels: {
        attributes: { Labels_Page: "pagepage ", Labels_Of: " ofof " },
        test: function(cmp) {
            this.verifyLabels(cmp, "pagepage ", " ofof ");
        }
    },

    /**
     * Verify page count label reflects the correct page count
     */
    testPageCountLabel: {
        attributes: { pageSize: 10, totalItems: 55 },
        test: function(cmp) {
            var pageCountLabel = cmp.find("pager:pageCount").getElement();
            $A.test.assertEquals("6", $A.test.getText(pageCountLabel),
                    "Page count label should be 6");
        }
    },

    /**
     * Verify that entering a number within pageCount range
     * should set the current page number
     */
    testUpdateCurrentPage: {
        attributes: { totalItems: 100, pageSize: 10 },
        test: [function(cmp) {
            // check initial page is page 1
            var pageInputElm = cmp.find("pager:pageInput").getElement();
            $A.test.assertEquals("1", pageInputElm.value);
            // jump to a page within range should work
            this.updateCurrentPage(cmp, 3);
            this.waitForCurrentPage(cmp, 3);
        }, function(cmp) {
            // jump to a negative page should reset back to prev page
            this.updateCurrentPage(cmp, -1);
            this.waitForCurrentPage(cmp, 3);
        }, function(cmp) {
            // jump to a page out of range should reset back to prev page
            this.updateCurrentPage(cmp, 20);
            this.waitForCurrentPage(cmp, 3);
        }]
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
    },

    verifyLabels: function(cmp, expLabelPage, expLabelOf) {
        var mainLabelElm = cmp.getElement().querySelector("label");
        var actLabelPage = $A.test.getText(mainLabelElm.childNodes[0]);
        var actLabelOf   = $A.test.getText(mainLabelElm.childNodes[2]);
        $A.test.assertEquals(expLabelPage, actLabelPage);
        $A.test.assertEquals(expLabelOf, actLabelOf);
    },

    waitForCurrentPage: function(cmp, currentPage) {
        var pageInputElm = cmp.find("pager:pageInput").getElement();
        $A.test.addWaitForWithFailureMessage(true, function() {
            return pageInputElm.value === currentPage.toString()
                && cmp.get("v.currentPage") === currentPage;
        }, "v.currentPage and Input for current page should both be " + currentPage);
    },

    updateCurrentPage: function(cmp, newPage) {
        var pageInputElm = cmp.find("pager:pageInput").getElement();
        pageInputElm.value = newPage;
        $A.test.fireDomEvent(pageInputElm, "change");
    }
})//eslint-disable-line semi
