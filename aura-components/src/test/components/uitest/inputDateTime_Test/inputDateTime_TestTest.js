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
	  *  This only exists in non desktop devices
      */
    testCancelLink : {
		browsers: [ '-GOOGLECHROME', '-IE11', '-IE10', '-IE9', '-IE8', '-IE7', '-FIREFOX', '-SAFARI'],
		attributes : {value: "2012-09-10 11:23", format: "MM-dd-yyyy hh:mm"},
    	test : [function(cmp) {
    		var input = cmp.find("dateTimePickerTest").find("inputDate").getElement();
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
	  *  This only exists in non desktop devices
      */
	 testSetLink : {
		browsers: [ '-GOOGLECHROME', '-IE11', '-IE10', '-IE9', '-IE8', '-IE7', '-FIREFOX', '-SAFARI'],
		attributes : {format: "MM/dd/yyyy hh:mm"},
    	test : [function(cmp) {
    		var input = cmp.find("dateTimePickerTest").find("inputDate").getElement();
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
    		var setDate = cmp.find("dateTimePickerTest").find("inputDate").getElement().value;

    		$A.test.assertEquals(expectedDate, setDate, "Incorrect datetime was set.");
    	}]
    },

    /**
     * Acessibility test, making sure that any functionality added is still accessible
     *
     */
    testAccessible : {
        attributes : {
            value: "2012-09-10 11:23",
            format: "MM-dd-yyyy hh:mm"
        },
        test : [function(cmp) {
            this.openDatePicker(cmp);
        }, function(cmp) {
            $A.test.assertAccessible();
        }]
     },

    /**
      *  If value is set for date/time when opening up dateTimePicker it opens to the date of set value.
      */
    _testCalendarWithTimeValuePreSet : {
    	attributes : {value: '2012-09-10T11:23Z', format: 'MM/dd/yyyy HH:mm', dateFormat: 'MM/dd/yyyy', timeFormat: 'HH:mm', timezone: 'GMT'},
    	test : [function(cmp) {
    		 this.openDatePicker(cmp);
    	}, function(cmp) {
    		var expected = "September 2012";
    		var datepicker = cmp.find("dateTimePickerTest").find("datePicker");
    		var actual = this.getTextFromElm(datepicker);

    		$A.test.assertEquals(expected, actual, "Month year of datePicker is not valid");
    		actual = $A.util.getText($A.test.getElementByClass("selectedDate")[0]);
    		$A.test.assertEquals("10", actual, "Day of month that is not correct");

			if (!this.isViewDesktop()) {
				//Grabbing timepicker values to make sure that everything is set correctly
				var timePicker = datepicker.find("time");
				var hours = timePicker.find("hours").getElement().value;
				var minutes = timePicker.find("minutes").getElement().value;

				actual = hours +":"+minutes;
				$A.test.assertEquals("11:23", actual, "The default value put in the inputDate box, is not the value in the timePicker");
			}
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
     * Verify behavior when 'timeFormat' attribute is not set.
     * Also checks for default 'langLocale'
     */
    testDefaultTimeFormat: {
		browsers: ['DESKTOP'],
        attributes : {value:'2015-10-23T16:30:00.000Z', dateFormat:'MM-dd-yyyy', timezone:'GMT'},
        test: function(cmp){
            this.checkInputTimeValue(cmp, '4:30 PM');
        }
    },

    /**
     * Verify behavior when 'timeFormat' attribute is assigned an empty string.
     */
    testEmptyTimeFormat: {
        browsers: ['DESKTOP'],
        attributes : {value:'2015-10-23T16:30:00.000Z', dateFormat:'MM-dd-yyyy', timeFormat:'', timezone:'GMT'},
        test: function(cmp){
            this.checkInputTimeValue(cmp, '4:30:00 PM');
        }
    },

    /**
     * Verify behavior when 'timeFormat' attribute is assigned a garbage value.
     */
    testInvalidTimeFormat: {
        browsers: ['DESKTOP'],
        attributes : {value:'2015-10-23T16:30:00.000Z', dateFormat:'MM-dd-yyyy', timeFormat:'KKKKKK', timezone:'GMT'},
        test: [function(cmp){
            this.checkInputTimeValue(cmp, 'KKKKKK');
        }]
    },

    /**
     * Verify behavior when 'timeFormat' attribute is assigned a correct value.
     */
    testValidTimeFormat: {
        browsers: ['DESKTOP'],
        attributes : {value:'2015-10-23T16:30:00.000Z', dateFormat:'MM-dd-yyyy', timeFormat:'HH:mm', timezone:'GMT'},
        test: [function(cmp){
            this.checkInputTimeValue(cmp, '16:30');
        }]
    },

 	testInvalidDateTimeInput: {
		browsers: ['DESKTOP'],
		attributes : {value:'2015-10-23T16:30:00.000Z', dateFormat:'MM-dd-yyyy', timeFormat:'HH:mm', timezone: 'GMT'},
		 test: function(cmp){
			 var inputDateTimeCmp = cmp.find("dateTimePickerTest");
			 var inputDateElement = inputDateTimeCmp.find("inputDate").getElement();
			 var inputTimeElement = inputDateTimeCmp.find("inputTime").getElement();
			 var date = "10-23-2015";
			 var time = "16:30";

			 var invalidDates = [
				 "15-10-2015",
				 "10-40-2015",
				 "1/6/2015",
				 "01-02-20a5",
				 "10102015",
				 "Sep 10th, 2015",
				 "abcefghijklm"];

			 for (var i = 0; i < invalidDates.length; i++) {
				 inputDateElement.value = invalidDates[i];
				 $A.test.fireDomEvent(inputDateElement, "change");
				 var expectedValue = invalidDates[i] + " " + time;
				 aura.test.assertEquals(expectedValue, inputDateTimeCmp.get("v.value"), "value should not change when input is invalid");
				 aura.test.assertEquals(invalidDates[i], inputDateElement.value, "input value doesn't change on invalid input");
			 }

			 inputDateElement.value = date;
			 var invalidTimes = [
				 "10:60 PM",
				 "25:30",
				 "12.32 AM",
				 "20:45 PM",
				 "abcefghijklm"];

			 for (var i = 0; i < invalidTimes.length; i++) {
				 inputTimeElement.value = invalidTimes[i];
				 $A.test.fireDomEvent(inputTimeElement, "change");
				 expectedValue = date + " " + invalidTimes[i];
				 aura.test.assertEquals(expectedValue, inputDateTimeCmp.get("v.value"), "value should change even when input is invalid");
				 aura.test.assertEquals(invalidTimes[i], inputTimeElement.value, "input value doesn't change on invalid input");
			 }
		 }
	 },

	 testValidDateTimeInput: {
		 browsers: ['DESKTOP'],
		 attributes : {value:'2015-10-23T16:30:00.000Z', dateFormat:'MM-dd-yyyy', timeFormat:'hh:mm a', timezone:'GMT'},
		 test: function(cmp){
			 var inputDateTimeCmp = cmp.find("dateTimePickerTest");
			 var inputDateElement = inputDateTimeCmp.find("inputDate").getElement();
			 var inputTimeElement = inputDateTimeCmp.find("inputTime").getElement();


			 var validTimes = {
				 "12:30 pm": "2015-10-23T12:30:00.000Z",
				 "12:30PM": "2015-10-23T12:30:00.000Z",
				 "12:30 PM": "2015-10-23T12:30:00.000Z",
			 };

			 for (var key in validTimes) {
				 if (validTimes.hasOwnProperty(key)) {
					 var validTime = key;
					 var expectedValue = validTimes[key];
					 inputTimeElement.value = validTime;
					 $A.test.fireDomEvent(inputTimeElement, "change");
					 aura.test.assertEquals(expectedValue, cmp.get("v.value"), "value should change when input is valid");
				 }
			 }

			 var validDates = {
				 "11-15-2015": "2015-11-15T12:30:00.000Z",
				 "8-23-2015": "2015-08-23T12:30:00.000Z",
				 "8-8-2015": "2015-08-08T12:30:00.000Z",
				 "01-02-2015": "2015-01-02T12:30:00.000Z"
			 };

			 for (var key in validDates) {
				 if (validDates.hasOwnProperty(key)) {
					 var validDate = key;
					 var expectedValue = validDates[key];
					 inputDateElement.value = validDate;
					 $A.test.fireDomEvent(inputDateElement, "change");
					 aura.test.assertEquals(expectedValue, cmp.get("v.value"), "value should change when input is valid");
				 }
			 }
		 }
	 },

	 testSingleDateTimeInput: {
		 browsers: ['DESKTOP'],
		 attributes : {useSingleInput: 'true', value:'2015-10-23T16:30:00.000Z' , format: "MM-dd-yyyy hh:mm A", timezone: 'GMT'},
		 test: function(cmp) {
			 var inputDateTimeCmp = cmp.find("dateTimePickerTest");
			 var inputDateTimeElement = inputDateTimeCmp.find("inputDate").getElement();
			 inputDateTimeElement.value = "10-24-2015 04:35 PM";
			 $A.test.fireDomEvent(inputDateTimeElement, "change");
			 aura.test.assertEquals('2015-10-24T16:35:00.000Z', cmp.get("v.value"), "value should update when input is changed");
		 }
	 },

	 /**
	  * Clear date without clearing time
	  */
	 testClearDate: {
        browsers: ['DESKTOP'],
		 attributes : {value:'2015-10-23T16:30:00.000Z', dateFormat:'MM-dd-yyyy', timeFormat:'hh:mm a', timezone:'GMT'},
		 test: function(cmp){
			 var inputDateTimeCmp = cmp.find("dateTimePickerTest");
			 var inputDateElement = inputDateTimeCmp.find("inputDate").getElement();
			 var inputTimeElement = inputDateTimeCmp.find("inputTime").getElement();

			 inputDateElement.value = "";
			 $A.test.fireDomEvent(inputDateElement, "change");
			 aura.test.assertEquals("2015-10-23T16:30:00.000Z", cmp.get("v.value"), "Date and time should not be reset");
		 }
	 },

	 /**
	  * Clear time without clearing date
	  */
	 testClearTime: {
        browsers: ['DESKTOP'],
		 attributes : {value:'2015-10-23T16:30:00.000Z', dateFormat:'MM-dd-yyyy', timeFormat:'hh:mm a', timezone:'GMT'},
		 test: function(cmp){
			 var inputDateTimeCmp = cmp.find("dateTimePickerTest");
			 var inputDateElement = inputDateTimeCmp.find("inputDate").getElement();
			 var inputTimeElement = inputDateTimeCmp.find("inputTime").getElement();

			 inputTimeElement.value = "";
			 $A.test.fireDomEvent(inputTimeElement, "change");
			 aura.test.assertEquals("2015-10-23T12:00:00.000Z", cmp.get("v.value"), "Time should be reset");
		 }
	 },

	 /**
	  * Clear date and time
	  */
	 testClearDateAndTime: {
        browsers: ['DESKTOP'],
		 attributes : {value:'2015-10-23T16:30:00.000Z', dateFormat:'MM-dd-yyyy', timeFormat:'hh:mm a', timezone:'GMT'},
		 test: function(cmp){
			 var inputDateTimeCmp = cmp.find("dateTimePickerTest");
			 var inputDateElement = inputDateTimeCmp.find("inputDate").getElement();
			 var inputTimeElement = inputDateTimeCmp.find("inputTime").getElement();

			 inputDateElement.value = "";
			 inputTimeElement.value = "";
			 $A.test.fireDomEvent(inputDateElement, "change");
			 aura.test.assertEquals("", cmp.get("v.value"), "value should be empty");
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
    	var inputBox = cmp.find("dateTimePickerTest").find("inputDate").getElement();
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
    },

    checkInputTimeValue: function(cmp, expectedValue) {
        var inputTimeElement = cmp.find("dateTimePickerTest").find("inputTime").getElement();
        var actualValue = $A.util.getElementAttributeValue(inputTimeElement, "value");
        $A.test.assertEquals(expectedValue, actualValue, "Time value is not as expected!");
    }
})

