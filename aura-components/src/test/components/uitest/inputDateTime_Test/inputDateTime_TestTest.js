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
     * Acessibility test, making sure that any functionality added is still accessible
     *
     */
    testAccessible: {
        browsers: ['DESKTOP'],
        attributes: {value: "2012-09-10 11:23", format: "MM-dd-yyyy hh:mm"},
        test: [function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
            $A.test.assertAccessible();
        }]
    },

    /**
     * Acessibility test, making sure that any functionality added is still accessible
     *
     */
    testMobileAccessible: {
        browsers: ['MOBILE'],
        attributes: {value: "2016-01-22T01:00:00.000Z"},
        test: function (cmp) {
            $A.test.assertAccessible();
        }
    },

    /**
     *  If value is set for date/time when opening up dateTimePicker it opens to the date of set value.
     */
    _testCalendarWithTimeValuePreSet: {
        attributes: {
            value: '2012-09-10T11:23Z',
            format: 'MM/dd/yyyy HH:mm',
            dateFormat: 'MM/dd/yyyy',
            timeFormat: 'HH:mm',
            timezone: 'GMT'
        },
        test: [function (cmp) {
            this.openDatePicker(cmp);
        }, function (cmp) {
            var expected = "September 2012";
            var datepicker = cmp.find("dateTimePickerTest").find("datePicker");
            var actual = this.getTextFromElm(datepicker);

            $A.test.assertEquals(expected, actual, "Month year of datePicker is not valid");
            actual = $A.util.getText($A.test.getElementByClass("selectedDate")[0]);
            $A.test.assertEquals("10", actual, "Day of month that is not correct");
        }]
    },

    /**
     * Firing the openPicker component event should open the date picker.
     */
    testOpenDatePickerWithComponentEvent: {
        browsers: ['DESKTOP'],
        test: function (cmp) {
            var dateTimePickerTest = cmp.find("dateTimePickerTest");
            var openDatePickerEvt = dateTimePickerTest.getEvent("openPicker");
            $A.test.assertNotUndefinedOrNull(openDatePickerEvt, "Didn't find an openPicker event");
            openDatePickerEvt.fire();
            $A.test.addWaitFor(true, function () {
                var datePicker = dateTimePickerTest.find("datePicker").getElement();
                return $A.util.hasClass(datePicker, "visible")
            });
        }
    },

    /**
     * Verify behavior when 'timeFormat' attribute is not set.
     * Also checks for default 'langLocale'
     */
    testDefaultTimeFormat: {
        browsers: ['DESKTOP'],
        attributes: {value: '2015-10-23T16:30:00.000Z', dateFormat: 'MM-dd-yyyy', timezone: 'GMT'},
        test: function (cmp) {
            this.checkInputTimeValue(cmp, '4:30 PM');
        }
    },

    /**
     * Verify behavior when 'timeFormat' attribute is assigned an empty string.
     */
    testEmptyTimeFormat: {
        browsers: ['DESKTOP'],
        attributes: {value: '2015-10-23T16:30:00.000Z', dateFormat: 'MM-dd-yyyy', timeFormat: '', timezone: 'GMT'},
        test: function (cmp) {
            this.checkInputTimeValue(cmp, '4:30 PM');
        }
    },

    /**
     * Verify behavior when 'timeFormat' attribute is assigned a garbage value.
     */
    testInvalidTimeFormat: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2015-10-23T16:30:00.000Z',
            dateFormat: 'MM-dd-yyyy',
            timeFormat: 'KKKKKK',
            timezone: 'GMT'
        },
        test: [function (cmp) {
            this.checkInputTimeValue(cmp, 'KKKKKK');
        }]
    },

    /**
     * Verify behavior when 'timeFormat' attribute is assigned a correct value.
     */
    testValidTimeFormat: {
        browsers: ['DESKTOP'],
        attributes: {value: '2015-10-23T16:30:00.000Z', dateFormat: 'MM-dd-yyyy', timeFormat: 'HH:mm', timezone: 'GMT'},
        test: function (cmp) {
            this.checkInputTimeValue(cmp, '16:30');
        }
    },

    testInvalidDateTimeInput: {
        browsers: ['DESKTOP'],
        attributes: {value: '2015-10-23T16:30:00.000Z', dateFormat: 'MM-dd-yyyy', timeFormat: 'HH:mm', timezone: 'GMT'},
        test: [
            function setup(cmp) {
                this.waitForInputTimeIsSet();
            },
            function verifyInvalidDatesAndTime(cmp) {
                var inputDateTimeCmp = cmp.find("dateTimePickerTest");

                var inputElements = $A.test.getElementByClass("date_input_box input");
                var inputDateElement = inputElements[0];
                var inputTimeElement = inputElements[1];
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

                    $A.test.assertEquals(expectedValue, inputDateTimeCmp.get("v.value"), "value should not change when input is invalid");
                    $A.test.assertEquals(invalidDates[i], inputDateElement.value, "input value doesn't change on invalid input");
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
                    $A.test.assertEquals(expectedValue, inputDateTimeCmp.get("v.value"), "value should change even when input is invalid");
                    $A.test.assertEquals(invalidTimes[i], inputTimeElement.value, "input value doesn't change on invalid input");
                }
            }
        ]
    },

    testValidDateTimeInput: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2015-10-23T16:30:00.000Z',
            dateFormat: 'MM-dd-yyyy',
            timeFormat: 'hh:mm a',
            timezone: 'GMT'
        },
        test: [
            function setup() {
                this.waitForInputTimeIsSet();
            },
            function verifyValidDatesAndTime(cmp) {
                var inputDateTimeCmp = cmp.find("dateTimePickerTest");
                var inputElements = $A.test.getElementByClass("date_input_box input");
                var inputDateElement = inputElements[0];
                var inputTimeElement = inputElements[1];

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
                        $A.test.assertEquals(expectedValue, cmp.get("v.value"), "value should change when input is valid");
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
                        $A.test.assertEquals(expectedValue, cmp.get("v.value"), "value should change when input is valid");
                    }
                }
            }
        ]
    },

    testSingleDateTimeInput: {
        browsers: ['DESKTOP'],
        attributes: {
            useSingleInput: 'true',
            value: '2015-10-23T16:30:00.000Z',
            format: "MM-dd-yyyy hh:mm A",
            timezone: 'GMT'
        },
        test: [
            function() {
                this.waitForInputTimeIsSet();
            },
            function(cmp) {
                var inputDateTimeCmp = cmp.find("dateTimePickerTest");
                var inputDateTimeElement = $A.test.getElementByClass("date_input_box input")[0];
                inputDateTimeElement.value = "10-24-2015 04:35 PM";
                $A.test.fireDomEvent(inputDateTimeElement, "change");
                $A.test.assertEquals('2015-10-24T16:35:00.000Z', cmp.get("v.value"), "value should update when input is changed");
            }
        ]
    },

    /**
     * Clear date without clearing time
     */
    testClearDate: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2015-10-23T16:30:00.000Z',
            dateFormat: 'MM-dd-yyyy',
            timeFormat: 'hh:mm a',
            timezone: 'GMT'
        },
        test: [
            function() {
                this.waitForInputTimeIsSet();
            },
            function(cmp) {
                var inputDateTimeCmp = cmp.find("dateTimePickerTest");
                var inputDateElement = inputDateTimeCmp.find("inputDate").getElement();

                inputDateElement.value = "";
                $A.test.fireDomEvent(inputDateElement, "change");
                $A.test.assertEquals("2015-10-23T16:30:00.000Z", cmp.get("v.value"), "Date and time should not be reset");
            }
        ]
    },

    /**
     * Clear time without clearing date
     */
    testClearTime: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2015-10-23T16:30:00.000Z',
            dateFormat: 'MM-dd-yyyy',
            timeFormat: 'hh:mm a',
            timezone: 'GMT'
        },
        test: [
            function() {
                this.waitForInputTimeIsSet();
            },
            function (cmp) {
                var inputDateTimeCmp = cmp.find("dateTimePickerTest");
                var inputTimeElement = inputDateTimeCmp.find("inputTime").getElement();

                inputTimeElement.value = "";
                $A.test.fireDomEvent(inputTimeElement, "change");
                $A.test.assertEquals("2015-10-23T12:00:00.000Z", cmp.get("v.value"), "Time should be reset");
            }
        ]
    },

    /**
     * Clear date and time
     */
    testClearDateAndTime: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2015-10-23T16:30:00.000Z',
            dateFormat: 'MM-dd-yyyy',
            timeFormat: 'hh:mm a',
            timezone: 'GMT'
        },
        test: [
            function() {
                this.waitForInputTimeIsSet();
            },
            function (cmp) {
                var inputDateTimeCmp = cmp.find("dateTimePickerTest");
                var inputDateElement = inputDateTimeCmp.find("inputDate").getElement();
                var inputTimeElement = inputDateTimeCmp.find("inputTime").getElement();

                inputDateElement.value = "";
                inputTimeElement.value = "";
                $A.test.fireDomEvent(inputDateElement, "change");
                $A.test.assertEquals("", cmp.get("v.value"), "value should be empty");
            }
        ]
    },

    /**
     * Clear date and time by setting the value passed to the component to empty string
     */
    testClearDateTimeWithValue: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2015-10-23T16:30:00.000Z',
        },
        test: [
            function() {
                this.waitForInputTimeIsSet();
            },
            function(cmp) {
                var inputDateTimeCmp = cmp.find("dateTimePickerTest");
                var inputDateElement = inputDateTimeCmp.find("inputDate").getElement();
                var inputTimeElement = inputDateTimeCmp.find("inputTime").getElement();

                $A.test.assertNotEquals("", inputDateElement.value, "Date value should not be empty");
                $A.test.assertNotEquals("", inputTimeElement.value, "Time value should not be empty");

                cmp.set("v.value", "");

                $A.test.addWaitForWithFailureMessage("", function() {
                    return inputDateElement.value;
                }, "Date value should be empty");

                $A.test.addWaitForWithFailureMessage("", function() {
                    return inputTimeElement.value;
                }, "Time value should be empty");
            }
        ]
    },

    /**
     * We have to ways that we need to get elements. Either from a output/select combo or from a header tag
     */
    getTextFromElm: function (cmp) {
        return $A.util.getText(cmp.find("calTitle").getElement());
    },

    openDatePicker: function (cmp) {
        var opener = cmp.find("dateTimePickerTest").find("datePickerOpener").getElement();
        var inputBox = cmp.find("dateTimePickerTest").find("inputDate").getElement();
        if ($A.util.isUndefinedOrNull(opener)) {
            $A.test.clickOrTouch(inputBox);
        } else {
            $A.test.clickOrTouch(opener);
        }
        $A.test.addWaitFor(true, function () {
            var datePicker = cmp.find("dateTimePickerTest").find("datePicker").getElement();
            return $A.util.hasClass(datePicker, "visible")
        });
    },

    checkInputTimeValue: function (cmp, expectedValue) {
        var inputTimeElement = cmp.find("dateTimePickerTest").find("inputTime").getElement();
        $A.test.addWaitFor(true, function(){ return !!$A.util.getElementAttributeValue(inputTimeElement, "value")},
            function() {
                var actualValue = $A.util.getElementAttributeValue(inputTimeElement, "value");
                $A.test.assertEquals(expectedValue, actualValue, "Time value is not as expected!");
            });
    },

    /**
     * Wait for input time value is set in input filed.
     */
    waitForInputTimeIsSet: function() {
        var inputElements = $A.test.getElementByClass("date_input_box input");
        var inputDateElement = inputElements[0];
        var inputTimeElement = inputElements[1];
        $A.test.addWaitFor(true, function() {
            // if the element exists, wait for the value is set
            return (!inputDateElement || !!inputDateElement.value) &&
                   (!inputTimeElement || !!inputTimeElement.value);
        });
    }
})

