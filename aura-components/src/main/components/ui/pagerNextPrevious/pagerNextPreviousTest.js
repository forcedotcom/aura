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
	 * Tests to verify links on page 1
	 */
	testFirstPage: {
        attributes : {currentPage : 1, pageSize : 10, totalItems: 50},
        test: function(cmp){
        	var first = cmp.find("pager:first").getElement();
        	var previous = cmp.find("pager:previous").getElement();
        	var next = cmp.find("pager:next").getElement();
        	var last = cmp.find("pager:last").getElement();
        	$A.test.assertTrue($A.util.hasClass(first,"off"), "first Link should be disable");
        	$A.test.assertTrue($A.util.hasClass(previous,"off"), "previous Link should be disable");
        	$A.test.assertFalse($A.util.hasClass(next,"off"), "next Link should be enable");
        	$A.test.assertFalse($A.util.hasClass(last,"off"), "last Link should be enable");
        }
    },

    /**
     * Tests to verify links on last page
     */
    testLastPage: {
        attributes : {currentPage : 5, pageSize : 10, totalItems: 50},
        test: function(cmp){
        	var first = cmp.find("pager:first").getElement();
        	var previous = cmp.find("pager:previous").getElement();
        	var next = cmp.find("pager:next").getElement();
        	var last = cmp.find("pager:last").getElement();
        	$A.test.assertFalse($A.util.hasClass(first,"off"), "first Link should be enable");
        	$A.test.assertFalse($A.util.hasClass(previous,"off"), "previous Link should be enable");
        	$A.test.assertTrue($A.util.hasClass(next,"off"), "next Link should be disable");
        	$A.test.assertTrue($A.util.hasClass(last,"off"), "last Link should be disable");
        }
    },

    /**
     * Tests to verify links on middle page
     */
    testMiddlePage: {
        attributes : {currentPage : 3, pageSize : 10, totalItems: 50},
        test: function(cmp){
        	var first = cmp.find("pager:first").getElement();
        	var previous = cmp.find("pager:previous").getElement();
        	var next = cmp.find("pager:next").getElement();
        	var last = cmp.find("pager:last").getElement();
        	$A.test.assertFalse($A.util.hasClass(first,"off"), "first Link should be enable");
        	$A.test.assertFalse($A.util.hasClass(previous,"off"), "previous Link should be enable");
        	$A.test.assertFalse($A.util.hasClass(next,"off"), "next Link should be enable");
        	$A.test.assertFalse($A.util.hasClass(last,"off"), "last Link should be enable");
        }
    },

    /**
     * Test to verify default behavior when no attribute values are set
     */
    testWithoutPassingAttributesValues: {
        test: function(cmp){
        	var first = cmp.find("pager:first").getElement();
        	var previous = cmp.find("pager:previous").getElement();
        	var next = cmp.find("pager:next").getElement();
        	var last = cmp.find("pager:last").getElement();
        	$A.test.assertTrue($A.util.hasClass(first,"off"), "first Link should be disable");
        	$A.test.assertTrue($A.util.hasClass(previous,"off"), "previous Link should be disable");
        	$A.test.assertTrue($A.util.hasClass(next,"off"), "next Link should be disable");
        	$A.test.assertTrue($A.util.hasClass(last,"off"), "last Link should be disable");
        }
    },

    testFilterListWithJustOnePage: {
        attributes : {currentPage : 1, pageSize : 25 ,totalItems: 10},
        test: function(cmp){
        	var first = cmp.find("pager:first").getElement();
        	var previous = cmp.find("pager:previous").getElement();
        	var next = cmp.find("pager:next").getElement();
        	var last = cmp.find("pager:last").getElement();
        	$A.test.assertTrue($A.util.hasClass(first,"off"), "first Link should be disable");
        	$A.test.assertTrue($A.util.hasClass(previous,"off"), "previous Link should be disable");
        	$A.test.assertTrue($A.util.hasClass(next,"off"), "next Link should be disable");
        	$A.test.assertTrue($A.util.hasClass(last,"off"), "last Link should be disable");
        }
    },

    /**
     * Test exception is thrown when negative values are passed
     */
    testWithNegativeValues: {
        attributes : {currentPage : -1, pageSize : -25 ,totalItems: -10},
        test: function(){
        	//Should throw error: TODO: W-1562449
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
    	attributes : {currentPage : 1, pageSize : 10, totalItems: 55},
        test: function(cmp){
        	var startIndex = cmp.get('v.startIndex');
        	$A.test.assertEquals(1, startIndex + 1, "Index of the first item on the page should be 1");

            var endIndex = cmp.get('v.endIndex');
            $A.test.assertEquals(10, endIndex + 1, "Index of the last item on the page should be 10");

            var pageCount = cmp.get('v.pageCount');
        	$A.test.assertEquals(6, pageCount, "Total Number of pages should be 6");
        }
    },

    testCalculatedFieldsForLastPage: {
    	attributes : {currentPage : 6, pageSize : 10, totalItems: 55},
        test: function(cmp){
        	var startIndex = cmp.get('v.startIndex');
        	$A.test.assertEquals(51, startIndex + 1, "Index of the first item on the page should be 51");

            var endIndex = cmp.get('v.endIndex');
            $A.test.assertEquals(55, endIndex + 1, "Index of the last item on the page should be 55");

            var pageCount = cmp.get('v.pageCount');
        	$A.test.assertEquals(6, pageCount, "Total Number of pages should be 6");
        }
    }
/*eslint-disable semi*/
})
/*eslint-enable semi*/
