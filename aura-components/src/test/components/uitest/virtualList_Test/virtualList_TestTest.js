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
  browsers: ["-IE7","-IE8"],
  
  /**************************************************HELPER FUNCTIONS**************************************************/
  
  compareArray: function(arr1, arr2, errorMessage) {
	  $A.test.assertEquals(arr1.length, arr2.length, errorMessage);
	  for (var i = 0; i < arr1.length; i++) {
		  $A.test.assertEquals(JSON.stringify(arr1[i]), JSON.stringify(arr2[i]),errorMessage)
	  }
  },
  
  getRenderedRows : function(cmp) {
	  var tbody = this.getRenderedItems();
	  var rows = [];
	  for (var j = 0; j < tbody.length; j++) {
		  var row = {};
		  row["_id"] = parseInt(this.getItemRenderedValue(tbody[j], "id"));
		  
		  row["index"] = parseInt(this.getItemRenderedValue(tbody[j], "index"));
		  row["balance"] = parseInt(this.getItemRenderedValue(tbody[j], "balance"));
		  row["name"] = this.getItemRenderedValue(tbody[j], "name");
		  row["friends"] = [];
		  for (var k = 0; k < 3; k++) {
			  row["friends"][k] = {};
			  row["friends"][k]["id"] = k;
			  row["friends"][k]["name"] = $A.test.getText(tbody[j].getElementsByTagName("li")[k]);
		  }
		  rows.push(row);
	  }
	  return rows;
  },
  
  getRenderedItems: function(){
	  return $A.test.select(".item");
  },
  
  getItemRenderedValue : function(element, columnName){
	  return $A.test.getText(element.getElementsByClassName(columnName)[0].getElementsByTagName("span")[0]);
  },
  
  getInfoButton : function(itemNumber){
	  return $A.test.select(".showItemInfo")[itemNumber-1];
  },
  
  getChangeNameButton : function(itemNumber){
	  return $A.test.select(".changeNameButton")[itemNumber-1];
  },
  
  

  /**************************************************HELPER FUNCTIONS END**************************************************/
  
  testVirtualListRenderedCorrectly : {
	  test :function(cmp) {
			  // test initial state
			  var initialData = cmp.find("list").get("v.items");
			  var renderedData = this.getRenderedRows(cmp);
			  this.compareArray(initialData, renderedData, "The grid's rendered data don't match its data model");
		  }
  },
  
  /**
   * Bug: W-2620483
   */
  _testSwappingItemsOnVirtualListRendersCorrectly : {
	  test : [function(cmp){
		  // test initial state
		  var initialData = cmp.find("list").get("v.items");
		  var renderedData = this.getRenderedRows(cmp);
		  this.compareArray(initialData, renderedData, "The grid's rendered data don't match its data model");
	  }, function(cmp) {
		  emptyDataButton = $A.test.select(".kitchenButtonEmptyData")[0];
		  $A.test.clickOrTouch(emptyDataButton);
	  }, function(cmp) {
		  $A.test.assertFalsy(this.getRenderedItems().length, "There should be no Items in the virtual List")
	  }, function(cmp) {
		  emptyDataButton = $A.test.select(".kitchenButton")[0];
		  $A.test.clickOrTouch(emptyDataButton);
	  }, function(cmp) {
		  var initialData = cmp.find("list").get("v.items");
		  var renderedData = this.getRenderedRows(cmp);
		  this.compareArray(initialData, renderedData, "The grid's rendered data don't match its data model");
    }]
  },
  
  /**
   * Verify Virtual List works with large Number of Items
   */
  testWithLargeData : {
  	  attributes : {"pageSize" : 3000},
      test : function(cmp){
    	  var initialData = cmp.find("list").get("v.items");
		  var renderedData = this.getRenderedRows(cmp);
		  this.compareArray(initialData, renderedData, "The grid's rendered data don't match its data model");
	  }
  },
  
  /**
   * Test verifying that when there is no data present dataGrid does not fail
   */
  testNoDataPresent : {
	  attributes : {"pageSize" : 0},
      test : function(cmp){
    	  $A.test.assertFalsy(this.getRenderedItems().length, "There should be no Items in the virtual List")
      }
  },
  
  /**
   * Test verifying that when there is no data present dataGrid does not fail
   */
  _testActionOnItem : {
	  test : [function(cmp){
		  var initialData = cmp.find("list").get("v.items");
		  var renderedData = this.getRenderedRows(cmp);
		  var changeNameBtn = this.getChangeNameButton(1);
		  $A.test.clickOrTouch(changeNameBtn);
	}, function(cmp) {
		  expectedString = "Expected Name Change";
		  $A.test.addWaitForWithFailureMessage(true, function(){return $A.test.contains($A.test.getText($A.test.select(".expectedNameChange")[0]), expectedString);}, "Name should be changed");
	}]
  },

})
