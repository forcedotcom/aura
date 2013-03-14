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
	/**
	 * Tests to verify links on page 1
	 */
	testFirstPage: {
        attributes : {currentPage : 1, pageSize : 10, totalItems: 50},
        test: function(cmp){
        	first = cmp.find("pager:first").getElement();
        	previous = cmp.find("pager:previous").getElement();
        	next = cmp.find("pager:next").getElement();
        	last = cmp.find("pager:last").getElement();
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
        	first = cmp.find("pager:first").getElement();
        	previous = cmp.find("pager:previous").getElement();
        	next = cmp.find("pager:next").getElement();
        	last = cmp.find("pager:last").getElement();
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
        	first = cmp.find("pager:first").getElement();
        	previous = cmp.find("pager:previous").getElement();
        	next = cmp.find("pager:next").getElement();
        	last = cmp.find("pager:last").getElement();
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
        	first = cmp.find("pager:first").getElement();
        	previous = cmp.find("pager:previous").getElement();
        	next = cmp.find("pager:next").getElement();
        	last = cmp.find("pager:last").getElement();
        	$A.test.assertTrue($A.util.hasClass(first,"off"), "first Link should be disable");
        	$A.test.assertTrue($A.util.hasClass(previous,"off"), "previous Link should be disable");
        	$A.test.assertTrue($A.util.hasClass(next,"off"), "next Link should be disable");
        	$A.test.assertTrue($A.util.hasClass(last,"off"), "last Link should be disable");
        }
    },
    
    testFilterListWithJustOnePage: {
        attributes : {currentPage : 1, pageSize : 25 ,totalItems: 10},
        test: function(cmp){
        	first = cmp.find("pager:first").getElement();
        	previous = cmp.find("pager:previous").getElement();
        	next = cmp.find("pager:next").getElement();
        	last = cmp.find("pager:last").getElement();
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
        test: function(cmp){
        	//Should throw error: TODO: W-1562449
        }
    }
})