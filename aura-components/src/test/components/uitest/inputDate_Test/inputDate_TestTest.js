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
            test : [function(cmp) {                      
                        this.openDatePicker(cmp);
                    }, function(cmp) {
                    	var today = new Date();
                        var expectedDay = today.getDate();
                        var expected = this.convertMonth(today.getMonth()) + " " + today.getFullYear();

                        var curDate = $A.test.getElementByClass("todayDate")[0];

                        $A.test.assertEquals(expectedDay.toString(), $A.util.getText(curDate), "Date picker did not open to todays day");

                        var actual = this.getTextFromElm(cmp.find("datePickerTestCmp").find("datePicker"));
                        $A.test.assertEquals(expected, actual, "Date picker did not open to todays month and year");
 		            }]
 	},

 	/**
 	 * Clicking on a date on the datePicker will select the date and close the calendar.
 	 */
	testClickOnDayWorks : { 
            attributes : {value : "2013-09-25"},
            test : [function(cmp) {
                         this.openDatePicker(cmp);
  		            }, function(cmp) {
                         var datePicker = cmp.find("datePickerTestCmp").find("datePicker");
                         var pastWeek   = datePicker.find("grid").find("17");
                         pastWeek.getEvent("click").fire({});
  			
                         $A.test.addWaitFor(false, function(){return $A.util.hasClass(datePicker, "visible")});
  		            }, function(cmp) {
                         var expected = "2013-09-18";
                         var actual = cmp.find("datePickerTestCmp").find("inputText").getElement().value;
                         $A.test.assertEquals(expected, actual.toString(), "Clicking on one week prior to todays date did not render the correct result.");
		           }]	
    },

    /**
     * Testing that all 12 months, appear in the correct order
     */
    testValidateMonths :{
        attributes : {value: "2043-01-01", format: "MM-dd-yyyy"},
        doNotWrapInAuraRun : true,
        test : [function(cmp) {
                     this.openDatePicker(cmp);
		},function(cmp) {
                     var actual = "";
                     var expected = "";
                     var datePicker = cmp.find("datePickerTestCmp").find('datePicker');

                     for(var i = 0; i<12; i++){
                             expected = this.convertMonth(i) + " 2043";
                             actual   = this.getTextFromElm(datePicker);	                
                             $A.test.assertEquals(expected, actual, "Month year Combo incorrect incorrect");
                             datePicker.get('c.goToNextMonth').runDeprecated({});
                      }

                      expected = "January 2044";
                      actual   = this.getTextFromElm(datePicker);	 
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
                      datePicker = cmp.find("datePickerTestCmp").find('datePicker');

                      this.iterateCal(7, 5, datePicker.get('c.goToPrevMonth'), datePicker.get('c.goToNextYear'));
		     },function(cmp) { 
                      var expected = "February 2017";
                      var actual   = this.getTextFromElm(datePicker);
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
                       datePicker = cmp.find("datePickerTestCmp").find('datePicker');
                       this.iterateCal(7, 15, datePicker.get('c.goToPrevMonth'), datePicker.get('c.goToPrevYear'));
    		},function(cmp) {
                       var expected = "February 1997";
                       var actual   = this.getTextFromElm(datePicker);
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
                      datePicker = cmp.find("datePickerTestCmp").find('datePicker');
                      
                      this.iterateCal(12, 10, datePicker.get('c.goToNextMonth'), datePicker.get('c.goToPrevYear'));
		    },function(cmp) {
                      var expected = "September 2029";
                      var actual   = this.getTextFromElm(datePicker);
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
               },function(cmp) {
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
    		        datePicker = cmp.find("datePickerTestCmp").find('datePicker');
    		        this.iterateCal(12, 10, datePicker.get('c.goToNextMonth'), datePicker.get('c.goToNextYear'));
    		  },function(cmp) {
    		        var expected = "September 2023";
    		        var actual   = this.getTextFromElm(datePicker);
    		        $A.test.assertEquals(expected, actual, "Initial value incorrect");
    		 }]
    },

    /**
     * On mobile there should be a inputSelect to choose year.
     */
    testYearSelector_Mobile : {
    	browsers : ["IPHONE"],
    	attributes : {value: "2012-12-10"},
    	test : function(cmp) {
    	             var yearTitle = cmp.find("datePickerTestCmp").find('datePicker').find("yearTitle");
    	             $A.test.assertFalse($A.util.isUndefinedOrNull(yearTitle), "year input select not found");
    	}
    },

    /**
     * On mobile incrementing month past December increments year selector to next year.
     */
    testYearSelectorGoToNextYear_Mobile : {
    	browsers : ["IPHONE"],
    	attributes : {value: "2012-12-10"},
    	test :  [function(cmp) {
    	               this.openDatePicker(cmp);
		},function(cmp) {
		       var datePicker = cmp.find("datePickerTestCmp").find('datePicker');
		       var yearTitle = cmp.find("datePickerTestCmp").find('datePicker').find("yearTitle");
	        
               this.iterateCal(1, 0, datePicker.get('c.goToNextMonth'), datePicker.get('c.goToNextYear'));
               var expected = "2013";
               var actualGirdValue = ""+datePicker.find("grid").get("v.year");        
               var actualSelectValue = ""+yearTitle.getElement().value;
               $A.test.assertEquals(expected, actualGirdValue, "Grid value incorrect"); 
               $A.test.assertEquals(expected, actualSelectValue, "Year select value incorrect");    
    	}]
    },
    /**
     * For iphone/ipad, when the date picker is up, it suppose to take the whole screen. there is no 'other place' you can 'touch'
     */
    testDocumentLevelHandler:{
        browsers: ["-IPHONE","-IPAD"],
        test : [function(component){
                    input_date = component.find("datePickerTestCmp");
                     date_picker = input_date.find("datePicker");
                    date_picker.set("v.visible", true);
        }, function(cmp){  
                  
                    //date picker should disappear when click anywhere outside of it, like on the outputText
                    var output_text = document.getElementById("dlh_outputText");
                  
                    //one event is enough to make date picker disappear, just to simulate mouse click, we have both here
                    $A.test.fireDomEvent(output_text, "mousedown");
                    $A.test.fireDomEvent(output_text, "mouseup");
                    $A.test.assertFalse(date_picker.get("v.visible"));
        }]
    },
    
 	/**
 	 * Firing the openPicker component event should open the date picker.
 	 */
 	testOpenDatePickerWithComponentEvent : {
            test : function(cmp) {
            		var datePickerTestCmp = cmp.find("datePickerTestCmp");
            		var openDatePickerEvt = datePickerTestCmp.getEvent("openPicker");
            		$A.test.assertNotUndefinedOrNull(openDatePickerEvt, "Didn't find an openPicker event");
            		openDatePickerEvt.fire();
            		var datePicker = datePickerTestCmp.find("datePicker").getElement();
            		$A.test.addWaitFor(true, function(){return $A.util.hasClass(datePicker, "visible")});
 		}
 	},

    /**
     * Clear date icon should be displayed on mobile only and clears date.
     */
    _testClearButton: {
    	test: [function(component) {
    		// initially no clear icon
    		this.verifyClearIcon(false);
    		this.openDatePicker(component);
    	}, function(component) {
    		this.selectTodaysDate(component);
    	}, function(component) {
    		// need a timeout for mobile devices. There is a delay 
    		// after datepicker closes until clear icon shows on mobile.
    		// Meaning icon does not show fast enough on mobile devices
    		// causing test to verify icon while clear icon is not
    		// present. Desktop is able to show clear icon as soon as
    		// datepicker closes.
    		setTimeout(function() { 
    			// verify clear icon
	    		if (this.isViewDesktop()) {
	    			// on desktop clear icon should not be present
	    			this.verifyClearIcon(false);
	    		} else {
	    			// on mobile clear icon should be present
	    			this.verifyClearIcon(true);
	    			this.clickClearIcon(component);
	    		}
    		}, 500);
    	}]
    	
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
  
                           if($A.util.isUndefinedOrNull(opener) || !this.isViewDesktop()) {
                               $A.test.clickOrTouch(inputBox);
                           } else {
                               $A.test.clickOrTouch(opener);
                           }
                           $A.test.addWaitFor(true, function(){return $A.util.hasClass(datePicker, "visible")});
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
    getTextFromElm: function (cmp) {
        if (this.isViewDesktop()) {
            return $A.util.getText(cmp.find("calTitle").getElement());
        }

        var year = cmp.find("yearTitle").getElement().value;
        // On iOS getting the text out of the span doesn't return the newly rendered value; getting
        // the component value instead.
        var month = cmp.find("monthTitle").get("v.value");
        return month + " " + year;
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
    },
    
    verifyClearIcon : function(isVisible) {
    	var clearIcon = $A.test.getElementByClass("clearIcon");
    	if (isVisible) {
    		$A.test.assertTrue($A.util.hasClass(clearIcon, "display"), "Clear icon should be visible");
    	} else {
    		$A.test.assertFalse($A.util.hasClass(clearIcon, "display"), "Clear icon SHOULD NOT be visible");
    	}
    },
    
    clickClearIcon : function(cmp) {
    	var inputText = cmp.find("datePickerTestCmp").find("inputText");
        var clearIcon = $A.test.getElementByClass("clearIcon");
        $A.test.clickOrTouch(clearIcon);
        $A.test.addWaitFor("", function(){return inputText.get("v.value");});
    },
    
    selectTodaysDate : function(cmp) {
    	var datePicker = cmp.find("datePickerTestCmp").find("datePicker");
		var todayBtn = datePicker.find("today");
		todayBtn.get("e.press").fire();
		$A.test.addWaitFor(true, function(){
			var isVisible = $A.util.hasClass(datePicker, "visible");
			var val = cmp.find("datePickerTestCmp").find("inputText").get("v.value");
			return !isVisible && val !== "";
		});
    }
})
