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
    /**
      *  Test cancel link closes datePicker and does not perform any selection of date/time.
      */
    testCancelLink : {
    	attributes : {value: "2012-09-10 11:23", format: "MM-dd-yyyy hh:mm"},
    	test : [function(cmp) {
    		var input = cmp.find("dateTimePickerTest").find("inputText").getElement();
    		$A.test.assertNotNull(input, "input not visible");
    		
    		var value = cmp.find("dateTimePickerTest").get("v.value");
    		$A.test.assertEquals("2012-09-10 11:23", value, "Initial value incorrect");

    		this.openDatePicker(cmp);
    	}, function(cmp) {
    		var datePicker = cmp.find("dateTimePickerTest").find("datePicker");
    		var cancelLink = datePicker.find("cancel").getElement();
    		
    		$A.test.clickOrTouch(cancelLink);
    		$A.test.addWaitFor(false, function(){return $A.util.hasClass(datePicker.getElement(), "visible")});
    		
    		var value = cmp.find("dateTimePickerTest").get("v.value");
    		$A.test.assertEquals("2012-09-10 11:23", value, "Cancel was pressed value should not have changed");
    	}]
    },
    
    /**
      *  Test set link sets the appropriate date/time.
      */
    testSetLink : {
    	attributes : {format: "MM/dd/yyyy hh:mm"},
    	test : [function(cmp) {
    		var input = cmp.find("dateTimePickerTest").find("inputText").getElement();
    		$A.test.assertNotNull(input, "input not visible");
    		
    		var value = cmp.find("dateTimePickerTest").get("v.value");
    		$A.test.assertEquals(undefined, value, "Initial value incorrect");
    		
    		this.openDatePicker(cmp);
    	}, function(cmp) {
    	    var datePicker = cmp.find("dateTimePickerTest").find("datePicker");
    		var setLink = datePicker.find("set").getElement();
    		$A.test.clickOrTouch(setLink);
    	}, function(cmp) {  		
    		var datePicker = cmp.find("dateTimePickerTest").find("datePicker");
    		$A.test.addWaitFor(false, function(){return $A.util.hasClass(datePicker.getElement(), "visible")});
    		
    		var expectedDate = this.getCleanDate(null, true);
    		var value = cmp.find("dateTimePickerTest").get("v.value");
    		var setDate = cmp.find("dateTimePickerTest").find("inputText").getElement().value;

    		$A.test.assertEquals(expectedDate, setDate, "Incorrect datetime was set.");
    	}]
    },
    
    /**
     * Acessibility test, making sure that any functionality added is still accessible
     * 
     */
    testAccessibile : {
    	attributes : {value: "2012-09-10 11:23", format: "MM-dd-yyyy hh:mm"},
    	        test : [function(cmp) {
    	  			this.openDatePicker(cmp);
    	    	}, function(cmp) {	
    	    		$A.test.assertAccessible();
    	}]
     },
     
    /**
      *  If value is set for date/time when opening up dateTimePicker it opens to the date of set value.
      */
    testCalendarWithTimeValuePreSet : {
    	attributes : {value: '09-10-2012T11:23Z', format: 'MM/dd/yyyy HH:mm', timezone: 'GMT'},
    	test : [function(cmp) {
    		 this.openDatePicker(cmp);
    	}, function(cmp) {		   
    		var expected = "September 2012";
    		var datepicker = cmp.find("dateTimePickerTest").find("datePicker");
    		var actual = this.getTextFromElm(datepicker);
    		
    		$A.test.assertEquals(expected, actual, "Month year of datePicker is not valid");
    		actual = $A.util.getText($A.test.getElementByClass("selectedDate")[0]);
    		$A.test.assertEquals("10", actual, "Day of month that is not correct");
		
    		//Grabbing timepicker values to make sure that everything is set correctly
    		var timePicker = datepicker.find("time");
    		var hours = timePicker.find("hours").getElement().value;
    		var minutes = timePicker.find("minutes").getElement().value;
    		
    		actual = hours +":"+minutes;
    		$A.test.assertEquals("11:23", actual, "The default value put in the inputText box, is not the value in the timePicker");
    	}]
    },
    
 	/**
 	 * Firing the openPicker component event should open the date picker.
 	 */
 	testOpenDatePickerWithComponentEvent : {
            test : function(cmp) {
            		var dateTimePickerTest = cmp.find("dateTimePickerTest");
            		var openDatePickerEvt = dateTimePickerTest.getEvent("openPicker");
            		$A.test.assertNotUndefinedOrNull(openDatePickerEvt, "Didn't find an openPicker event");
            		openDatePickerEvt.fire();
            		var datePicker = dateTimePickerTest.find("datePicker").getElement();
            		$A.test.addWaitFor(true, function(){return $A.util.hasClass(datePicker, "visible")});
 		}
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
    
    /**
     * We have to ways that we need to get elements. Either from a output/select combo or from a header tag  
     */
    getTextFromElm: function(cmp){
    	if(this.isViewDesktop()){
        	return $A.util.getText(cmp.find("calTitle").getElement());
        }
	
    	var year = cmp.find("yearTitle").getElement().value;
    	var month = $A.util.getText(cmp.find("monthTitle").getElement());
		
    	return month +" "+year;
    },
    
    openDatePicker : function(cmp) {
    	var opener = cmp.find("dateTimePickerTest").find("datePickerOpener").getElement();
    	var inputBox = cmp.find("dateTimePickerTest").find("inputText").getElement();
	var datePicker = cmp.find("dateTimePickerTest").find("datePicker").getElement();
	if($A.util.isUndefinedOrNull(opener)) {
            $A.test.clickOrTouch(inputBox);
	} else {
            $A.test.clickOrTouch(opener);
	}
	$A.test.addWaitFor(true, function(){return $A.util.hasClass(datePicker, "visible")});
    },
    
    /*
     *  Checking for numbers that are less than 10, if it is adding in a 0 to the front 
     */
    twoDigitFormat : function(num){
	num = "" + num;
	if(num.length < 2){
	    return "0" + num;
	}
	
	return "" + num;
    },
    
    getCleanDate : function(dateValue, hasTime) {
    	var dateSep = "/";
    	var timeSep = ":";
    	var someDate = dateValue ? new Date(dateValue) : new Date();
    	var retDate = this.twoDigitFormat(someDate.getMonth()+1) + dateSep +
    		this.twoDigitFormat(someDate.getDate()) + dateSep +
    		someDate.getFullYear();
    	if (hasTime) {
    	        var mod = someDate.getHours()%12;
    	        
    	        if(mod == 0){
    	            mod = 12;
    	        }
		retDate += " " + this.twoDigitFormat(mod) + timeSep + this.twoDigitFormat(someDate.getMinutes());	
    	}
    	return retDate;
    }
})