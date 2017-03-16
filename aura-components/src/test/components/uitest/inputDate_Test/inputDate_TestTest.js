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
     * Verify that clear both mobile and desktop inputDate's value
     * by setting the value passed to the component to empty string
     * Test case for W-3188216
     */
    testClearDate: {
        attributes: {value: "2013-09-25"},
        test: [function(cmp) {
            var expected = "2013-09-25";
            // component structure is different in mobile vs desktop
            // so use tagName to get the input element
            var inputElm = $A.test.select("input")[0];
            $A.test.assertEquals(expected, inputElm.value,
                    "Initially input should be " + expected);
            // clear button sets v.value to ""
            var clearBtn = cmp.find("clearBtn").getElement();
            $A.test.clickOrTouch(clearBtn);
        }, function(cmp) {
            var inputElm = $A.test.select("input")[0];
            $A.test.assertEquals("", inputElm.value,
                    "Input should be clear");
        }]
    },

    /**
     * Opening date picker with no value set will open datePicker to todays date.
     */
    // TODO(W-2671175): Fails due to GMT/PST timezone difference for user.timezone and actual timezone
    _testDatePickerOpensToToday: {
        test: [function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
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
     * W-3102320: Also verify that there's a zero prepended for single digit month/date
     */
    testClickOnDayWorks: {
        browsers: ['DESKTOP'],
        attributes: {value: "2013-09-25"},
        test: [function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
            var datePicker = cmp.find("datePickerTestCmp").find("datePicker");
            var newDate = datePicker.find("grid").find("1");
            newDate.getElement().click();

            $A.test.addWaitFor(false, function () {
                return $A.util.hasClass(datePicker, "visible")
            });
        }, function (cmp) {
            var expected = "2013-09-02";
            var inputDate = cmp.find("datePickerTestCmp");
            var cmpValue = inputDate.get("v.value");
            var elmValue = inputDate.find("inputText").getElement().value;
            $A.test.assertEquals(expected, elmValue, "Clicking on one week prior to todays date did not render the correct result.");
            $A.test.assertEquals(expected, cmpValue, "Component value is not set correctly");
        }]
    },

    /**
     * Testing that all 12 months, appear in the correct order
     */
    testValidateMonths: {
        browsers: ['DESKTOP'],
        attributes: {value: "2043-01-01", format: "MM-dd-yyyy"},
        doNotWrapInAuraRun: true,
        test: [function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
            var actual = "";
            var expected = "";
            var datePicker = cmp.find("datePickerTestCmp").find('datePicker');

            for (var i = 0; i < 12; i++) {
                expected = this.convertMonth(i);
                actual = this.getTextFromElm(datePicker);
                $A.test.assertEquals(expected, actual, "Month year Combo incorrect incorrect");
                datePicker.get('c.goToNextMonth').runDeprecated({});
            }
            expected = "January";
            actual = this.getTextFromElm(datePicker);
            $A.test.assertEquals(expected, actual, "Month year Combo incorrect incorrect");
        }]
    },

    /**
     * Testing arrow combination of increasing month, and decreasing year
     */
    testDecreaseMonthAndIncreaseYear: {
        browsers: ['DESKTOP'],
        attributes: {value: "2012-09-10", format: "MM-dd-yyyy"},
        test: [function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
            datePicker = cmp.find("datePickerTestCmp").find('datePicker');

            this.iterateCal(7, 5, datePicker.find("prevMonth").getElement(), datePicker.find("yearTitle").getElement());
        }, function (cmp) {
            var expected = "February";
            var actual = this.getTextFromElm(datePicker);
            var self = this;
            $A.test.addWaitForWithFailureMessage(true, function () {
            	actual = self.getTextFromElm(datePicker);
            	if(expected !== actual) {
            		self.iterateCal(7, 5, datePicker.find("prevMonth").getElement(), datePicker.find("yearTitle").getElement());
            		return false;
            	}
            	return true;
            },"Month year combo incorrect");
        }]
    },

    /**
     * Testing arrow combination of decrease month, and increasing year
     */
    testDecreaseMonthAndDecreaseYear: {
        browsers: ['DESKTOP'],
        attributes: {value: "2012-09-10", format: "MM-dd-yyyy"},
        test: [function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
            datePicker = cmp.find("datePickerTestCmp").find('datePicker');
            this.iterateCal(7, -15, datePicker.find("prevMonth").getElement(), datePicker.find("yearTitle").getElement());
        }, function (cmp) {
            var expected = "February";
            var actual = this.getTextFromElm(datePicker);
            $A.test.assertEquals(expected, actual, "Initial value incorrect");
        }]
    },

    /**
     * Testing arrow combination of increasing month, and  decrease year
     */
    testIncreaseMonthAndDecreaseYear: {
        browsers: ['DESKTOP'],
        attributes: {value: "2038-09-10", format: "MM-dd-yyyy"},
        test: [function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
            datePicker = cmp.find("datePickerTestCmp").find('datePicker');

            this.iterateCal(12, -10, datePicker.find("nextMonth").getElement(), datePicker.find("yearTitle").getElement());
        }, function (cmp) {
            var expected = "September";
            var actual = this.getTextFromElm(datePicker);
            $A.test.assertEquals(expected, actual, "Initial value incorrect");
        }]
    },

    /**
     * Acessibility test, making sure that any functionality added is still accessible
     */
    testAccessible: {
        browsers: ['DESKTOP'],
        attributes: {value: "2038-09-10", format: "MM-dd-yyyy"},
        test: [function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
            $A.test.assertAccessible();
        }]
    },

    /**
     * Acessibility test, making sure that any functionality added is still accessible
     */
    testMobileAccessible: {
        browsers: ['MOBILE'],
        attributes: {value: "2038-09-10"},
        test: function (cmp) {
            $A.test.assertAccessible();
        }
    },

    /**
     * Testing arrow combination of increasing month, and year
     */
    testIncreaseMonthAndYear: {
        browsers: ['DESKTOP'],
        attributes: {value: "2012-09-10", format: "MM-dd-yyyy"},
        test: [function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
            datePicker = cmp.find("datePickerTestCmp").find('datePicker');
            this.iterateCal(12, 10, datePicker.find("nextMonth").getElement(), datePicker.find("yearTitle").getElement());
        }, function (cmp) {
            var expected = "September";
            var actual = this.getTextFromElm(datePicker);
            $A.test.assertEquals(expected, actual, "Initial value incorrect");
        }]
    },

    /**
     * Test if entering invalid inputs does not cause crash
     */
    testInvalidInputs: {
        browsers: ['DESKTOP'],
        test: function (cmp) {
            var datePickerTestCmp = null;
            var openDatePickerEvt = null;
            var datePicker = null;
            var inputs = ["abc",
                "ab/cd/efgh",
                "abcd/1a/s2",
                "201a/01/02",
                "1/6/2015",
                "-2013/-06/-2",
                "201.5/.1/2",
                "@#∂ß/7Y/12",
                "",
                " ",
                "    / / "];
            for (var i = 0; i < inputs.length; i++) {
                datePickerTestCmp = cmp.find("datePickerTestCmp");
                openDatePickerEvt = datePickerTestCmp.getEvent("openPicker");
                datePickerTestCmp.set('v.value', inputs[i]);
                openDatePickerEvt.fire();
                datePicker = datePickerTestCmp.find("datePicker").getElement();
                $A.test.addWaitForWithFailureMessage(true, function () {
                    return $A.util.hasClass(datePicker, "visible")
                }, "Error in opening date picker");
            }

        }
    },

    /**
     * Firing the openPicker component event should open the date picker.
     */
    testOpenDatePickerWithComponentEvent: {
        browsers: ['DESKTOP'],
        test: function (cmp) {
            var datePickerTestCmp = cmp.find("datePickerTestCmp");
            var openDatePickerEvt = datePickerTestCmp.getEvent("openPicker");
            $A.test.assertNotUndefinedOrNull(openDatePickerEvt, "Didn't find an openPicker event");
            openDatePickerEvt.fire();
            var datePicker = datePickerTestCmp.find("datePicker").getElement();
            $A.test.addWaitFor(true, function () {
                return $A.util.hasClass(datePicker, "visible")
            });
        }
    },

    testInvalidDateInput: {
        browsers: ['DESKTOP'],
        attributes: {value: '2015-10-23T16:30:00.000Z', format: 'MM-DD-YYYY'},
        test: function (cmp) {
            var inputDateTimeCmp = cmp.find("datePickerTestCmp");
            var inputDateElement = inputDateTimeCmp.find("inputText").getElement();

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
                var expectedValue = invalidDates[i];
                aura.test.assertEquals(expectedValue, inputDateTimeCmp.get("v.value"), "value should not change when input is invalid");
                aura.test.assertEquals(invalidDates[i], inputDateElement.value, "input value doesn't change on invalid input");
            }
        }
    },

    testValidDateInput: {
        browsers: ['DESKTOP'],
        attributes: {value: '2015-10-23T16:30:00.000Z', format: 'MM-DD-YYYY'},
        test: function (cmp) {
            var inputDateTimeCmp = cmp.find("datePickerTestCmp");
            var inputDateElement = inputDateTimeCmp.find("inputText").getElement();

            var validDates = {
                "11-15-2015": "2015-11-15",
                "8-23-2015": "2015-08-23",
                "8-8-2015": "2015-08-08",
                "01-02-2015": "2015-01-02"
            };

            for (var key in validDates) {
                if (validDates.hasOwnProperty(key)) {
                    var validDate = key;
                    var expectedValue = validDates[key];
                    inputDateElement.value = validDate;
                    $A.test.fireDomEvent(inputDateElement, "change");
                    aura.test.assertEquals(expectedValue, cmp.get("v.value"), "value should change when input is valid");
                    aura.test.assertEquals(validDate, inputDateElement.value, "input value doesn't change on valid input");
                }
            }
        }
    },

    testDateInputWithTimezone: {
        browsers: ['DESKTOP'],
        attributes: {value: "2016-01-22T01:00:00.000Z", timezone: 'America/Toronto', format: 'MM-DD-YYYY'},
        test: [function (cmp) {
            var inputDateTimeCmp = cmp.find("datePickerTestCmp");
            var inputDateElement = inputDateTimeCmp.find("inputText").getElement();
            $A.test.addWaitFor(true, function () {
                return inputDateElement.value == "01-21-2016";
            });
        },
        function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
            var curDate = $A.test.getElementByClass("selectedDate")[0];
            $A.test.assertEquals("21", $A.util.getText(curDate), "Date picker did not open to the correct day");
        }]
    },

    testDateInputWithDefaultTime: {
        browsers: ['DESKTOP'],
        attributes: {value: "2017-03-16T00:00:00.000Z", timezone: 'America/Toronto', format: 'MM-DD-YYYY'},
        test: [function (cmp) {
            var inputDateTimeCmp = cmp.find("datePickerTestCmp");
            var inputDateElement = inputDateTimeCmp.find("inputText").getElement();
            $A.test.addWaitFor(true, function () {
                return inputDateElement.value == "03-16-2017";
            });
        },
            function (cmp) {
                this.openDatePicker(cmp);
            }, function (cmp) {
                var curDate = $A.test.getElementByClass("selectedDate")[0];
                $A.test.assertEquals("16", $A.util.getText(curDate), "Date picker did not open to the correct day");
            }]
    },

    /**
     * Test Flow:
     *
     * 1. Hover over a date and check if attribute value of aria-selected is false
     * 2. Set focus on a date and check if attribute value of aria-selected is false
     * 3. Click on a date and check if attribute value of aria-selected is true
     */
    RANDOM_GRID_ELEM : 9,
    testAriaSelected : {
    	browsers: ['DESKTOP'],
    	attributes: {value: "2013-09-25"},
    	test : [function(cmp) {
    		this.openDatePicker(cmp);
    	}, function(cmp) {
    		//check that hover does not set aria-selected to true
    		$A.test.fireDomEvent(cmp.find("datePickerTestCmp").find("datePicker").find("grid").find(this.RANDOM_GRID_ELEM).getElement(), "mouseover");
    	}, function(cmp) {
    		$A.test.assertTrue($A.util.getElementAttributeValue(cmp.find("datePickerTestCmp").find("datePicker").find("grid").find(this.RANDOM_GRID_ELEM).getElement(), "aria-selected") === "false",
    				"Aria-selected should be false when we hover over a date");

    		//check that focus does not set aria-selected to true
    		$A.test.fireDomEvent(cmp.find("datePickerTestCmp").find("datePicker").find("grid").find(this.RANDOM_GRID_ELEM).getElement(), "focus");
    	}, function(cmp) {
    		$A.test.assertTrue($A.util.getElementAttributeValue(cmp.find("datePickerTestCmp").find("datePicker").find("grid").find(this.RANDOM_GRID_ELEM).getElement(), "aria-selected") === "false",
    				"Aria-selected should be false when focus is set on a date");

    		//click on a date and check that aria-selected is true
    		var newDate = cmp.find("datePickerTestCmp").find("datePicker").find("grid").find(this.RANDOM_GRID_ELEM).getElement();
    		$A.test.clickOrTouch(newDate);
    	}, function(cmp) {
    		this.openDatePicker(cmp);
    		var self = this;
    		$A.test.addWaitForWithFailureMessage(true, function () {
    			return ($A.util.getElementAttributeValue(cmp.find("datePickerTestCmp").find("datePicker").find("grid").find(self.RANDOM_GRID_ELEM).getElement(), "aria-selected") === "true");
    		}, "Aria-selected should be true after clicking on a date");
    	}]
    },

    /**
     * Test Flow:
     *
     * 1. Open datePicker with a date already selected (25th Sept 2013)
     * 2. Go to next month and check that aria-selected=false for the same day of this month (25th Oct 2013)
     * 3. Go to next year and check that aria-selected=false for the same day of this year and month (25th Oct 2014)
     * 4. Go back to the originally selected date and check that aria-selected=true (25th Sept 2013)
     */
    testAriaSelectedMonthYear : {
    	browsers: ['DESKTOP'],
    	attributes: {value: "2013-09-25"},
    	test : [ function(cmp) {
    		this.openDatePicker(cmp);
    	},function(cmp) {
    		this.verifyAriaSelected(cmp, "true", "aria-selected should be true for Sept 25, 2013");
    	}, function(cmp) {
    		var datePicker = cmp.find("datePickerTestCmp").find("datePicker");
    		this.iterateCal(1, 0, datePicker.find("nextMonth").getElement(), datePicker.find("yearTitle").getElement());
    	}, function(cmp) {
    		this.verifyAriaSelected(cmp, "false", "aria-selected should be false for Oct 25, 2013");
    	}, function(cmp) {
    		var datePicker = cmp.find("datePickerTestCmp").find("datePicker");
    		this.iterateCal(0, 1, datePicker.find("nextMonth").getElement(), datePicker.find("yearTitle").getElement());
    	}, function(cmp) {
    		this.verifyAriaSelected(cmp, "false", "aria-selected should be false for Oct 25, 2014");
    	}, function(cmp) {
    		var datePicker = cmp.find("datePickerTestCmp").find("datePicker");
    		this.iterateCal(1, -1, datePicker.find("prevMonth").getElement(), datePicker.find("yearTitle").getElement());
    	}, function(cmp) {
    		this.verifyAriaSelected(cmp, "true", "aria-selected should be true for Sept 25, 2013");
    	}]
    },


    iterateCal: function (monthIter, yearIter, monthButton, yearSelect) {
        var i;
        for (i = 0; i < monthIter; i++) {
            monthButton.click();
        }

        yearSelect.value = yearSelect.value + yearIter;
    },

    openDatePicker: function (cmp) {
        var opener = cmp.find("datePickerTestCmp").find("datePickerOpener").getElement();
        var inputBox = cmp.find("datePickerTestCmp").find("inputText").getElement();
        var datePicker = cmp.find("datePickerTestCmp").find("datePicker").getElement();

        if ($A.util.isUndefinedOrNull(opener)) {
            $A.test.clickOrTouch(inputBox);
        } else {
            $A.test.clickOrTouch(opener);
        }
        $A.test.addWaitFor(true, function () {
            return $A.util.hasClass(datePicker, "visible")
        });
    },

    /**
     * Method allowing us to extract whether or not we are looking at a mobile device.
     * Extracted from two functions because depending on which mode we are in (Desktop
     * or other), we either have a header with the Month Year combo or an outputText
     * and a select value
     *
     */
    isViewDesktop: function () {
        return $A.get('$Browser.formFactor').toLowerCase() === "desktop";
    },

    /**
     * We have to ways that we need to get elements. Either from a output/select combo or
     * from a header tag
     */
    getTextFromElm: function (cmp) {
        return $A.util.getText(cmp.find("calTitle").getElement());
    },

    convertMonth: function (intMonth) {
        if ($A.util.isUndefinedOrNull(intMonth)) {
            return intMonth;
        }

        var months = [ "January", "February", "March", "April", "May", "June", "July",
                       "August", "September", "October", "November", "December" ];

        return months[intMonth];
    },

    /**
     * Find the grid location of a specific date on the datePicker
     */
    findDateOnGrid : function(grid, dayOfMonth){
    	for(var i = 0; i < 31; i++) {
    		var currentDay = $A.test.getText(grid.find(i.toString()).getElement());
    		if(dayOfMonth == currentDay) {
    			return i;
    		}
    	}
    },

    /**
     * Verify the aria-selected value and then move calendar by specified month and year
     */
    verifyAriaSelected : function(cmp, expectedAriaSelected, errorMsg) {
    	var grid = cmp.find("datePickerTestCmp").find("datePicker").find("grid");
    	var gridLoc = this.findDateOnGrid(grid, "25").toString();

		$A.test.addWaitForWithFailureMessage(true, function () {
			return ($A.util.getElementAttributeValue(grid.find(gridLoc).getElement(), "aria-selected") === expectedAriaSelected);
		}, errorMsg);
    }
})//eslint-disable-line semi
