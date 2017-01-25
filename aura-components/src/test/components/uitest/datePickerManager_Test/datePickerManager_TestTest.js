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
    inputDateTriggerID: "inputDateTrigger",
    inputDateID: "inputDate",
    inputDateTimeID: "inputDateTime",
    dpmID: "dpm",

    // Excluding mobile because on mobile we use native date pickers
    browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],

    /**
     * Test that opens multiple datepickers then verifies that they are not overriding each
     * others' values even though they are using the same datePicker
     */
    testDatepickerStoresCorrectValue: {
        test: [
            function(cmp) {
                this.openDatePicker(cmp, this.inputDateID);
            },
            function(cmp) {
                this.clickDate(cmp, 15);
            },
            function(cmp) {
                this.openDatePicker(cmp, this.inputDateTriggerID);
            },
            function(cmp) {
                this.clickDate(cmp, 20);
            },
            function(cmp) {
                var inputDateValue = cmp.find(this.inputDateID).get("v.value");
                $A.test.assertEquals("15", inputDateValue.slice(-2),
                        "The date of inputDateTrigger should be the 15th");

                var inputDateTrigger = cmp.find(this.inputDateTriggerID).get("v.value");
                $A.test.assertEquals("20", inputDateTrigger.slice(-2),
                        "The date of inputDate should be the 20th");
            }
        ]
    },

    /**
     * Test that opens up a few datePickers and see if the selected date is correct
     * when these date components share the same datePicker via the manager
     */
    testDatepickerOpensToCorrectValue: {
        test: [
            function(cmp) {
                cmp.find(this.inputDateID).set("v.value", "2013-10-25");
                cmp.find(this.inputDateTriggerID).set("v.value", "2016-11-15");
            },
            function(cmp) {
                this.openDatePicker(cmp, this.inputDateID);
            },
            function(cmp) {
                this.verifySelectedDate(cmp, this.inputDateID);
                this.closeDatePicker(cmp);
            },
            function(cmp) {
                this.openDatePicker(cmp, this.inputDateTriggerID);
            },
            function(cmp) {
                this.verifySelectedDate(cmp, this.inputDateTriggerID);
            }
        ]
    },

    /**
     * Test verifying that datePicker opens up at the correct position when
     * it's shared among different date components
     *
     * Ignored in IE7 because ie7 handles bounding rectangle differently and the datepicker ends up be askewed
     */
    testCheckDatePickerPosition: {
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD", "-IE7", "-SAFARI"],
        test: [
            function(cmp) {
                this.openDatePicker(cmp, this.inputDateTriggerID);
            },
            function(cmp) {
                this.verifyPosition(cmp, this.inputDateTriggerID);
            },
            function(cmp) {
                this.closeDatePicker(cmp);
            },
            function(cmp) {
                this.openDatePicker(cmp, this.inputDateID);
            },
            function(cmp) {
                this.verifyPosition(cmp, this.inputDateID);
            },
            function(cmp) {
                this.closeDatePicker(cmp);
            },
            function(cmp) {
                this.openDatePicker(cmp, this.inputDateTimeID);
            },
            function(cmp) {
                this.verifyPosition(cmp, this.inputDateTimeID);
            }
        ]
    },

    /**
     * Test verifying that inputDate and inputDateTime use manager's datePicker when
     * useManager=true
     * Excluding mobile because on mobile we use native date pickers
     */
    testDatePickerUseManager: {
        test: function(cmp) {
            // the dom should only contain manager's datePicker
            var expectedDatePickerSize = 1;
            var datePickerSize = $A.test.getElementByClass("uiDatePicker").length;
            $A.test.assertEquals(expectedDatePickerSize, datePickerSize,
                "Expected " + expectedDatePickerSize + " datePicker(s) on the screen but there aren't");
        }
    },

    /**
     * Test verifying that inputDate and inputDateTime don't load their own datePicker on init even
     * when not using manager. (They will load their datepicker after clicking on the picker icon)
     * Excluding mobile because on mobile we use native date pickers
     */
    testDatePickerNotUseManager: {
        attributes: {useManager: "false"},
        test: function(cmp) {
            // the dom should contain 1 datePicker even when useManager=false.
            var expectedDatePickerSize = 1;
            var datePickerSize = $A.test.getElementByClass("uiDatePicker").length;
            $A.test.assertEquals(expectedDatePickerSize, datePickerSize,
                "Expected " + expectedDatePickerSize + " datePicker(s) on the screen but there aren't");
        }
    },

    /****************************************************************
     * Helper Functions
     ****************************************************************/
    getDPMDatePicker: function(cmp) {
        // get manager's datePicker
        return cmp.find(this.dpmID).find("datePicker");
    },

    getDatePickerOpener: function(cmp, datePickerID) {
        var datePickerCmp = cmp.find(datePickerID);
        if (datePickerCmp.isInstanceOf("ui:inputDateTrigger")) {
            // inputDateTrigger extends inputDate,
            // so needs to access super to get the opener
            datePickerCmp = datePickerCmp.getSuper();
        }
        return datePickerCmp.find("datePickerOpener");
    },

    clickDate: function(cmp, date) {
        var grid = this.getDPMDatePicker(cmp).find("grid");
        var start = false; // start search, the first few dates can be from previous month
        var dateElm = null;

        // go through each cell and check to see if label matches date
        for (var i=0; i<42; i++) {
            var dateCmp = grid.find(i);
            var targetDate = dateCmp.get('v.label');

            // on dates that are in previous month?
            if (!start && targetDate === 1) {
                start = true;
            }

            if (start) {
                if (targetDate === date) {
                    dateElm = dateCmp.getElement();
                    break;
                }
            }
        }

        $A.test.clickOrTouch(dateElm);
    },

    openDatePicker: function(cmp, datePickerID) {
        var datePicker = this.getDPMDatePicker(cmp).getElement();
        var opener = this.getDatePickerOpener(cmp, datePickerID).getElement();

        $A.test.clickOrTouch(opener);
        $A.test.addWaitForWithFailureMessage(true, function() {
            return $A.util.hasClass(datePicker, "visible");
        }, "Unable to open datePicker");
    },

    closeDatePicker: function(cmp) {
        var datePicker = this.getDPMDatePicker(cmp).getElement();
        var selectedDate = datePicker.querySelector(".selectedDate");

        // select the same date to reliably close datePicker
        $A.test.clickOrTouch(selectedDate);
        $A.test.addWaitForWithFailureMessage(false, function() {
            return $A.util.hasClass(datePicker, "visible")
        }, "Unable to close datePicker");
    },

    verifySelectedDate: function(cmp, inputBoxID) {
        var expectedDate = cmp.find(inputBoxID).get("v.value");
        var selectedDate = this.getDPMDatePicker(cmp).find("grid").get("v.selectedDate");
        $A.test.assertEquals(expectedDate, selectedDate, "Date picker has the wrong selected date");
    },

    verifyPosition: function(cmp, dpCmpID) {
        var epsilon = 5;
        var inputBoxRect = cmp.find(dpCmpID).getElement().getBoundingClientRect();
        var datePickerElm = this.getDPMDatePicker(cmp).getElement();

        // positions are updated after the datePicker is visible, so we need to have
        // some waitFor's here
        $A.test.addWaitForWithFailureMessage(true, function() {
                var datePickerRect = datePickerElm.getBoundingClientRect();
                return this.isDatePickerBelowInput(datePickerRect, inputBoxRect, epsilon);
            }.bind(this),
            "DatePicker at [top=" + datePickerElm.getBoundingClientRect().top +
            ", left=" + datePickerElm.getBoundingClientRect().left + "], " +
            "while input at [bottom=" + inputBoxRect.bottom + ", left=" + inputBoxRect.left + "]"
        );
    },

    isDatePickerBelowInput : function(datePickerRect, inputBoxRect, epsilon) {
        // check if datePicker is positioned immediately below inputDate and if its left margin
        // is aligned to left margin of inputDate
        return (datePickerRect.top + epsilon >= inputBoxRect.bottom) &&
                (datePickerRect.top - epsilon <= inputBoxRect.bottom) &&
                (datePickerRect.left + epsilon >= 0) &&
                (datePickerRect.top + epsilon >= 0) &&
                (datePickerRect.left + epsilon >= inputBoxRect.left) &&
                (datePickerRect.left - epsilon <= inputBoxRect.left);
    }
})
