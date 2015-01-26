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
  Browsers: ["-IE7","-IE8"],
	  
  EXPECTED_5    : ['Id', 'Subject', 'Name', 'RelatedTo', 'Due Date'],
  EXPECTED_2    : ['Item Id', 'Item Subject'],
  EXPECTED_1    : ['Name'],
  EXPECTED_2_1  : ['Item Id', 'Item Subject', "Name"],
  EXPECTED_ADD  : ['Due Date'],
  
  /**************************************************HELPER FUNCTIONS**************************************************/
  
  /**
   * Function that will extract firing the button
   */
  fireButton : function(cmp, buttonId){
     var button = cmp.find(buttonId).getElement();
     $A.test.clickOrTouch(button);
  },
  /**
   * Function that will create the expected data for the expected headers
   */ 
  getExpectedData : function(baseElement){
	var elements = [], 
	    values = [],
	    keys = [],
	    inBetweenValues=[],
	    skipItem = -1,
	    arrayValue;
	if(baseElement === "6"){
		values = ["", "Foo ", "John Doe ", "Acme ", ""];
		keys   = ['id', 'subject', 'name', 'relatedTo', 'Date'];
		skipItem = 4;
	}
	else if(baseElement === "5"){
		values = ["", "Foo ", "John Doe ", "Acme ", "2014-01-01 "];
		keys   = ['id', 'subject', 'name', 'relatedTo', 'date'];
	}
	else if (baseElement === "2"){
		values = ["", "Foo "];
		keys   = ['id', 'subject'];
	}
	else if (baseElement === "1"){
		values = ["John Doe "];
		keys   = ['name'];
	}
	else{
		values = ["2014-01-01 "];
		keys   = ['date'];
	}
	
	
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
   * Verify that the headers that have been rendered are correct
   */
  verifyHeaderElements : function(grid, expectedNumberOfHeaders, expectedResults){
    var headers_rendered = grid.getElement().getElementsByTagName("th");
    var headers_internal = grid.get("v.columns");
    var headerText_internal = "";
    var headerText_rendered = "";
    //Verify Header number
    $A.test.assertEquals(expectedNumberOfHeaders, headers_rendered.length, "The total amount of headers expected was not correct");
    $A.test.assertEquals(expectedNumberOfHeaders, headers_internal.length, "The total amount of headers in v.columns was not correct");
    
    
    for(var i = 0; i < expectedNumberOfHeaders; i++){
       headerText_internal = $A.util.getText(headers_internal[i].getElement());
       headerText_rendered = $A.util.getText(headers_rendered[i]);
       $A.test.assertEquals(expectedResults[i],headerText_internal,"Header value from internal variable is not correct");
       $A.test.assertEquals(expectedResults[i],headerText_rendered,"Header rendered is not correct");
    }
  },
  
  /**
   * Verify sortable headers
   */
  verifySortableHeaders : function(expectedSortableHeaders) {
	  var sortableHeadersRendered = $A.test.getElementByClass("toggle");;
	  
	  for (var i=0; i<sortableHeadersRendered.length; i++) {
		  var header = sortableHeadersRendered[i];
		  var headerText = $A.test.getText(header);
		  var foundColIndex = -1;
		  
		  for (var j=0; j<expectedSortableHeaders.length; j++) {
			  var expectedHeader = expectedSortableHeaders[j].name;
			  if (headerText.indexOf(expectedHeader) >= 0) {
				  foundColIndex = j;
				  break;
			  }
		  }
		  
		  if (foundColIndex >= 0) {
			  var expectedHeader = expectedSortableHeaders[foundColIndex];
			  
			  if (expectedHeader.isEnabled) {
				  var expectedSort = expectedHeader.sort;
				  var actualSort = $A.test.getText(header.getElementsByTagName("span")[0]);
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
  toggleSortForSortableColumn: function(colNum) {
	  var sortableColumns = $A.test.getElementByClass("toggle");
	  var target = sortableColumns[(colNum-1)];
	  var parent = target.parentNode;
	  var origClassName = $A.util.getElementAttributeValue(parent, "class");
	  $A.test.clickOrTouch(sortableColumns[--colNum]);
	  $A.test.addWaitFor(true, function() {
		  return (origClassName !== $A.util.getElementAttributeValue(parent, "class"));
	  });  
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
  
  /**
   * Verify there should be zero table rows in body.
   */
  verifyEmptyBody : function(cmp) {
	  var trs = this.getRowElements(cmp, 0)[0];
      $A.test.assertEquals(0, trs.length, "there should be no rows on the page")
  },
  
  /**
   * Fire button that will create and add headers, then wait for them to appear
   */
  fireAndWait : function(cmp, id, firstElm){
	  this.fireButton(cmp, id);
      $A.test.addWaitFor(true, function() {
    	  
         var text = cmp.find("grid").getElement().getElementsByTagName("th")[0]
         if($A.util.isUndefinedOrNull(text) && $A.util.isUndefinedOrNull(firstElm)){
        	 return true;
         }
         else if($A.util.isUndefinedOrNull(text)){
           return false;
         }

         return $A.util.getText(text) === firstElm;
        });  
  },
  /**
   * Function that will check for the headers, grab how we think the data grid should look, verify the body elements, then change the body
   */
  baseFunction : function(cmp, initialArray, secondArray, totalExpected, secondButtonID){
	  //Verify table headers have something (cmp and dom table, no data)
      this.verifyHeaderElements(cmp.find("grid"), totalExpected, initialArray);
      var expectedElements = this.getExpectedData(""+totalExpected);
      
      this.verifyBodyElements(cmp, expectedElements);
      //fire and wait for next elements to come
      this.fireAndWait(cmp, secondButtonID, secondArray[0]); 
  },
  /**************************************************HELPER FUNCTIONS END**************************************************/
  
  
  /*
   * Verifying that going from header to another of same size does not change
   */
  testHeaderSizeDoesNotChange : {
      test : [function(cmp){
         this.fireAndWait(cmp, "goTo1Column", this.EXPECTED_1[0]);  
       }, function(cmp) {
    	   this.baseFunction(cmp, this.EXPECTED_1, this.EXPECTED_ADD, 1, "addAColumn");
       }, function(cmp){
           //verify that headers and correct data does not exists
           this.verifyHeaderElements(cmp.find("grid"), 1, this.EXPECTED_ADD); 
      }]
 },
 
 /*
  * Verifying that going from a small header to a larger header renders the correct data
  */
 testHeaderSizeChangesFromSmallToLarge: {
     test : [function(cmp){
        this.fireAndWait(cmp, "goTo1Column", this.EXPECTED_1[0]);  
      }, function(cmp) {
    	  this.baseFunction(cmp, this.EXPECTED_1, this.EXPECTED_2, 1, "goTo2Columns");
      }, function(cmp){
          //verify that headers and correct data does not exists
          this.verifyHeaderElements(cmp.find("grid"), 2, this.EXPECTED_2); 
     }]
},

  /*
   * Verifying that going from headers to no headers actually works and renders nothing on screen
   */
  testHeaderToNoHeaders : {
	  test : [function(cmp){
        this.fireAndWait(cmp, "goTo5Columns", this.EXPECTED_5[0]);  
      }, function(cmp) {
    	  this.baseFunction(cmp, this.EXPECTED_5, [undefined], 5, "removeColumns");
      }, function(cmp){
          //verify that headers and correct data does not exists
          this.verifyHeaderElements(cmp.find("grid"), 0, []);
     }]
  },
  
  /*
   * Minimal case. Verifying going from large to small header renders the correct elements
   */
  testLargeHeaderToSmallHeader  : {
	  test : [function(cmp){
	        this.fireAndWait(cmp, "goTo5Columns", this.EXPECTED_5[0]);  
	      }, function(cmp) {
	    	  this.baseFunction(cmp, this.EXPECTED_5,  this.EXPECTED_2, 5, "goTo2Columns");
	      }, function(cmp){
	    	  //verify that headers and correct data does not exists
	          this.verifyHeaderElements(cmp.find("grid"), 2, this.EXPECTED_2);  
	     }]
  }, 
  
  /*
   * verifying that appending the data works as expected
   */
  testAppending  : {
	  attributes : {"appendOrOverwrite" : "append"},
	  test : [function(cmp){
            this.fireAndWait(cmp, "goTo2Columns", this.EXPECTED_2[0]);  
         }, function(cmp) {
	        this.baseFunction(cmp, this.EXPECTED_2,  this.EXPECTED_2_1, 2, "goTo1Column");
         }, function(cmp){
	        //verify that headers and correct data does not exists
            this.verifyHeaderElements(cmp.find("grid"), 3, this.EXPECTED_2_1);  
         }]
  }, 
  
  /*
   * Using columns that are already present verify that we can append to them dynamically
   */
  testAppendingWithColumnsDefined : {
	  attributes : {"appendOrOverwrite" : "append", "useDynamicColumns" : "false"},
	  test : [function(cmp) {
	        this.baseFunction(cmp, this.EXPECTED_2,  this.EXPECTED_2_1, 2, "goTo1Column");
         }, function(cmp){
	        //verify that headers and correct data does not exists
            this.verifyHeaderElements(cmp.find("grid"), 3, this.EXPECTED_2_1);  
         }]
  }, 
  
  /*
   * Verify that using a column with  the wrong name renders the incorrect header but nothing else 
   */
  testCaseSensitiveColumn : {
	 test :[function(cmp){
		 this.fireAndWait(cmp, "goToColumnWithWrongName", this.EXPECTED_5[0]);  
	 }, function(cmp) {
		// this.verifyHeaderElements(cmp.find("grid"), 5, this.EXPECTED_5);
		 var expectedElements = this.getExpectedData("6");
		 
		 var assertFunction = function(td, expectedDomRow, currCmpRow, lastRow){
			 var lastRowValue = "";
			 if(!lastRow){
				 lastRowValue = expectedDomRow;
			 }
	      		 
   		    $A.test.assertEquals(td, lastRowValue, "Row element data does not match what it should be");
            $A.test.assertEquals(currCmpRow, expectedDomRow, "Row data stored in cmp data does not match what it should be");
	  };
		 
	     this.verifyBodyElements(cmp, expectedElements, assertFunction);
	 }]
  },
  
  /*
   * Test the ability to flow from one column type to the next
   */
  testFlow : {
	  test : [function(cmp){
	        this.fireAndWait(cmp, "goTo5Columns", this.EXPECTED_5[0]);  
	      }, function(cmp) {
	    	  this.baseFunction(cmp, this.EXPECTED_5,  this.EXPECTED_2, 5, "goTo2Columns");
	      }, function(cmp){
	    	  //verify that headers and correct data does not exists
	          this.verifyHeaderElements(cmp.find("grid"), 2, this.EXPECTED_2);
	          this.baseFunction(cmp, this.EXPECTED_2,  this.EXPECTED_1, 2, "goTo1Column");
	          	        
	     }, function(cmp){
	    	  this.verifyHeaderElements(cmp.find("grid"), 1, this.EXPECTED_1);
	     }]
  },
  
  /*
   * Test sortable header assistive text
   */
  testSortableColumns : {
	  attributes : {"sortBy" : "id"},
	  test : [function(cmp) {
		  }, function(cmp) {
			  this.fireAndWait(cmp, "goToSortedColumns", "Item Id");
		  }, function(cmp) {
			  // test insital sort
			  var expectedSortableColumns = [{name:"Item Id",sort:"",isEnabled:true}, {name:"Item Name",sort:"",isEnabled:true}];
			  this.verifySortableHeaders(expectedSortableColumns);
			  this.verifyBodyElements(cmp, this.getExpectedData("5"));
			  this.toggleSortForSortableColumn(2);
		  }, function(cmp) {
			  // test sort of 2nd sortable column
			  var expectedSortableColumns = [{name:"Item Id",sort:"",isEnabled:true}, {name:"Item Name",sort:"Descending",isEnabled:true}];
			  this.verifySortableHeaders(expectedSortableColumns);
			  this.verifyBodyElements(cmp, this.getExpectedData("5"), null, true);
			  this.toggleSortForSortableColumn(2);
		  }, function(cmp) {
			  // test toggling sort order on same column
			  var expectedSortableColumns = [{name:"Item Id",sort:"",isEnabled:true}, {name:"Item Name",sort:"Ascending",isEnabled:true}];
			  this.verifySortableHeaders(expectedSortableColumns);
			  this.verifyBodyElements(cmp, this.getExpectedData("5"));
			  this.toggleSortForSortableColumn(1);
		  }, function(cmp) {
			  // test switching sort order to another column
			  var expectedSortableColumns = [{name:"Item Id",sort:"Descending",isEnabled:true}, {name:"Item Name",sort:"",isEnabled:true}];
			  this.verifySortableHeaders(expectedSortableColumns);
			  this.verifyBodyElements(cmp, this.getExpectedData("5"), null, true);
	  }]
  },
  
  /*
   * Test sortable headers with empty data set.
   */
  _testSortOnEmptyDataSet : {
	  attributes : {"pageSize" : 0},
	  test : [function(cmp) {
		  }, function(cmp) {
			  this.fireAndWait(cmp, "goToSortedColumns", "Item Id");
		  }, function(cmp) {
			  // test initial sort
			  var expectedSortableColumns = [{name:"Item Id",sort:"",isEnabled:true}, {name:"Item Name",sort:"",isEnabled:true}];
			  this.verifySortableHeaders(expectedSortableColumns);
			  this.verifyEmptyBody(cmp);
			  this.toggleSortForSortableColumn(2);
		  }, function(cmp) {
			  // test sort of 2nd sortable column
			  var expectedSortableColumns = [{name:"Item Id",sort:"",isEnabled:false}, {name:"Item Name",sort:"",isEnabled:false}];
			  this.verifySortableHeaders(expectedSortableColumns);
			  this.verifyEmptyBody(cmp);
	  }]
  }
  
})