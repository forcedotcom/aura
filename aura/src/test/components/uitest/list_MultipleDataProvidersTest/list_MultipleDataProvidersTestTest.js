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
	expectedDataProvider1Data : [{"char":"A","index":1},{"char":"B","index":2},{"char":"C","index":3},
								 {"char":"D","index":4},{"char":"E","index":5},{"char":"F","index":6},
								 {"char":"G","index":7},{"char":"H","index":8},{"char":"I","index":9},
								 {"char":"J","index":10},{"char":"K","index":11},{"char":"L","index":12},
								 {"char":"M","index":13},{"char":"N","index":14},{"char":"O","index":15},
								 {"char":"P","index":16},{"char":"Q","index":17},{"char":"R","index":18},
								 {"char":"S","index":19},{"char":"T","index":20},{"char":"U","index":21},
								 {"char":"V","index":22},{"char":"W","index":23},{"char":"X","index":24},
								 {"char":"Y","index":25}],
	expectedDataProvider2Data : [{"char":"Z","index":26},{"char":"A","index":27},{"char":"B","index":28},
								 {"char":"C","index":29},{"char":"D","index":30},{"char":"E","index":31},
								 {"char":"F","index":32},{"char":"G","index":33},{"char":"H","index":34},
								 {"char":"I","index":35},{"char":"J","index":36},{"char":"K","index":37},
								 {"char":"L","index":38},{"char":"M","index":39},{"char":"N","index":40},
								 {"char":"O","index":41},{"char":"P","index":42},{"char":"Q","index":43},
								 {"char":"R","index":44},{"char":"S","index":45},{"char":"T","index":46},
								 {"char":"U","index":47},{"char":"V","index":48},{"char":"W","index":49},
								 {"char":"X","index":50}],
	expectedInlineProvideData : [{"char":"A","index":1}],
	
	/** Test components load with mulitple data providers. 
	 */
	testMultipleDataProvidersLoad : {
		test: [function(cmp) {
			// waiting for intial items of list to load.
			this.waitForItems(cmp, 25);
		}, function(cmp) {
			// verify data from provder.
			this.verifyItems(cmp, this.expectedDataProvider1Data);
		}]
	},
	
	/** Test load data from a second data provider. 
	 */
	testGetDataFromAnotherDataProvider : {
		test: [function(cmp) {
			// waiting for intial items of list to load.
			this.waitForItems(cmp, 25);
		}, function(cmp) {
			// get data from another provider.
			this.pushButton(cmp, "btnDP2", 25, "Z");
		}, function(cmp) {
			// verify data from another provider.
			this.verifyItems(cmp, this.expectedDataProvider2Data);
		}]
	},
	
	/** Test load empty data set from a second data provider. 
	 */
	testEmptyDataFromAnotherDataProvider : {
		test: [function(cmp) {
			// waiting for intial items of list to load.
			this.waitForItems(cmp, 25);
		}, function(cmp) {
			// get data from another provider.
			this.pushButton(cmp, "btnEmpty", 0);
		}]
	},
	
	/** Test firing provide event inline. 
	 */
	testFireProvideInline : {
		test: [function(cmp) {
			// waiting for intial items of list to load.
			this.waitForItems(cmp, 25);
		}, function(cmp) {
			// get data from another provider.
			this.pushButton(cmp, "btnInline", 1);
		}, function(cmp) {
			// verify data from another provider.
			this.verifyItems(cmp, this.expectedInlineProvideData);
		}]
	},
	
	/** Test when index for data providers is out of bound. 
	 */
	testMulitpleDataProvidersIndexOutOfBound : {
		test: [function(cmp) {
			// waiting for intial items of list to load.
			this.waitForItems(cmp, 25);
		}, function(cmp) {
		    $A.test.expectAuraError("Index is out of bounds for list's data provider trigger.");
			// get data from another provider.
			this.pushButton(cmp, "btnIndex", 25);
		}, function(cmp) {
			// verify data didnt change.
			this.verifyItems(cmp, this.expectedDataProvider1Data);
			// verify no loading indicator.
			var listElement = cmp.find("list").getElement();
			$A.test.assertFalse($A.util.hasClass(listElement, "loading"), 
				"Loading indicator is still present");
		}]
	},
	
	pushButton : function(cmp, btnName, numItems, expectedItemChar) {
		var btn = cmp.find(btnName);
		btn.get("e.press").fire();
		this.waitForItems(cmp, numItems, expectedItemChar);
	},
	
	waitForItems : function(cmp, numItems, expectedItemChar) {
		$A.test.addWaitFor(true, function(){
			var finished = false;
			var items = cmp.find("list").get("v.items");
			if (expectedItemChar && numItems>0) {
				finished = (items.length === numItems) && 
					(items[0].char === expectedItemChar);
			} else {
				finished = items.length === numItems;
			}
			return finished;
		});
	},
	
	verifyItems : function(cmp, expectedItems) {
		var actualItems = cmp.find("list").get("v.items");
		
		$A.test.assertEquals(expectedItems.length, actualItems.length, 
			"Number of expected items does not equal actual items");
		
		for (var i=0; i<expectedItems.length; i++) {
			var found = false;
			var expectedItem = expectedItems[i];
			
			for (var j=0; i<actualItems.length; j++) {
				var actualItem = actualItems[j];
				if ((expectedItem["char"] === actualItem["char"]) 
					&& (expectedItem.index === actualItem.index)) {
					found = true;
					break;
				}
			}
			$A.test.assertTrue(found, "Expected item not equal to actual item at index=" + i);
		}
	}
})