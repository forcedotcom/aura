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
    		var value = cmp.find("dateTimePickerTest").get("v.value");
    		$A.test.assertEquals("2012-09-10 11:23", value, "Initial value incorrect");
    		
    		this.openDatePicker(cmp);
    	}, function(cmp) {
    		var datePicker = cmp.find("dateTimePickerTest").find("datePicker");
    		var cancelLink = datePicker.find("cancel").getElement();
    		
    		cancelLink.click();
    		$A.test.addWaitFor(false, function(){return $A.util.hasClass(datePicker.getElement(), "visible")});
    		
    		value = cmp.find("dateTimePickerTest").get("v.value");
    		$A.test.assertEquals("2012-09-10 11:23", value, "Cancel was pressed value should not have changed");
    	}]
    },
    
    /**
 	 *  Test set link sets the appropriate date/time.
 	 */
    // TODO : @ctatlah - figure out why time is different when test runs on autobuilds
    _testSetLink : {
    	attributes : {format: "M/dd/yyyy hh:mm"},
    	test : [function(cmp) {
    		var value = cmp.find("dateTimePickerTest").get("v.value");
    		$A.test.assertEquals(undefined, value, "Initial value incorrect");
    		
    		this.openDatePicker(cmp);
    	}, function(cmp) {
    		var datePicker = cmp.find("dateTimePickerTest").find("datePicker");
    		var setLink = datePicker.find("set").getElement();
    		
    		setLink.click();
    		$A.test.addWaitFor(false, function(){return $A.util.hasClass(datePicker.getElement(), "visible")});
    		
    		var expectedDate = this.getCleanDate(null, true);
    		value = cmp.find("dateTimePickerTest").get("v.value");
    		var setDate = this.getCleanDate(value, true);
    		
    		$A.test.assertEquals(expectedDate, setDate, "Incorrect datetime was set.");
    	}]
    },
    
    /**
 	 *  If value is set for date/time when opening up dateTimePicker it opens to the date of set value.
 	 */
    testCalendarWithTimeValuePreSet : {
    	attributes : {value: "2012-09-10 11:23", format: "MM-dd-yyyy hh:mm"},
    	test : function(cmp) {
    		this.openDatePicker(cmp);
    		var expectedText = "September 2012";
    		var title = cmp.find("dateTimePickerTest").find("datePicker").find("calTitle");
    		var titleText = $A.test.getText(title.getElement());
	    	$A.test.assertEquals(expectedText, titleText);
    	}
    },
    
    openDatePicker : function(cmp) {
    	var opener = cmp.find("dateTimePickerTest").find("datePickerOpener").getElement();
		var inputBox = cmp.find("dateTimePickerTest").find("inputText").getElement();
	    var datePicker = cmp.find("dateTimePickerTest").find("datePicker").getElement();
	    if($A.util.isUndefinedOrNull(opener)) {
	    	inputBox.click();
		} else {
			opener.click();
		}
		$A.test.addWaitFor(true, function(){return $A.util.hasClass(datePicker, "visible")});
    },
    
    getCleanDate : function(dateValue, hasTime) {
    	var dateSep = "-";
    	var timeSep = ":";
    	var someDate = dateValue ? new Date(dateValue) : new Date();
    	var retDate = someDate.getMonth() + dateSep +
    		someDate.getDate() + dateSep +
    		someDate.getFullYear()
    	if (hasTime) {
    		retDate += " " + someDate.getHours() + timeSep +
    			someDate.getMinutes();
    	}
    	return retDate;
    }
})