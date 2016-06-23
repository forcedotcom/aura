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
    OPTIONS: ["10", "25", "50", "100", "200"],

    /**
     * Verify the value of default label
     */
    testDefaultRecordLabel: {
        test: function() {
            var labelElm = $A.test.select(".uiLabel span")[0];
            $A.test.assertEquals("Records per page: ", $A.test.getText(labelElm));
        }
    },

    /**
     * Verify that label can be set to a different value
     */
    testCustomRecordLabel: {
        attributes: { Labels_Records: "test: " },
        test: function() {
            var labelElm = $A.test.select(".uiLabel span")[0];
            $A.test.assertEquals("test: ", $A.test.getText(labelElm));
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
     * Verify the available page size options
     */
    testPageSizeOptions: {
        test: function(cmp) {
            var actOptions = this.getPageSizeOptions(cmp);
            var expOptions = this.OPTIONS;

            $A.test.assertEquals(expOptions.length, actOptions.length,
                    "There should be " + expOptions.length + " available page size options");

            for (var i = 0; i < expOptions.length; i++) {
                $A.test.assertEquals(expOptions[i], actOptions[i]);
            }
        }
    },

    /**
     * Verify that picking an option in <select> sets v.pageSize
     */
    testSelectOptionSetPageSize: {
        test: function(cmp) {
            var initOption = this.OPTIONS[0],
                newOption  = this.OPTIONS[1],
                selectElm  = this.getPageSizeSelectElm(cmp);

            $A.test.assertEquals(initOption, cmp.get("v.pageSize"),
                    "v.pageSize should be " + initOption);

            this.selectOption(selectElm, newOption, function() {
                $A.test.assertEquals(newOption, cmp.get("v.pageSize"),
                        "v.pageSize should be " + newOption);
            });
        }
    },

    /**
     * Verify that v.pageSize cannot be set programmatically. It can only be
     * set via the inputSelect of the component
     */
    testPageSizeNotSettable: {
        attributes: {pageSize: 50},
        test: [function(cmp) {
            // passing value to v.pageSize should not work
            $A.test.assertEquals("10", cmp.get("v.pageSize"),
                    "v.pageSize should not be settable and should equal to default value 10");
            // try setting v.pageSize
            cmp.set("v.pageSize", 25);
        }, function(cmp) {
            // setting v.pageSize should not work as well
            $A.test.assertEquals("10", cmp.get("v.pageSize"),
                    "v.pageSize should not be settable and should equal to default value 10");
        }]
    },

    /**
     * verify all calculated fields are correct
     */
    testCalculatedFieldsForFirstPage: {
        attributes: {currentPage: 1, totalItems: 55},
        test: function(cmp){
            this.verifyCalculatedFields(cmp, {startIndex: 0, endIndex: 9, pageCount: 6});
        }
    },

    testCalculatedFieldsForLastPage: {
        attributes: {currentPage: 6, totalItems: 55},
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

    // select option and wait for the option value to be updated
    selectOption: function(selectElm, newOption, cb) {
        var options = selectElm.options;
        for(var i = 0; i < options.length; i++) {
            if(newOption === options[i].value) {
                options[i].selected = true;
                break;
            }
        }
        // this fires the change event so that setValue is called
        $A.test.fireDomEvent(selectElm, "change");
        // wait for the option value to be updated
        $A.test.addWaitForWithFailureMessage(newOption, function() {
            return selectElm.value;
        }, "Failed to select option!", cb);
    },

    // get the select element with all the page size options
    getPageSizeSelectElm: function(cmp) {
        return cmp.getElement().getElementsByTagName("select")[0];
    },

    // get the list of available page size options
    getPageSizeOptions: function(cmp) {
        var options = cmp.getElement().getElementsByTagName("option");
        var optionValues = [];
        for (var i = 0; i < options.length; i++) {
            optionValues.push(options[i].value);
        }
        return optionValues;
    }
})//eslint-disable-line semi
