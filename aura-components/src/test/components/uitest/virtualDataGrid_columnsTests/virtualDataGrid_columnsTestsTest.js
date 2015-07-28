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
  
  /**
   * Function that will create the expected data for the expected headers
   */ 
  getExpectedData : function(){
	var elements = [], 
	    values = [],
	    keys = [],
	    inBetweenValues=[],
	    skipItem = -1,
	    arrayValue;
	 		
		values = ["", "Foo ", "2014-01-01 ", "John Doe ", "Acme "];
		keys   = ['id', 'subject', 'date', 'name', 'relatedTo'];
	
	for(var i = 0; i < 10; i++){
		inBetweenValues=[];
		
		for(var j = 0; j < values.length; j++){
			if(skipItem !== j){
				arrayValue = values[j]+""+(i+1);
			}
			else{
				arrayValue = undefined;
			}
			inBetweenValues.push(arrayValue);
		}
		elements.push(inBetweenValues);
	}
	return {"keys" : keys,  "values" : elements };
  },
  
  /**
   * Verify that each row element is correct and does what we want it to
   *
   */
  verifyRow : function(domRow, expectedValues, cmpRow, assertFunc, isDecending){
	  if (!$A.util.isUndefinedOrNull(expectedValues) && isDecending) {
		  expectedValues = {"keys":expectedValues.keys,  "values":expectedValues.values.reverse()};
	  }
	  
      var keys = expectedValues["keys"];
      var expectedRows = expectedValues["values"];
      var tds = null;
      var currExpectedRow = null;
      var currCmpRow = null;

      for(var i = 0; i < domRow.length; i++){
    	  tds = domRow[i].getElementsByTagName("td");
    	  currCmpRow = cmpRow[i];
    	  currExpectedRow = expectedRows[i];
    	  for(var j = 0; j < keys.length; j++){
    		  assertFunc($A.util.getText(tds[j]), ""+currExpectedRow[j], ""+currCmpRow[keys[j]], keys.length-1 == j);
    	  }
      }
  },
   
  /**
   * Verify sortable headers
   */
  verifySortableHeaders : function(expectedSortableHeaders) {
	  var sortableHeadersRendered = $A.test.getElementByClass("toggle");
	  
	  for (var i=0; i<sortableHeadersRendered.length; i++) {
		  var header = sortableHeadersRendered[i];
		  var headerText = $A.test.getText(header);
		  var foundColIndex = -1;
		  
		  for (var j=0; j<expectedSortableHeaders.length; j++) {
			  var expectedHeader = expectedSortableHeaders[j].name;
			  if (headerText.toUpperCase().indexOf(expectedHeader) >= 0) {
				  foundColIndex = j;
				  break;
			  }
		  }
		  
		  if (foundColIndex >= 0) {
			  var expectedHeader = expectedSortableHeaders[foundColIndex];
			  
			  if (expectedHeader.isEnabled) {
				  var expectedSort = expectedHeader.sort;
				  var actualSort = $A.test.getText(header.getElementsByTagName("span")[0]).toUpperCase();
				  $A.test.assertEquals(expectedSort, actualSort , "Sort direction incorrect");
			  } else {
				  var headerClass = $A.util.getElementAttributeValue(header, "class");
				  $A.test.assertEquals("toggle disabled", headerClass, "header should have been disalbed");  
			  }
		  } else {
			  $A.test.fail("Could not find '" + headerText + "' in list of expected columns");
		  }
	  }
  },
  
  /**
   * Toggle sortable column's sort order
   */
  toggleSortForSortableColumn: function(colNum, expectedSortOrder) {
	  var sortableColumns = $A.test.getElementByClass("toggle");
	  var target = sortableColumns[(colNum-1)];
	  var parent = target.parentNode;
	  var origClassName = $A.util.getElementAttributeValue(parent, "class");
	  $A.test.clickOrTouch(sortableColumns[--colNum]);
	  $A.test.addWaitForWithFailureMessage(true, function() {
		//  expectedSortOrder = " descending";//added
		//  return (origClassName !== $A.util.getElementAttributeValue(parent, "class"));
		// debugger;
		  return ($A.util.hasClass(parent, expectedSortOrder));
	  },"The class should be" + expectedSortOrder); 
  },
  
  /**
   * function that will retrieve all the elements that are sorted (class is either 'ascending' or 'descending' or both)
   */
  getCurrentSortElement: function() {
	  var ascendingElements = $A.test.getElementByClass("ascending");
	  var descendingElements = $A.test.getElementByClass("descending");
	  var allSortedElements;
	  if(ascendingElements && descendingElements){ // if there are both ascending and descending elements
		  allSortedElements = ascendingElements.concat(descendingElements); //merge all ascending and descending elements
	  }
	  else if(ascendingElements){  // if there are only ascending elements
		  allSortedElements = ascendingElements;
	  }
	  else if(descendingElements){  // if there are only descending elements
		  allSortedElements = descendingElements;
	  }
	  else{
		  allSortedElements = null;
	  }
	  return allSortedElements;
  },
  
  /**
   * function that will check that the expected element is sorted
   */
  verifySortedElements: function(expectedNumberOfElements,expectedElementToBeSorted) {
	  
	  allSortedElements = this.getCurrentSortElement(); //gets all elements with class being either 'ascending' or 'descending' or both
	  if(allSortedElements) //if there is at least one element that is sorted
	  {
		  length = allSortedElements.length;	
		  // assert that the correct element is sorted
		  $A.test.assertEquals(0, $A.test.getText(allSortedElements[0]).toUpperCase().indexOf(expectedElementToBeSorted), "Wrong element is sorted");
	  }			  
	  else //when no element is sorted (initial case when page loads)
		  length = 0;
	  
	  //assert correct number of elements are sorted - 0:initially, 1:remaining cases
	  $A.test.assertEquals(expectedNumberOfElements, length, "Number of sorted classes do not match");
	  		   
  },
  
  
   /**
     * function that will only get the elements that are not comments
     */
    getOnlyTrs : function(elements){
      var elementArray = [];
      
       for(var i = 0; i < elements.length; i++){
          if(elements[i].tagName != "!"){
            elementArray.push(elements[i]);
          }
       }
      return elementArray;
    },
  
  /**
   * get specific row elements
   */ 
  getRowElements : function(cmp, colCount){
            var tbody = document.getElementsByTagName("tbody")[0];
            var trs = this.getOnlyTrs(tbody.children);
            var itemsInBody =  cmp.find("grid").get("v.items");

            $A.test.assertEquals(colCount, trs.length, "The total amount of items on the page are incorrect");
            $A.test.assertEquals(colCount, itemsInBody.length, "The total amount of elements in v.items is incorrect");

            return [trs, itemsInBody];
  },
  
  /**
   * Make sure that the body that has been rendered is correct. This will check both internal and external variables
   */
  verifyBodyElements : function(cmp, expectedElements, assertFunc, isDecending){
      var trs = this.getRowElements(cmp, 10);
      
      var body_rendered = trs[0];
      var body_internal = trs[1];
      
      if($A.util.isUndefinedOrNull(assertFunc)){
    	  assertFunc = function(td, expectedDomRow, currCmpRow){
    		  $A.test.assertEquals(td, expectedDomRow, "Row element data does not match what it should be");
              $A.test.assertEquals(""+currCmpRow, expectedDomRow, "Row data stored in cmp data does not match what it should be");
    	  };
      }
      this.verifyRow(body_rendered, expectedElements ,body_internal, assertFunc, isDecending);
  },
 


  /**************************************************HELPER FUNCTIONS END**************************************************/
  
  testRowHeaders : {
	  attributes : {"useRowHeaders" : true },
	  test : function(cmp) {
		  var tbody = document.getElementsByTagName("tbody")[0],
		      rowElements = this.getOnlyTrs(tbody.children);
		  
		  for (var i = 0; i < rowElements.length; ++i) {
			  var tagName = rowElements[i].firstChild.tagName.toLowerCase();
			  $A.test.assertEquals("th", tagName, "Row Header tag is incorrect");
			  
			  var scope = rowElements[i].firstChild.getAttribute("scope");
			  $A.test.assertEquals("row", scope, "Scope attribute on row header tag is incorrect");
		  }
	  }
  },
  
  /*
   * Test sortable headers: mark the appropriate header as sorted and remaining as unsorted
   */
  testSortableColumns : {
	  attributes : {"sortBy" : "id"},
	  test : [function(cmp) {
		  
			  // test initial sort			 
			  expectedSortableColumns = [{name:"ID",sort:"",isEnabled:true}, {name:"SUBJECT",sort:"",isEnabled:true}];
			  this.verifySortableHeaders(expectedSortableColumns);			  
			  this.verifyBodyElements(cmp, this.getExpectedData());
			  
			  // check that no elements are sorted
			  expectedNumberOfElements = 0;  // since initially none of the columns are sorted
			  expectedElementToBeSorted = "";
			  this.verifySortedElements(expectedNumberOfElements, expectedElementToBeSorted); 	
			  
			  // test toggling/clicking 2nd sortable column
			  expectedSort = "descending";
			  columnNumber = 2;
			  this.toggleSortForSortableColumn(columnNumber,expectedSort);
				
		  }, function(cmp) {
			  
			  //check if only 2nd column is sorted
			  expectedElementToBeSorted = "SUBJECT"; // since we toggled/clicked column no.2
			  expectedNumberOfElements = 1; // test will now have 1 class having either 'ascending' or 'descending'
			  this.verifySortedElements(expectedNumberOfElements, expectedElementToBeSorted);  	  
						  
			  expectedSortableColumns = [{name:"ID",sort:"",isEnabled:true}, {name:"SUBJECT",sort:"DESCENDING",isEnabled:true}];
			  this.verifySortableHeaders(expectedSortableColumns);
			  this.verifyBodyElements(cmp, this.getExpectedData(), null, true);
			  
			  // test toggling sort order on same column
			  expectedSort = "ascending";
			  columnNumber = 2;
			  this.toggleSortForSortableColumn(columnNumber, expectedSort);
				 
			  	
		  }, function(cmp) {
			  
			  // check if only 2nd column is sorted
			  expectedElementToBeSorted = "SUBJECT";
			  expectedNumberOfElements = 1; //test will now have 1 class having either 'ascending' or 'descending'
			  this.verifySortedElements(expectedNumberOfElements, expectedElementToBeSorted);  
			  
			  expectedSortableColumns = [{name:"ID",sort:"",isEnabled:true}, {name:"SUBJECT",sort:"ASCENDING",isEnabled:true}];
			  this.verifySortableHeaders(expectedSortableColumns);
			  this.verifyBodyElements(cmp, this.getExpectedData());
			  
			  // test switching sort order to another column 
			  expectedSort = "descending";
			  columnNumber = 1;
			  this.toggleSortForSortableColumn(columnNumber, expectedSort);
				
			  
		  }, function(cmp) {
			  
			  // check if only 1st column is sorted
			  expectedElementToBeSorted = "ID";
			  expectedNumberOfElements = 1; //test will now have 1 class having either 'ascending' or 'descending'
			  this.verifySortedElements(expectedNumberOfElements, expectedElementToBeSorted);  
			  
			  expectedSortableColumns = [{name:"ID",sort:"DESCENDING",isEnabled:true}, {name:"SUBJECT",sort:"",isEnabled:true}];
			  this.verifySortableHeaders(expectedSortableColumns);
			  this.verifyBodyElements(cmp, this.getExpectedData(), null, true);
	  }]
  }
  
})