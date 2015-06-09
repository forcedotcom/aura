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
	  var tbody = document.getElementsByClassName("item");
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
  
  getItemRenderedValue : function(element, columnName){
	  return $A.test.getText(element.getElementsByClassName(columnName)[0].getElementsByTagName("span")[0]);
  },
  

  /**************************************************HELPER FUNCTIONS END**************************************************/
  
  testVirtualListRenderedCorrectly : {
	  test :function(cmp) {
			  // test initial state
			  var initialData = cmp.find("list").get("v.items");
			  var renderedData = this.getRenderedRows(cmp);
			  this.compareArray(initialData, renderedData, "The grid's rendered data don't match its data model");
		  }
  }
})
