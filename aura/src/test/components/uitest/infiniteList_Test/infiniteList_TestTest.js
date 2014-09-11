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
	 * Test able to grab and display more data from provider.
	 */
	testShowMoreData : {
		test: [function(cmp) {
			// waiting for intial items of list to load.
			this.waitForItems(cmp, 25);
		}, function(cmp) {
			// more items should be fetched and displayed.
			this.pushButton(cmp, "btnShowMore", 50);
		}]
	},
	
	/**
	 * Test showMore invokes callBack
	 * Test case:W-2294810
	 */
	testShowMoreInvokesCallback : {
		test: [function(cmp) {
			// waiting for intial items of list to load.
			this.waitForItems(cmp, 25);
		}, function(cmp) {
			// more items should be fetched and displayed.
			$A.test.assertFalse(cmp.get("v.showMoreCallback"),"callback for showMore should not be invoked");
			this.pushButton(cmp, "btnShowMore", 50);
	        $A.test.addWaitForWithFailureMessage(true, function(){return cmp.get("v.showMoreCallback");}, "callback should be invoked after pressing showMore");
		}]
	},
	
	/**
	 * Test refresh list.
	 */
	testRefreshList : {
		test: [function(cmp) {
			// waiting for intial items of list to load.
			this.waitForItems(cmp, 25);
		}, function(cmp) {
			// more items should be fetched and displayed.
			this.pushButton(cmp, "btnShowMore", 50);
		}, function(cmp) {
			// clicking refresh bring list back to initial items.
			this.pushButton(cmp, "btnRefresh", 25);
		}]
	},
	
	/**
	 * Test refresh invokes callback.
	 * Test case:W-2294810
	 */
	testRefreshListInvokesCallback : {
		test: [function(cmp) {
			// waiting for intial items of list to load.
			this.waitForItems(cmp, 25);
		}, function(cmp) {
			// more items should be fetched and displayed.
			this.pushButton(cmp, "btnShowMore", 50);
		}, function(cmp) {
			// clicking refresh bring list back to initial items.
			$A.test.assertFalse(cmp.get("v.refreshCallBack"),"Callback for Refresh should not be invoked");
	        this.pushButton(cmp, "btnRefresh", 25);
	        $A.test.addWaitForWithFailureMessage(true, function(){return cmp.get("v.refreshCallBack");}, "callback should be invoked after pressing refresh");
		}]
	},
	
	/**
	 * Test when a negative page size is given 
	 */
	testNegativePageSize : {
		attributes : {pageSize : -5},
		test: function(cmp) {
			// waiting for intial items of list to load.
			this.waitForItems(cmp, 0);
		}
	},
	
	/**
	 * Test when a negative page size is given 
	 */
	testNegativeCurrentPage : {
		attributes : {currentPage : -5},
		test: [function(cmp) {
			// waiting for intial items of list to load.
			this.waitForItems(cmp, 25);
		}, function(cmp) {
			// more items should be fetched and displayed.
			this.pushButton(cmp, "btnShowMore", 50);
		}]
	},
	
	pushButton : function(cmp, btnName, numItems) {
		var btn = cmp.find(btnName);
		btn.get("e.press").fire();
		this.waitForItems(cmp, numItems);
	},
	
	waitForItems : function(cmp, numItems) {
		$A.test.addWaitFor(numItems, function(){
			return cmp.find("list").get("v.items").length;
		});
	}
	
})