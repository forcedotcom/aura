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
	ERROR_OUTPUT : "The wren, Earns his living, Noiselessly",
	IDENTIFIER   : "Invalid",
	
    /*************************************************************************************************************
     * HELPER FUNCTIONS
     ************************************************************************************************************/
    //Verify aria-describedby value on the input tags matches the ul of inputDefaultError
    verifyAriaIdCorrect : function(ul, input){
    	var ulId = $A.test.getElementAttributeValue(ul, "id");
        var inputId =  $A.test.getElementAttributeValue(input, "aria-describedby");
        
        $A.test.assertEquals(ulId, inputId, "Aria-describedby attribute on the input tag and the id from the ul do not match")
    },
    
    verifyInputDefaultStructure : function(input, ul, ulLength, childLength){
    	 $A.test.assertEquals(ul.length, ulLength, "uiInputDefaultError unordered list was not found");
         
         //Grab the uls children and verify that there are three
         var chlds = ul[0].children;
         $A.test.assertEquals(chlds.length, childLength, "The amount of children is incorrect");
         
       //Verify aria-describedby value on the input tags matches the ul of inputDefaultError
 		this.verifyAriaIdCorrect(ul[0], input)
    },
    
    validateBasic : function(cmp, auraId){  	
    	cmp.find("validate").getEvent("press").fire({});
    	
    	var ul = $A.test.getElementByClass("uiInputDefaultError");
		var input = cmp.find(auraId).getElement();
		
		this.verifyInputDefaultStructure(input, ul, 1, 3); 
    },
 /***********************************************************************************************************
  * HELPER FUNCTION END
  ************************************************************************************************************/   
   
    //Verify that inputDefault error only shows up on the correct input that is broken, and that it has the correct values
    testInputDefaultWithShowsWithOnlyOneItem : {
    	attributes : {"caseToRender" : "default"},
    	test : function(cmp) {
    		var chldsText = "",
    		    ul = null,
    		    chlds = null,
    		    i = 0;
    		//Verify that there are no inputDefaultErrors or uls on the page
    		ul  = document.getElementsByTagName("ul");
    		$A.test.assertEquals(ul.length, 0, "There should be no uls present")
    	
    		//Validate the components
    		cmp.find("validate").getEvent("press").fire({});
    		 		
    		//There should only be on ul/inputDefaultError component on the page
    		ul = $A.test.getElementByClass("uiInputDefaultError");
    		
    		this.verifyInputDefaultStructure(cmp.find("defaultInvalid").getElement(), ul, 1, 3);
    		
    		 //Grab the uls children and verify that there are three
            chlds = ul[0].children;
    		//Verify error messages are correct
            for(i = 0; i< chlds.length; i++){
            	chldsText = $A.util.getText(chlds[i]);
            	$A.test.assertTrue(this.ERROR_OUTPUT.indexOf(chldsText) > -1, "Error message that is present is incorrect");
            }
    	}
    },
    
    //Show inputDefault error then take it away
    // commented for bug W-2319834
    _testInputDefaultToggles : {
    	attributes: {"caseToRender" : "default"},
    	test : function(cmp) {
    		//Validate the components
    		cmp.find("validate").getEvent("press").fire({});
    		var input = cmp.find("defaultInvalid").getElement();
    		//Grab ul with errors
    		var ul = $A.test.getElementByClass("uiInputDefaultError");
    		
    		//Verify IDS match and the amount of errors match
    		this.verifyInputDefaultStructure(input, ul, 1, 3);
    		
    		//Remove errors
    		cmp.find("validate").getEvent("press").fire({});
    		this.verifyInputDefaultStructure(input, ul, 1, 0);
    		
    	}
    },
    
    //Show inputDefault error then take it away (DOES NOT WORK!) W-2302015
    _testInputDefaultWorkWithErrorComponentAttribute : {
    	attributes: {"caseToRender" : "customUsage"},
    	test : function(cmp) {
    		
    		//Grab ul with errors
    		var ul = $A.test.getElementByClass("uiInputDefaultError");
    		var input = cmp.find("customUsageInvalid").getElement();
    		//InputDefaultError Should be rendered already
    		this.verifyInputDefaultStructure(input, ul, 1, 0);

    		//Validate the components
    		cmp.find("validate").getEvent("press").fire({});
    		
    		this.verifyInputDefaultStructure(input, ul, 1, 3); 
    		
    		//Validate the components
    		cmp.find("validate").getEvent("press").fire({});
    		
    		this.verifyInputDefaultStructure(input, ul, 1, 0); 
    		
    	}
    },
    
    
    testCmpWithInputSelect : {
    	attributes: { "caseToRender" : "select"},
    	test : function(cmp) {  		
    		this.validateBasic(cmp,"select"+this.IDENTIFIER);
    	}
    },
    
    testCmpWithInputText : {
    	attributes: { "caseToRender" : "text"},
    	test : function(cmp) {
    		this.validateBasic(cmp,"text"+this.IDENTIFIER);
    	}
    },
    testCmpWithInputSearch : {
    	attributes: { "caseToRender" : "search"},
    	test : function(cmp) {
    		this.validateBasic(cmp,"search"+this.IDENTIFIER);
    	}
    },
    testCmpWithInputTextArea : {
    	attributes: { "caseToRender" : "textArea"},
    	test : function(cmp) {
    		this.validateBasic(cmp,"textArea"+this.IDENTIFIER);
    		
    	}
    },
    testCmpWithInputDate : {
    	attributes: { "caseToRender" : "date"},
    	test : function(cmp) {  		
    		this.validateBasic(cmp,"date"+this.IDENTIFIER);
    	}
    },
    
    //This component is special because it has two inputDefaultErrors already on page
    testCmpWithInputDateTime : {
    	attributes: { "caseToRender" : "dateTime"},
    	test : function(cmp) {
    		cmp.find("validate").getEvent("press").fire({});
        	
        	var ulArray = $A.test.getElementByClass("uiInputDefaultError");
    		var input = cmp.find("dateTime"+this.IDENTIFIER).getElement();
    		var ul = [];
    		
    		for(var i = 0; i< ulArray.length; i++){
    		   if($A.util.getElementAttributeValue(ulArray[i], "class").indexOf("hide") < 0){
    			   ul.push(ulArray[i]);
    		   }	
    		}
    		
    		this.verifyInputDefaultStructure(input, ul, 1, 3); 
    	}
    },
    testCmpWithInputRadio : {
    	attributes: { "caseToRender" : "radio"},
    	test : function(cmp) {
    		this.validateBasic(cmp,"radio"+this.IDENTIFIER);
    	}
    },
    testCmpWithInputRange : {
    	attributes: { "caseToRender" : "range"},
    	test : function(cmp) {
    		this.validateBasic(cmp,"range"+this.IDENTIFIER);
    	}
    },
    testCmpWithInputTextAreaForAutoComplete : {
    	attributes: { "caseToRender" : "autoCompleteTextArea"},
    	test : function(cmp) {
    		this.validateBasic(cmp,"autoCompleteTextArea"+this.IDENTIFIER);
    	}
    },
    testCmpWithInputTextForAutoComplete : {
    	attributes: { "caseToRender" : "autoCompleteText"},
    	test : function(cmp) {
    		this.validateBasic(cmp,"autoCompleteText"+this.IDENTIFIER);
    	}
    }
})
