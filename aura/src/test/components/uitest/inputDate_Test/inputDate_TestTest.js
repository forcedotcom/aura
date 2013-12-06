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
 	 * Opening date picker with no value set will open datePicker to todays date.
 	 */
 	testDatePickerOpensToToday : {
 		test : function(cmp) {
 			var today = new Date();
 			var expectedDay = today.getDate();
      		var expectedMonthYear = this.convertMonth(today.getMonth()) + " " + today.getFullYear();
      		
      		this.openDatePicker(cmp);
      		var curDate = $A.test.getActiveElement();
      		$A.test.assertEquals(expectedDay.toString(), $A.util.getText(curDate), "Date picker did not open to todays day");
      		
      		var title = cmp.find("datePickerTestCmp").find("datePicker").find("calTitle");
      		var titleText = $A.util.getText(title.getElement());
      		$A.test.assertEquals(expectedMonthYear, titleText, "Date picker did not open to todays month and year");
 		}
 	},
 	
 	/**
 	 * Clicking on a date on the datePicker will select the date and close the calendar.
 	 */
	testClickonDayWorks : { 
		attributes : {value : "2013-09-25"},
  		test : [function(cmp) {
      		this.openDatePicker(cmp);
  		}, function(cmp) {
  			var datePicker = cmp.find("datePickerTestCmp").find("datePicker").getElement();
      		var curDate = $A.test.getActiveElement();
      		var tbody = curDate.parentNode.parentNode.parentNode;
      		var aboveCurrentDate = tbody.children[2].children[3].children[0];
      		aboveCurrentDate.click();
      		$A.test.addWaitFor(false, function(){return $A.util.hasClass(datePicker, "visible")});
  		}, function(cmp) {
  			var dateValue = cmp.find("datePickerTestCmp").find("inputText").getElement().value;
  			$A.test.assertEquals("2013-09-18", dateValue.toString(), "Clicking on one week prior to todays date did not render the correct result.");
		}]
    },
    /**
     * Testing that all 12 months, appear in the correct order
     */
    testValidateMonths :{
        attributes : {value: "2245-01-01", format: "MM-dd-yyyy"},
        test : [function(cmp) {
  			this.openDatePicker(cmp);
		},function(cmp) {

		    var actual = "";
	            var expected = "";
	            var datePicker = cmp.find("datePickerTestCmp").get('datePicker');

	            for(var i = 0; i<12; i++){
	        	expected = this.convertMonth(i) + " 2245";
	        	actual   = $A.util.getText(datePicker.get('calTitle').getElement());	                
	        	$A.test.assertEquals(expected, actual, "Month year Combo incorrect incorrect");
	        	datePicker.get('c.goToNextMonth').runDeprecated({});
	            }

	            expected = "January 2246";
	            actual   = $A.util.getText(datePicker.get('calTitle').getElement());	 
	            $A.test.assertEquals(expected, actual, "Month year Combo incorrect incorrect");

	    }] 
    }, 

    /**
     * Testing arrow combination of increasing month, and decreasing year
     */
    testDecreaseMonthAndIncreaseYear :{
        attributes : {value: "2012-09-10", format: "MM-dd-yyyy"},
        test : [function(cmp) {
		  this.openDatePicker(cmp);
		},function(cmp) {
	            var expected = "February 2017"
	            var datePicker = cmp.find("datePickerTestCmp").get('datePicker');

	            this.iterateCal(7, 5, datePicker.get('c.goToPrevMonth'), datePicker.get('c.goToNextYear'));
	            var actual   = $A.util.getText(datePicker.get('calTitle').getElement());

	            $A.test.assertEquals(expected, actual, "Month year combo incorrect");       
	    }] 
    },
    /**
     * Testing arrow combination of decrease month, and increasing year
     */
    testDecreaseMonthAndDecreaseYear :{
        attributes : {value: "2012-09-10", format: "MM-dd-yyyy"},
        test : [function(cmp) {
    		this.openDatePicker(cmp);
    		},function(cmp) {
	            var expected = "February 1997"
	                var datePicker = cmp.find("datePickerTestCmp").get('datePicker');
	                this.iterateCal(7, 15, datePicker.get('c.goToPrevMonth'), datePicker.get('c.goToPrevYear'));
	                var actual   = $A.util.getText(datePicker.get('calTitle').getElement());

	                $A.test.assertEquals(expected, actual, "Initial value incorrect");       

	    }] 
    },
    /**
     * Testing arrow combination of increasing month, and  decrease year
     */
    testIncreaseMonthAndDecreaseYear :{
        attributes : {value: "2038-09-10", format: "MM-dd-yyyy"},
        test : [function(cmp) {
			this.openDatePicker(cmp);
		},function(cmp) {
	            var expected = "September 2029"
	                var datePicker = cmp.find("datePickerTestCmp").get('datePicker');
	                this.iterateCal(12, 10, datePicker.get('c.goToNextMonth'), datePicker.get('c.goToPrevYear'));
	                var actual   = $A.util.getText(datePicker.get('calTitle').getElement());

	                $A.test.assertEquals(expected, actual, "Initial value incorrect");       

	    }] 
    },
    /**
     * Acessibility test, making sure that any functionality added is still accessible
     */
    testAccessibile : {
    	attributes : {value: "2038-09-10", format: "MM-dd-yyyy"},
    	        test : [function(cmp) {
    	  			this.openDatePicker(cmp);
    	    	}, function(cmp) {	
    	    		$A.test.assertAccessible();
    	    	}]
    	    },
    /**
     * Testing arrow combination of increasing month, and year
     */
    testIncreaseMonthAndYear :{
        attributes : {value: "2012-09-10", format: "MM-dd-yyyy"},
        test : [function(cmp) {
    			this.openDatePicker(cmp);
    		},function(cmp) {
	            var expected = "September 2023"
	                var datePicker = cmp.find("datePickerTestCmp").get('datePicker');
	                this.iterateCal(12, 10, datePicker.get('c.goToNextMonth'), datePicker.get('c.goToNextYear'));
	                var actual   = $A.util.getText(datePicker.get('calTitle').getElement());

	                $A.test.assertEquals(expected, actual, "Initial value incorrect");       

	    }]

    },
    
    /**
     * On mobile there should be a inputSelect to choose year.
     */
    testYearSelectorOnMobile : {
    	browsers : ["IPHONE"],
    	attributes : {value: "2012-12-10"},
    	test : function(cmp) {
    		var yearTitle = cmp.find("datePickerTestCmp").get('datePicker').find("yearTitle");
    		$A.test.assertFalse($A.util.isUndefinedOrNull(yearTitle), 
    			"year input select not fond");
    	}
    },
    
    /**
     * On mobile incrementing month past December increments year selector to next year.
     */
    testYearSelectorGoToNextYear : {
    	browsers : ["IPHONE"],
    	attributes : {value: "2012-12-10"},
    	test : function(cmp) {
    		var datePicker = cmp.find("datePickerTestCmp").get('datePicker');
	        var yearTitle = cmp.find("datePickerTestCmp").get('datePicker').find("yearTitle");
	        this.iterateCal(1, 0, datePicker.get('c.goToNextMonth'), datePicker.get('c.goToNextYear'));
	        var actualGirdValue = datePicker.find("grid").get("v.year");        
	        var actualSelectValue = yearTitle.get("v.value");
	        $A.test.assertEquals("2013", actualGirdValue, "Grid value incorrect");     
	        $A.test.assertEquals("2013", actualSelectValue, "Year select value incorrect");    
    	}
    },
    testDocumentLevelHandler:{
        //For iphone/ipad:
        //when the date picker is up, it suppose to take the whole screen. there is no 'other place' you can 'touch'
		browsers: ["-IPHONE","-IPAD"],
        test:function(component){
        	var input_date = component.find("datePickerTestCmp");
            var date_picker = input_date.find("datePicker");
            date_picker.getValue("v.visible").setValue(true);
            //this rerender is necessary: we need dataPickerRenderer to updateGlobalEventListeners
            $A.rerender(component);
            //date picker should disappear when click anywhere outside of it, like on the outputText
            var output_text = document.getElementById("dlh_outputText");
            //one event is enough to make date picker disappear, just to simulate mouse click, we have both here
            $A.test.fireDomEvent(output_text, "mousedown");
            $A.test.fireDomEvent(output_text, "mouseup");
            $A.test.assertFalse(date_picker.get("v.visible"));
        }
    },
    iterateCal : function(monthIter, yearIter, monthButton, yearButton){
          var i;
          for(i = 0; i< monthIter; i++){
              monthButton.runDeprecated({});
          }
          
          for(i = 0; i< yearIter; i++){
             yearButton.runDeprecated({});
          }
          
    },
   openDatePicker : function(cmp) {
    	var opener = cmp.find("datePickerTestCmp").find("datePickerOpener").getElement();
		var inputBox = cmp.find("datePickerTestCmp").find("inputText").getElement();
	    var datePicker = cmp.find("datePickerTestCmp").find("datePicker").getElement();
	    if($A.util.isUndefinedOrNull(opener)) {
	    	inputBox.click();
		} else {
			opener.click();
		}
		$A.test.addWaitFor(true, function(){return $A.util.hasClass(datePicker, "visible")});
    },
    
    convertMonth : function(intMonth) {
    	if ($A.util.isUndefinedOrNull(intMonth)) {
    		return intMonth;
    	}
    	
    	if (intMonth == 0) {
    		return "January";
    	} else if (intMonth == 1) {
    		return "February";
    	} else if (intMonth == 2) {
    		return "March";
    	} else if (intMonth == 3) {
    		return "April";
    	} else if (intMonth == 4) {
    		return "May";
    	} else if (intMonth == 5) {
    		return "June";
    	} else if (intMonth == 6) {
    		return "July";
    	} else if (intMonth == 7) {
    		return "August";
    	} else if (intMonth == 8) {
    		return "September";
    	} else if (intMonth == 9) {
    		return "October";
    	} else if (intMonth == 10) {
    		return "November";
    	} else if (intMonth == 11) {
    		return "December";
    	}
    }
    
})