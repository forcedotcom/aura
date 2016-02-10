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
     */
    testClickOnDayWorks: {
        browsers: ['DESKTOP'],
        attributes: {value: "2013-09-25"},
        test: [function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
            var datePicker = cmp.find("datePickerTestCmp").find("datePicker");
            var pastWeek = datePicker.find("grid").find("17");
            pastWeek.getEvent("click").fire({});

            $A.test.addWaitFor(false, function () {
                return $A.util.hasClass(datePicker, "visible")
            });
        }, function (cmp) {
            var expected = "2013-09-18";
            var actual = cmp.find("datePickerTestCmp").find("inputText").getElement().value;
            $A.test.assertEquals(expected, actual.toString(), "Clicking on one week prior to todays date did not render the correct result.");
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

            this.iterateCal(7, 5, datePicker.get('c.goToPrevMonth'), datePicker.get('c.goToNextYear'));
        }, function (cmp) {
            var expected = "February";
            var actual = this.getTextFromElm(datePicker);
            $A.test.assertEquals(expected, actual, "Month year combo incorrect");
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
            this.iterateCal(7, 15, datePicker.get('c.goToPrevMonth'), datePicker.get('c.goToPrevYear'));
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

            this.iterateCal(12, 10, datePicker.get('c.goToNextMonth'), datePicker.get('c.goToPrevYear'));
        }, function (cmp) {
            var expected = "September";
            var actual = this.getTextFromElm(datePicker);
            $A.test.assertEquals(expected, actual, "Initial value incorrect");
        }]
    },

    /**
     * Acessibility test, making sure that any functionality added is still accessible
     */
    testAccessibile: {
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
    testMobileAccessibile: {
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
            this.iterateCal(12, 10, datePicker.get('c.goToNextMonth'), datePicker.get('c.goToNextYear'));
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

    iterateCal: function (monthIter, yearIter, monthButton, yearButton) {
        var i;
        for (i = 0; i < monthIter; i++) {
            monthButton.runDeprecated({});
        }

        for (i = 0; i < yearIter; i++) {
            yearButton.runDeprecated({});
        }
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
     * Method allowing us to extract whether or not we are looking at a mobile device. Extracted from two functions because
     * depending on which mode we are in (Desktop or other), we either have a header with the Month Year combo or an outputText
     * and a select value
     *
     */
    isViewDesktop: function () {
        return $A.get('$Browser.formFactor').toLowerCase() === "desktop";
    },

    /**
     * We have to ways that we need to get elements. Either from a output/select combo or from a header tag
     */
    getTextFromElm: function (cmp) {
        return $A.util.getText(cmp.find("calTitle").getElement());
    },

    convertMonth: function (intMonth) {
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
