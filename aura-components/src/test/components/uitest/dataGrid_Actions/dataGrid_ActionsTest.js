({
	EXPECTED_ROW : ["", "Foo ", "John Doe ", "Acme ", "2014-01-01 "],
	/**
     * Basic testing of rows ability to disable and enable rows
     */
    testEnableDisableActions : {
    	attributes : {"pageSize" : 10},
        test : [function(cmp){
        	//Getting rows
        	rowElements = this.getRowElements(cmp, 10);
        	rowElm = rowElements[0][0];
        	$A.test.clickOrTouch(this.getCheckBox(rowElm));
        }, function(cmp){       	
        	//Verify row enabled <-- check css class added and that row is not clickable
        	this.verifyRowClass(rowElm, "disabled", false);
            this.verifyRowSelectIsClickable(rowElm, true);
            //disable row
            this.pressAction(rowElm.children, 0);           
        }, function(cmp){
        	//Verify row enabled <-- check css class added and that row is not clickable
        	this.verifyRowClass(rowElm, "disabled", true);
        	$A.test.clickOrTouch(this.getCheckBox(rowElm));
        	
        }, function(cmp){
            this.verifyRowSelectIsClickable(rowElm, true);
        	//enable row
            this.pressAction(rowElm.children, 1);    
        	//verify row enabled
        }, function(cmp){
        	var self = this;
        	$A.test.addWaitForWithFailureMessage(false, function(){
        		$A.test.clickOrTouch(self.getCheckBox(rowElm));
        		return self.getCheckBox(rowElm).checked;
        	}, "Row should not be disabled");
        }, function(cmp){
        	this.verifyRowClass(rowElm, "disabled", false);
        	this.verifyRowSelectIsClickable(rowElm, false);
        }]
    },
    
    /**
     * Test verifying that if I disable multiple rows and enable the one at a time, all that should still be disabled are
     */
    testEnableDisableMultiple : {
    	attributes : {"pageSize" : 10},
        test : [function(cmp){
        	//Getting rows
        	rowElements = this.getRowElements(cmp, 10);
        	renderedRows = rowElements[0];
            rowsUsed = [0, 4, 9];
            
            for(var i = 0; i < rowsUsed.length; i++){
            	$A.test.clickOrTouch(this.getCheckBox(renderedRows[rowsUsed[i]]));
            }
        }, function(cmp){
        	var rowElm = null;
        	//Verify row enabled then disable a select few of them
        	 for(var i = 0; i < rowsUsed.length; i++){
        	   var rowElm  = renderedRows[rowsUsed[i]];
        	  
        	   this.verifyRowClass(rowElm, "disabled", false);
               this.verifyRowSelectIsClickable(rowElm, true);
               this.pressAction(rowElm.children, 0);       
        	}      
        }, function(cmp){
        	 //verify that row is disabled
        	 var that = this;
        	 var verify = function(renderedRow, expectedClass, disabled, itemsRow, count){
         		that.verifyRowClass(renderedRow, expectedClass, disabled);
         		that.verifyRow(renderedRow.children, itemsRow, disabled, count);
         	};
        	 
        	this.verifyRows(rowElements[1], rowsUsed, renderedRows, verify, "disabled");
        }]
    },
    /**
     * Testing to make sure that class toggles as expected
     */
    testToggleClass : {
    	attributes : {"pageSize" : 10},
        test : [function(cmp){
        	//Get elements
        	rowElements = this.getRowElements(cmp, 10);
        	renderedRows = rowElements[0];
        	rowElm = renderedRows[0]
        	
            //Verify default class
        	 this.verifyRowClass(rowElm, "error", false);
        	 this.pressAction(rowElm.children, 2); 
        }, function(cmp){
        	//verify css class
            var that = this;
        	var verify = function(renderedRow, expectedClass, disabled, itemsRow, count, buttonsDisabled){
        		if($A.util.isUndefinedOrNull(buttonsDisabled)){
        			buttonsDisabled = false;
        		}
        		that.verifyRowClass(renderedRow, expectedClass, disabled);
        		that.verifyRow(renderedRow.children, itemsRow, buttonsDisabled, count);
        	};

        	//Verify that the only element that has the class is the row that we expect (row 0)
        	this.verifyRows(rowElements[1], [0], renderedRows, verify, "error");
        	this.pressAction(rowElm.children, 2); 
        }, function(cmp){
        	//Make sure the class no longer exists
        	this.verifyRowClass(rowElm, "error", false);
        }]
    }, 
    
    /***************************************************************************************************
     * Helper functions              
     **************************************************************************************************/
     /**
      * Goes through all elements and makes sure that each row is correct
      */
     verifyRows : function(vItemsRows, rowsUsed, rows, verifyFunc, expectedClass){
    	 var disabled = "";
	     var count = 0;
	     for(var i = 0; i < rows.length; i++){
		    if(rowsUsed[count] == i){
			    disabled = true;
			    count++;
		    }
		    else{
			    disabled = false;
		    }
		    verifyFunc(rows[i], expectedClass, disabled, vItemsRows[i], i+1);
	    }
	 },
	 
	/**
	 * Goes through a single row, and makes sure the data is what we expect 
	 */
    verifyRow : function(domRow, cmpRow, disabled, rowQualifier){
    	var expectedRow = "";
    	var keys = ["id", "subject", "name", "relatedTo", "date"];
    	var buttons = domRow[domRow.length-1].children;
    	$A.test.assertEquals(domRow.length, 7, "There are elements missing in the rendered row");
    	
    	for(var i = 1; i < this.EXPECTED_ROW.length; i++){
    		expectedRow = this.EXPECTED_ROW[i] +""+rowQualifier;
            $A.test.assertEquals($A.util.getText(domRow[i+1]), ""+expectedRow, "Row element data does not match what it should be");
            $A.test.assertEquals(""+cmpRow[keys[i]], expectedRow, "Row data stored in cmp data does not match what it should be");
        }
    	
    	if(disabled == true){
    		$A.test.assertTrue(buttons[0].disabled, "Button should be disabled and it is not");
    		$A.test.assertFalse(buttons[1].disabled,"Button should not be disabled and it is");
    		$A.test.assertTrue(buttons[2].disabled,"Button should be disabled and it is not");		
    	}
    	else{
    		$A.test.assertFalse(buttons[0].disabled,"Button should not be disabled and it is");
    		$A.test.assertTrue(buttons[1].disabled,"Button should be disabled and it is not");
    		$A.test.assertFalse(buttons[2].disabled,"Button should not be disabled and it is");
    	}
    },
    
    /**
     * Get a grid attribute
     */ 
    getGridAttribute : function( cmp, attributeName){
        return cmp.find("grid").get("v."+attributeName);
    },
    
    /**
     * get the checkbox from the row
     */
    getCheckBox : function(row){
    	return row.getElementsByTagName("input")[0];
    },
    
    /**
     * Make sure the row class exists when it is supposed to, and not otherwise
     */
    verifyRowClass : function(row, classToLookFor, shouldClassBePresent){
    	var elemClass    = (""+$A.test.getElementAttributeValue(row, "class")).replace(/\s/g,'');
        var indexOfError = elemClass.indexOf(classToLookFor);
        
        if($A.util.isUndefinedOrNull(indexOfError)){
        	indexOfError = -1;
        }
    	//checking class and verifying that input should be checked or unchecked
        if(shouldClassBePresent == false){
        	$A.test.assertTrue((indexOfError < 0), "Row should not contain class "+classToLookFor);
        }
        else{
        	$A.test.assertTrue( indexOfError == 0, "Row should contain class "+classToLookFor);
        }
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
            var itemsInBody = this.getGridAttribute(cmp, "items");

            $A.test.assertEquals(colCount, trs.length, "The total amount of items on the page are incorrect");
            $A.test.assertEquals(colCount, itemsInBody.length, "The total amount of elements in v.items is incorrect");

            return [trs, itemsInBody];
    },
    
    /**
     * Check to make sure that the row is clickable or not (i.e. whether the row is actually disabled)
     */
    verifyRowSelectIsClickable : function(row, shouldBeChecked){
    	var input    = this.getCheckBox(row);
        var inputChecked = input.checked;
    	//checking class and verifying that input should be checked or unchecked
        if(shouldBeChecked){
        	$A.test.assertTrue(inputChecked, "Row should not contain class that disabled");
        }
        else{
        	$A.test.assertFalse( inputChecked, "Row should contain class that disabled");
        }
    },
    
    /**
     * Press the button associated with the action
     */
    pressAction : function(buttonTr, actionPos){
    	var buttons = buttonTr[buttonTr.length-1].children;
    	$A.test.clickOrTouch(buttons[actionPos]);
    }
})