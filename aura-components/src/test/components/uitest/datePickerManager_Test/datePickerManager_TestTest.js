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
 * 
 */
({
    defValueID : "inputWDefValue",
    noDefValueID : "inputWODefValue",
    defDatePickerID : "inputWNoDatePicker",
    dateId : "dpm",
    
    /**
     * Test that opens multiple datepickers then verifies that they are not overriding eachtohers Values
     * 
     */
    testDatepickerStoresCorrectValue : {
	browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET"],
        test : [function(cmp) {
            	     this.openDatePicker(cmp, this.defValueID);
		   }, function(cmp){
                       var pastWeek   = this.getDatePicker(cmp).find("grid").find("17");
                       pastWeek.getEvent("click").fire({});
		   },
		   function(cmp) {
		       this.openDatePicker(cmp, this.noDefValueID);
                   },
	           function(cmp){
                       var today = this.getDatePicker(cmp).find("today").getElement();
                       $A.test.clickOrTouch(today);
                   },
                   function(cmp){
                       var inputWDefaultValue = cmp.find(this.defValueID).getElement().value;
                       var inputWODefaultValue = cmp.find(this.noDefValueID).getElement().value;
                       $A.test.assertNotEquals(inputWDefaultValue, inputWODefaultValue, "The dates in the inputText should not be equal");
                   }]
    },
    /**
     * Test verifying that the inputText takes in input
     * 
     * Ignores iphone/ipad because those are going to be readonly fields
     */
    testDatepickerOpensToCorrectValue : {
	browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
        test : [function(cmp) {
            	     cmp.find(this.noDefValueID).set("v.value", "2013-09-25");
            	     this.openDatePicker(cmp, this.noDefValueID);
		   }, function(cmp){
                       var pastWeek   = this.getDatePicker(cmp).find("grid").find("17");
                       pastWeek.getEvent("click").fire({});
                       
                       var inputValue = cmp.find(this.defValueID).getElement().value;
                       $A.test.assertEquals(inputValue, "2013-09-25", "The dates in the inputText should not be equal");
		   }]
    },
    
    /**
     * Test verifying that each datepicker opens up on the safe y-axis as the input 
     * 
     * Ignored in IE7 because ie7 handles bounding rectangle differently and the datepicker ends up be askewed 
     */
    testCheckDatePickerPosition : {
	browsers: ["-IE7", "-ANDROID_PHONE", "-ANDROID_TABLET"],
        test : [function(cmp) {
                    this.openDatePicker(cmp, this.defValueID);
	        },
	        function (cmp) {
	           this.verifyPosition(cmp, this.defValueID);  
	        },
	        function(cmp) {
                    this.openDatePicker(cmp, this.noDefValueID);
	        },
	        function (cmp) {
	           this.verifyPosition(cmp, this.noDefValueID);  
	        }]
    },
    
    /**
     * Test verifying that there are two datepickers on the screen (1 from manager, and the other from a normal inputDate components)
     */
    testNumberOfDatepickersOnPage : {
	browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET"],
        test : function(cmp) {
                 var datePickerSize = $A.test.getElementByClass("uiDatePicker").length;
                 $A.test.assertEquals(2, datePickerSize, "There should be two datePickers on the screen and there aren't");
	       }
    },
    
    //HELPER FUNCTIONS
    getDatePicker: function(cmp){
	return cmp.find("dpm").find("datePicker");
    },
    /**
     * Method allowing us to extract whether or not we are looking at a mobile device. Extracted from two functions because 
     * depending on which mode we are in (Desktop or other), we either have a header with the Month Year combo or an outputText 
     * and a select value
     * 
     */ 
    isViewDesktop : function(){
                         return $A.get('$Browser.formFactor').toLowerCase() === "desktop";
    },
    openDatePicker : function(cmp, inputId) {
	var opener = cmp.find(inputId).getSuper().find("datePickerOpener").getElement();
	var inputBox = cmp.find(inputId).getSuper().find("inputText").getElement();
	var datePicker = this.getDatePicker(cmp).getElement();

	if($A.util.isUndefinedOrNull(opener) || !this.isViewDesktop()) {
	    $A.test.clickOrTouch(inputBox);
	} else {
	    $A.test.clickOrTouch(opener);
	}
	$A.test.addWaitFor(true, function(){return $A.util.hasClass(datePicker, "visible")});
    },
    
    verifyPosition : function (cmp, elmId){
	 var inp = cmp.find(elmId).getElement().getBoundingClientRect();
         var dp = this.getDatePicker(cmp).getElement().getBoundingClientRect();
         $A.test.assertEquals(inp["left"].toFixed(1), dp["left"].toFixed(1),"Bounding left side of inputTextBox and Datepicker for "+elmId+" do not match");
    }
})