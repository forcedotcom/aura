({
    browsers         : ["-IE7","-IE8"],
    ADD_ROW_ARRAY    : ["Spidey", "Peter Parker", "Media Inc", "2020-10-12"],
    BASIC_ROW_ARRAY  : ["Foo", "John Doe", "Acme", "2014-01-01"],
    INSERT_ROW_ARRAY : ["Bar", "New John", "SFDC", "2014-11-11"],
    doNotWrapInAuraRun : true,
	/**
     * Test verifying that when there is no data present dataGrid does not fail
     * bug tracking: 2327176
     */
    _testNoDataPresent : {
        attributes : {"pageSize" : 0},
        test : function(cmp){
            this.verifyDataGridUsingPager(cmp, [true,true,true,true],"0 - 0 of 0");
        }
    },
    
    testGridWithUndefinedItems : {
        attributes : {"pageSize" : 10},
        test : [function(cmp) {
        	cmp.find("grid").set("v.items", undefined);
        }, function(cmp) {
        	$A.test.assertEquals(0, cmp.find("grid").get("v.items").length, "There should be zero items");
        	this.verifyNumberOfTrs(0, cmp.find("grid").getElement());
        }]
    },

    /**
     * Start at last possible page, then verify that last paging elements acknowledge the change
     * bug tracking: 2327175
     */
    _testWithLargeData : {
    	browsers : ["-IE8", "-IE7"],
        attributes : {"pageSize" : 3000, "currentPage" : 1},
        test : function(cmp){
            this.verifyDataGridUsingPager(cmp,[true, true, false, false], 3000, "1 - 3000 of 15000");
        }
    },
    
    /**
     * Verifying that dataGrid is accessible
     */
    testAccessible : {
        attributes : {"pageSize" : 10},
        test : function(cmp){
            $A.test.assertAccessible();
        }
    },

    /**
     * Basic test case where we look at an average number of data and make sure paging accounts for it
     */
    testWithAverageData : {
        attributes : {"pageSize" : 10},
        test : function(cmp){
            this.verifyDataGridUsingPager(cmp, [true, true, false, false], 10, "1 - 10 of 50");
        }
    },
    
    /**
     * Basic test case verifying that pager and dataGrid work well together
     */
    testWithPagerEnd : {
        attributes : {"pageSize" : 10,"currentPage" : 5},
        test : function(cmp){
            this.verifyDataGridUsingPager(cmp, [false, false, true, true], 10, "41 - 50 of 50");
        }
    },
    
    /**
     * Making sure that we are able to page to the next page and that we are able to page to previous and next pages
     */
    testStartingOnDifferentPage : {
        attributes : {"pageSize" : 10, "currentPage" : 2},
        test : function(cmp){
            this.verifyDataGridUsingPager(cmp, [false, false, false, false], 10, "11 - 20 of 50");
        }
    },
    
    
    
    /**
     * Testing pagination with sortby attribute
     */
    testPagination : {
        attributes : {"pageSize" : 10, "currentPage" : 1, "sortBy" : "-id"},
        test : function(cmp){          
            var pager = cmp.find("pagerNextPrev").find("pager:next").getElement();
            this.verifySortedElements(cmp, pager, "20", "1", "We are on the wrong page, we should be on row 11-20", 10)
        }
    },
    
    /**
     * testing sorting by elements (i.e. click on sort button)
     */
    testSorting : {
        attributes : {"pageSize" : 10, "currentPage" : 1},
        test : function(cmp){
                var anchor = $A.test.getElementByClass("toggle")[0];
                this.verifySortedElements(cmp, anchor, "10", "1", "We are on the wrong page, we should be on row 10-1", 10);               
        }
    },
  
    /**
     * Test that selecting and pagination still work correctly
     */
    testSelectingDeselectingItemsWithPaginations : {
    	  attributes : {"pageSize" : 10},
        test : function(cmp){
            //Select all items
            var thead = document.getElementsByTagName("thead")[0];
            this.selectCheckBox(0, 0, thead.children);

            //Deselect two rows
            var elements = this.getRowElements(cmp, 10);
            var trs = elements[0];
            this.selectCheckBox(0, 1, trs);

            //Go to next page
            var pager = cmp.find("pagerNextPrev").find("pager:next").getElement();
            $A.test.clickOrTouch(pager);

            //Get current amount of trs in body
            this.verifyNumberOfTrs(10, cmp.find("grid").getElement());           
        }
    }, 

    /**
     * Add multiple items asynchronously and make sure that basic functionality still works (add/remove in v.items)
     */
    _testAddingElementsInAsyncly : {
        attributes : {"pageSize" : 0, "numItems2Create" : 20},
        test : [function(cmp){
        	//Verify the page is empty
        	var elements = this.getRowElements(cmp, 0);
            var trs = elements[0];
            $A.test.assertEquals(0, trs.length, "there should be no rows on the page")
            },function(cmp) {
            	//Add rows in and wait for them to be present
        		this.pressButton(cmp, "addRow");
	        	 $A.test.addWaitFor(true, function() {
	     			return document.getElementsByTagName("tbody")[0].children.length > 0;
	     		});
        	},function(cmp){
        		//verify that the row is correct 
        		this.checkBasicElements(cmp, ["6000", "Spidey 6000", "Peter Parker 6000", "Media Inc 6000", "2020-10-12 6000"],
                		["6010", "Spidey 6010", "Peter Parker 6010", "Media Inc 6010", "2020-10-12 6010"],
                		["6019", "Spidey 6019", "Peter Parker 6019", "Media Inc 6019", "2020-10-12 6019"], 20, [0,10,19]);

        		//Add an element to the row and verify insert and removing still work
                this.setValue(cmp, "index", 0);
                this.setValue(cmp, "count", 2);
                this.insertRemoveAndVerify(cmp, 0, this.createOutputArray(6020, 6021, this.INSERT_ROW_ARRAY),
                                           this.createOutputArray(6000, 6000,  this.ADD_ROW_ARRAY), 22, 20);
        	}]
    },
    /**
     * Basic test validating that what is being displayed through the grid is there
     */
    testDisplayedItemsAreCorrect : {
    	attributes : {"pageSize" : 20, "currentPage" : 1},
        test : function(cmp){
            this.checkBasicElements(cmp, ["1", "Foo 1", "John Doe 1", "Acme 1", "2014-01-01 1"], 
            		["10", "Foo 10", "John Doe 10", "Acme 10", "2014-01-01 10"], 
            		["20", "Foo 20", "John Doe 20", "Acme 20", "2014-01-01 20"], 20, [0, 9, 19]);
        }
    },
    /**
     * Insert single item into grid
     * bugTracking why this is not being run in IE7/IE8: W-2327182
     */
    // TODO: W-2507326
    _testInsertionOfSingleItem : {
    	browsers : ["-IE8", "-IE7"],
        test : function(cmp){

            //Set Intial values for how many items to create, the insert and remove said elements multiple times to verify v.items keeps track
            this.setValue(cmp, "index", 1);
            this.setValue(cmp, "count", 2);
            this.insertRemoveAndVerify(cmp, 1, this.createOutputArray(6000, 6001, this.INSERT_ROW_ARRAY),
                                       this.createOutputArray(2, 3,  this.BASIC_ROW_ARRAY), 102, 100);
            
            this.insertRemoveAndVerify(cmp, 1, this.createOutputArray(6002, 6003, this.INSERT_ROW_ARRAY),
                                       this.createOutputArray(2, 3,  this.BASIC_ROW_ARRAY), 102, 100);

        }
    },
    
    /**
     * Insert a large amount of elements, remove only a portion of it and see how v.items reacts
     * 
     * bugTracking why this is not being run in IE7/IE8: W-2327182
     */
    // TODO: W-2507326
    _testStaggeredInsertionRemove : {
    	browsers : ["-IE8", "-IE7"],
        test : function(cmp){
            this.setValue(cmp, "index", 50);
            this.setValue(cmp, "count", 20);

            //Set up for insert remove
            var valuesAfterInsert = this.createOutputArray(6000, 6019, this.INSERT_ROW_ARRAY);
            var valuesAfterRemove = this.createOutputArray(51, 69,  this.BASIC_ROW_ARRAY);
            this.insertRemoveAndVerify(cmp, 50, valuesAfterInsert, valuesAfterRemove, 120, 100);
            
            valuesAfterInsert = this.createOutputArray(6020, 6039, this.INSERT_ROW_ARRAY);
            //Since the array is not correct now, concat new items with old to make sure the correct element was not destroyed
            valuesAfterRemove = this.createOutputArray(6030, 6039, this.INSERT_ROW_ARRAY)
            valuesAfterRemove = valuesAfterRemove.concat(this.createOutputArray(51, 69,  this.BASIC_ROW_ARRAY));

            //Insert and remove elements
            this.insertRemoveAndVerify(cmp, 50, valuesAfterInsert, valuesAfterRemove, 120, 110, 10);
            
        }
    },
    
    /**
     * Remove elements then refire the DataGrid provider to verify that v.items is overwritten
     */
    testDataGridProviderRefire : {
    	attributes : {"pageSize" : 20},
        test : [function(cmp){
            this.setValue(cmp, "index", 0);
            this.setValue(cmp, "count", 5);
        }, function(cmp){
            this.actAndVerifyRowIsCorrect(cmp, "remove", 0, 
                this.createOutputArray(6, 10, this.BASIC_ROW_ARRAY), 15);
        }, function(cmp){
            this.actAndVerifyRowIsCorrect(cmp, "refireDP", 0, 
                this.createOutputArray(1, 7, this.BASIC_ROW_ARRAY), 20);
        }]
    },
    
    /**
     * Make sure that selecting and deselecting a single row work
     */
    testBasicSelectionSingle : {
    	attributes : {"pageSize" : 10},
    	test : function(cmp) {
    		var elements = this.getRowElements(cmp, 10);
            var trs = elements[0];

            //Select the first element (excluding select all)
            this.selectCheckBox(0, 0, trs);
            this.verifySelectedElements(cmp, this.createOutputArray(1, 1,  this.BASIC_ROW_ARRAY), trs);
            
            // Deselect the first element
            this.selectCheckBox(0, 0, trs);
            this.verifySelectedElements(cmp, [], trs);
    	}
    },
    
    /**
     * Make sure that selecting and deselecting all rows work
     */
    testBasicSelectionAll : {
    	attributes : {"pageSize" : 10},
    	test : function(cmp) {
    		var elements = this.getRowElements(cmp, 10);
            var trs = elements[0];
    		
    		//Select all items
            var thead = document.getElementsByTagName("thead")[0];
            this.selectCheckBox(0, 0, thead.children);
            this.verifySelectedElements(cmp, this.createOutputArray(1, 10, this.BASIC_ROW_ARRAY), trs);
            
            // Deselect all
            this.selectCheckBox(0, 0, thead.children);
            this.verifySelectedElements(cmp, [], trs);
    	}
    },
    
    /**
     * Test that all items selected are valid in v.items and v.selectedItems
     */
    testSelectionMixed : {
    	attributes : {"pageSize" : 10},
        test : function(cmp){
            var elements = this.getRowElements(cmp, 10);
            var trs = elements[0];

            //Select the first 2 elements (excluding select all)
            this.selectCheckBox(0, 1, trs);
            this.verifySelectedElements(cmp, this.createOutputArray(1, 2,  this.BASIC_ROW_ARRAY), trs.slice(0, 2));

            //Select the head checkbox to select all and verify
            var thead = document.getElementsByTagName("thead")[0];
            this.selectCheckBox(0, 0, thead.children);
            this.verifySelectedElements(cmp, this.createOutputArray(1, 10,  this.BASIC_ROW_ARRAY), trs);
            
            // Deselect the first element
            this.selectCheckBox(0, 0, trs);
            this.verifySelectedElements(cmp, this.createOutputArray(2, 10, this.BASIC_ROW_ARRAY), trs.slice(1));
        }
    },

    /***************************************************************************************************
     * Helper functions              
     **************************************************************************************************/
    /**
     * Basic check used in multiple places
     */ 
    checkBasicElements : function(cmp, firstRow, midRow, lastRow, totalElementsOnPage, positionsToCheck){
        //Get elements to use (trs and elements that are in v.items)
        var elements = this.getRowElements(cmp, totalElementsOnPage);
        var trs = elements[0]
        var itemsInBody = elements[1];
        //verify first, middle and last item are correct
        this.verifyRow(trs[positionsToCheck[0]].children, itemsInBody[positionsToCheck[0]],   firstRow);
        this.verifyRow(trs[positionsToCheck[1]].children, itemsInBody[positionsToCheck[1]], midRow);
        this.verifyRow(trs[positionsToCheck[2]].children, itemsInBody[positionsToCheck[2]], lastRow);
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
     * Items that have the checkbox selected should be in v.selected, verify that these items are correct
     */ 
    verifySelectedElements : function(cmp, expectedItemsSelected, trs){
    	//setup

        var selected = this.getGridAttribute(cmp, "selectedItems"),
            expectedLen = expectedItemsSelected.length;
        //Verify that v.selected is the length that we expect
        $A.test.assertEquals(expectedLen, selected.length, "There number of items that were selected does not match what is in the selected cache");

        //verify that items are correct
        var expectedObj = null, 
            selObj = null;

        for(var i = 0; i < expectedLen; i++){
           this.verifyRow(trs[i].children, selected[i], expectedItemsSelected[i]);
        }
    },

    /**
     * Select x amount of checkboxes (in this case get the inputs)
     */ 
    selectCheckBox : function(beginElm, endElm, rows){

        //This is backwards because the selected cache pushes stack like (FILO)
        for(var i = endElm; i >= beginElm; i--){
            $A.test.clickOrTouch(rows[i].children[0].children[0].children[1]);
        }
    },

    /**
     * Function, that given a number (start) and values  will create and return an expected array
     */ 
    createOutputArray : function(start, end, arrayValues){
       var outputArray = [], tmpArray;
        
       for(start; start<=end; start++){
    	   tmpArray = [""+start];
    	   for(var i = 0; i < arrayValues.length; i++){
    		   tmpArray.push(arrayValues[i] +" "+start);
    	   }
    	   outputArray.push(tmpArray);
        }
        
        return outputArray;
    },

    /**
     * Function that will insert element, then remove them and verify that the rows look the way we feel they should
     */ 
    insertRemoveAndVerify : function(cmp, startRow, newExpectedRows, oldExpectedRows, colCountNew, colCountOrig, changeRemoveValue){
    	//Insert the new items
        this.actAndVerifyRowIsCorrect(cmp, "insert", startRow, newExpectedRows, colCountNew);
        //Used in the case that we want to remove less items
        if(!$A.util.isUndefinedOrNull(changeRemoveValue)){
            this.setValue(cmp, "count", changeRemoveValue);
        }
        
        //Remove items
        this.actAndVerifyRowIsCorrect(cmp, "remove", startRow, oldExpectedRows, colCountOrig);

    },
    
    /**
     * Perform an action (insert or remove), verify that everything is as expected
     */
     actAndVerifyRowIsCorrect : function(cmp, actionId, index, expectedRow, expectColCount){
    	 this.pressButton(cmp, actionId);
    	//Get how the row looks
         var elements = this.getRowElements(cmp, expectColCount);
         var trs = elements[0];
         var itemsInBody = elements[1];

         //Verify that items have been set to the correct position
         for(var i = 0; i < expectedRow.length; i++, index++){
             this.verifyRow(trs[index].children, itemsInBody[index], expectedRow[i]);
         }
         
     },
     
    /**
     * Extracing out set value code 
     */ 
    setValue : function(cmp, id, value){
         cmp.find(id).set("v.value", value);
    },

    /**
     * extracting out the press function
     */ 
    pressButton : function(cmp, id){
          cmp.find(id).get("e.press").fire({});
    },

    /**
     * Verify that each row element is correct and does what we want it to
     */ 
    verifyRow : function(domRow, cmpRow, expectedRow){
        var keys = ["id", "subject", "name", "relatedTo", "date"];
        // TODO: Clean up this assertion to check for selection checkbox inside wrapper div (due to accessibility changes from W-2330954)
        $A.test.assertEquals($A.test.getElementAttributeValue(domRow[0].children[0].children[1], "type"), "checkbox", "Row element data does not match what it should be");
        
        for(var i = 1; i < domRow.length; i++){
            $A.test.assertEquals($A.util.getText(domRow[i]), ""+expectedRow[i-1], "Row element data does not match what it should be");
            $A.test.assertEquals(""+cmpRow[keys[i-1]], expectedRow[i-1], "Row data stored in cmp data does not match what it should be");
        }
    },
    
    /**
     * Get a grid attribute
     */ 
    getGridAttribute : function( cmp, attributeName){
        return cmp.find("grid").get("v."+attributeName);
    },

    /**
     * get specific row elements
     */ 
    getRowElements : function(cmp, colCount){
            var tbody = document.getElementsByTagName("tbody")[0];
            var trs = this.getOnlyTrs(tbody.children);
            var itemsInBody = this.getGridAttribute(cmp, "items");

            $A.test.assertEquals(colCount, trs.length, "The total amount of items on the page are incorrect");
            $A.test.assertEquals(colCount, itemsInBody.length, "The total amount of elements in v.items is incorrect");

            return [trs, itemsInBody];
    },

    /**
     * Verify that the elements we sorted are correct sorted
     */
    verifySortedElements : function(cmp, element, firstRowId, lastRowId, message, totalElements){
            //Click on the next button
            $A.test.clickOrTouch(element);

            //grabbing first and last item making sure that they are sorted
            var trs = this.getRowElements(cmp, totalElements)[0];
            var firstTr = $A.util.getText(trs[0]);
            var lastTr = $A.util.getText(trs[trs.length - 1]);
                
            //Check to make sure that the first and last intem in the
            $A.test.assertTrue(firstTr.indexOf(firstRowId) > -1, message);
            $A.test.assertTrue(lastTr.indexOf(lastRowId) > -1, message);
    },
    
    /**
     * Extract out function that will go through all of the pager items and make sure they are set correctly
     */ 
    verifyDataGridUsingPager : function(cmp, pagerState, pageSize, pagerMessage){
            //Getting pager and making sure that the nummbe of trs are correct
    	    var pager = cmp.find("pagerNextPrev");

            this.verifyPageInfoSaysCorrectNumber(cmp.find("pageInfo"), pagerMessage);
            this.verifyElementDisabled(pager, 
                ["pager:first","pager:previous", "pager:next","pager:last"], 
                pagerState);
    },

    /**
     * Check to make sure that the pager says the correct page and element we are on
     */ 
    verifyPageInfoSaysCorrectNumber : function (cmp, expectedText){
        $A.test.assertEquals($A.test.getTextByComponent(cmp), expectedText, "There should be not elements through pagerinfo");        
    },
    
    /**
     * check to make sure that we are getting the correct trs and verify it is the correct size
     */ 
    verifyNumberOfTrs : function(number, tbl){
        var trs = this.getOnlyTrs(tbl.getElementsByTagName("tbody")[0].children);
        $A.test.assertEquals(number, trs.length, "The correct number of trs ("+number+") is currently not in the table");
    },
    
    /**
     * Verifying that the pager we expect to be disabled is disabled
     */ 
    verifyElementDisabled : function(cmp, pagerIds, disabled){
        var pagerText = "", 
            assertValue = "",
            message = "";
        
        for(var i = 0; i < pagerIds.length; i++){
        	 //Getting text to make sure that the pager is disabled
             pagerText = $A.test.getTextByComponent(cmp.find(pagerIds[i])).toLowerCase();
            

             //If it is disabled check error message
             if(disabled[i] !== true){
                assertValue = pagerText.indexOf("disabled") == -1; 
                message = pagerIds[i]+" was disabled and it should not be";
             }
             else{
            	 assertValue = pagerText.indexOf("disabled") >= 0;
                 message = pagerIds[i]+" was not disabled and it should be";
             }
        
             $A.test.assertTrue(assertValue, message);
        }   
    }
    
})
