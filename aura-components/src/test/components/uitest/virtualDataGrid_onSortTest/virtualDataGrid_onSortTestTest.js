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
  
  ASSISTIVE_SORT_TEXT : "Sort",
  
  /**************************************************HELPER FUNCTIONS**************************************************/
  
  compare: function(sortBy) {
  	if (sortBy.indexOf("id") >=0 || sortBy.indexOf("age") >= 0) {
  		return function(item1, item2) {
      		if (sortBy.indexOf("-") == 0) {
      			return -1 * (item1[sortBy.substring(1)] - item2[sortBy.substring(1)]);
      		} else {
      			return item1[sortBy] - item2[sortBy]; 
      		}
      	}
  	} else {
  	    return function(item1, item2) {
  		    if (sortBy.indexOf("-") == 0) {
  			    return -1 * (item1[sortBy.substring(1)].localeCompare(item2[sortBy.substring(1)]));
  		    } else {
  			    return item1[sortBy].localeCompare(item2[sortBy]); 
  		    }
  	    }
  	}
  },
  
  compareArray: function(arr1, arr2, errorMessage) {
	  $A.test.assertEquals(arr1.length, arr2.length, errorMessage);
	  for (var i = 0; i < arr1.length; i++) {
		  this.compareObj(arr1[i], arr2[i], errorMessage);
	  }
  },
  
  compareObj: function(obj1, obj2, errorMessage) {
      
	  for (prop in obj1) {
    	  if (obj1.hasOwnProperty(prop)) {
    	      $A.test.assertEquals(obj1[prop], obj2[prop], errorMessage);
    	  }
      }
      
  },
  
  // TODO: This needs to be made less dependent on header implementation
  getRenderedRows : function(cmp) {
	  var thead = document.getElementsByTagName("thead")[0];
	  var headers = [];
	  var ths = thead.getElementsByTagName("th");
	  for (var i = 0; i < ths.length; i++) {
		  if (ths[i].childNodes[1].nodeType == 3) { // text node
			  headers.push($A.test.getText(ths[i]).toLowerCase());
		  } else {
			  headers.push($A.test.getText(ths[i].childNodes[1].childNodes[1]).toLowerCase());
		  }
	  }

	  var tbody = document.getElementsByTagName("tbody")[0];
	  var rows = [];
	  var trs = tbody.children;
	  for (var j = 0; j < trs.length; j++) {
		  var row = {};
		  var spans = trs[j].getElementsByTagName("span");
		  for (var k = 0; k < spans.length; k++) {
			  row[headers[k]] = $A.test.getText(spans[k]);
		  }
		  rows.push(row);
	  }
	  return rows;
  },
  
  getColumnDirection : function(index) {
	  var thead = document.getElementsByTagName("thead")[0];
	  var ths = thead.getElementsByTagName("th");
	  var anchor = ths[index].children[0];
	  if (anchor.nodeType != 3) {
		  return $A.test.getText(anchor.getElementsByTagName("span")[1]);
	  }
	  return "";
  },


  /**************************************************HELPER FUNCTIONS END**************************************************/
  
  
  /*
   * Test sorting
   */
  testSorting : {
	  attributes : {"sortBy" : "id"},
	  test : [function(cmp) {
			  // test initial state
			  var initialData = cmp.find("provider").getModel().get("items");
			  var renderedData = this.getRenderedRows(cmp);
			  this.compareArray(initialData, renderedData, "The grid's rendered data don't match its data model");
		  }, function(cmp) {
			  //click id header (sort on -id)
			  var headerCols = $A.test.getElementByClass("toggle");
			  var output = cmp.find("sortBy").getElement();
			  $A.test.clickOrTouch(headerCols[0]);
			  $A.test.addWaitForWithFailureMessage("-id", function() {
					return $A.test.getText(output);
		      }, "The sort order should be id descending");			  	
		  }, function(cmp) {
			  // click on name, 
			  var headerCols = $A.test.getElementByClass("toggle");
			  var output = cmp.find("sortBy").getElement();
			  $A.test.clickOrTouch(headerCols[1]);
			  $A.test.addWaitForWithFailureMessage("-name", function() {
					return $A.test.getText(output);
		      }, "The sort order should be name descending");		  
		  }, function(cmp) {
			  // click on age
			  var headerCols = $A.test.getElementByClass("toggle");
			  var output = cmp.find("sortBy").getElement();
			  $A.test.clickOrTouch(headerCols[3]);
			  $A.test.addWaitForWithFailureMessage("-age", function() {
				    return $A.test.getText(output);
		      }, "The sort order should be age descending");
	      }, function(cmp) {
			  // click on age again
			  var headerCols = $A.test.getElementByClass("toggle");
			  var output = cmp.find("sortBy").getElement();
			  $A.test.clickOrTouch(headerCols[3]);
			  $A.test.addWaitForWithFailureMessage("age", function() {
				    return $A.test.getText(output);
		      }, "The sort order should be age ascending");
	      }, function(cmp) {
			  //click on id header again (sort on -id)
			  var headerCols = $A.test.getElementByClass("toggle");
			  var output = cmp.find("sortBy").getElement();
			  $A.test.clickOrTouch(headerCols[0]);
			  $A.test.addWaitForWithFailureMessage("-id", function() {
					return $A.test.getText(output);
		      }, "The sort order should be id descending");			  	
		  }, function(cmp) {
			  // test the sorted result
	    	  var initialData = cmp.find("provider").getModel().get("items");
	    	  var output = cmp.find("sortBy").getElement();
			  var sortBy = $A.test.getText(output);
	    	  var sortedData = initialData.sort(this.compare(sortBy));
			  var renderedData = this.getRenderedRows(cmp);
			  this.compareArray(sortedData, renderedData, "Wrong sorted data");
	      }, function(cmp) {
			  // test aura:method sort
	    	  cmp.find("grid").sort("-name");
	    	  var that = this;
	    	  $A.test.addWaitForWithFailureMessage("sorted descending", function() {
				  return that.getColumnDirection(1).toLowerCase();
		      }, "Method sort does not work correctly");	
	      }, function(cmp) {
			  // test initialDirectionOnSort on gender
			  var headerCols = $A.test.getElementByClass("toggle");
			  var output = cmp.find("sortBy").getElement();
			  $A.test.clickOrTouch(headerCols[2]);
			  $A.test.addWaitForWithFailureMessage("gender", function() {
				    return $A.test.getText(output);
		      }, "The sort order should be gender ascending");
		  }]
  }
  
})
