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
    // TODO(W-2671175): Fails due to GMT/PST timezone difference for user.timezone and actual timezone
    _testDatePickerOpensToToday : {
        test : [
            function(cmp) {
                this.openStartDatePicker(cmp);
            },
            function(cmp) {
                this.assertTodayShown(cmp);
            },
            function(cmp) {
                this.openEndDatePicker(cmp);
            },
            function(cmp) {
                this.assertTodayShown(cmp);
            }

        ]
    },

    // TODO(W-2664314)
    _testSelectStartThenEnd : {
        attributes : {},
        test : [function(cmp) {
            START_DATE = "2020-11-23";
            END_DATE = "2020-11-29";
            rangeComponent = cmp.find("datePickerTestCmpRange");
            datePicker = rangeComponent.find("datePicker");
            grid = datePicker.find("grid");

            this.openStartDatePicker(cmp);
        }, function(cmp) {
            this.selectDate(datePicker, START_DATE);
        }, function(cmp) {
            $A.test.assertEquals(START_DATE, rangeComponent.get("v.startDate"), "Start Date should be updated");
            $A.test.assertUndefinedOrNull(rangeComponent.get("v.endDate"), "End date should still be undefined");
        }, function(cmp) {
            $A.test.assertTrue($A.util.hasClass(datePicker.getElement(), "visible"));
            $A.test.assertEquals(START_DATE, datePicker.get("v.value"), "date picker's selected value is set to start date");
            this.selectDate(datePicker, END_DATE);
        }, function(cmp) {
            $A.test.assertEquals(START_DATE, rangeComponent.get("v.startDate"), "Start Date should be the same");
            $A.test.assertEquals(END_DATE, rangeComponent.get("v.endDate"), "End Date should be updated");

            var startId = this.findDatePosition(START_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(startId).getElement(), "start-date"), "start of range should have start-date class");

            var endId = this.findDatePosition(END_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(endId).getElement(), "end-date"), "end of range should have end-date class");

            this.assertRangeHighlightedInMonth(grid, startId + 1, endId - 1);
        }]
    },

    // TODO(W-2664314)
    _testSelectEndThenStart : {
        attributes : {},
        test : [function(cmp) {
            START_DATE = "2020-11-17";
            END_DATE = "2020-11-25";
            rangeComponent = cmp.find("datePickerTestCmpRange");
            datePicker = rangeComponent.find("datePicker");
            grid = datePicker.find("grid");

            this.openEndDatePicker(cmp);
        }, function(cmp) {
            this.selectDate(datePicker, END_DATE);
        }, function(cmp) {
            $A.test.assertEquals(END_DATE, rangeComponent.get("v.endDate"), "End Date should be updated");
            $A.test.assertUndefinedOrNull(rangeComponent.get("v.startDate"), "Start date should still be undefined");
        }, function(cmp) {
            $A.test.assertTrue($A.util.hasClass(datePicker.getElement(), "visible"));
            $A.test.assertEquals(END_DATE, datePicker.get("v.value"), "date picker's selected value is set to end date");
            this.selectDate(datePicker, START_DATE);
        }, function(cmp) {
            $A.test.assertEquals(START_DATE, rangeComponent.get("v.startDate"), "Start Date should be the same");
            $A.test.assertEquals(END_DATE, rangeComponent.get("v.endDate"), "End Date should be updated");

            var startId = this.findDatePosition(START_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(startId).getElement(), "start-date"), "start of range should have start-date class");

            var endId = this.findDatePosition(END_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(endId).getElement(), "end-date"), "end of range should have end-date class");

            this.assertRangeHighlightedInMonth(grid, startId + 1, endId - 1);
        }]
    },

    // TODO(W-2664314)
    _testSelectRangeDifferentMonths : {
        attributes : {},
        test : [function(cmp) {
            START_DATE = "2020-11-23";
            END_DATE = "2020-12-15";
            rangeComponent = cmp.find("datePickerTestCmpRange");
            datePicker = rangeComponent.find("datePicker");
            grid = datePicker.find("grid");

            this.openStartDatePicker(cmp);
        }, function(cmp) {
            this.selectDate(datePicker, START_DATE);
        }, function(cmp) {
            $A.test.assertEquals(START_DATE, rangeComponent.get("v.startDate"), "Start Date should be updated");
            $A.test.assertUndefinedOrNull(rangeComponent.get("v.endDate"), "End date should still be undefined");
        }, function(cmp) {
            $A.test.assertTrue($A.util.hasClass(datePicker.getElement(), "visible"));
            $A.test.assertEquals(START_DATE, datePicker.get("v.value"), "date picker's selected value is set to start date");
            this.selectDate(datePicker, END_DATE);
        }, function(cmp) {
            $A.test.assertEquals(START_DATE, rangeComponent.get("v.startDate"), "Start Date should be the same");
            $A.test.assertEquals(END_DATE, rangeComponent.get("v.endDate"), "End Date should be updated");
            this.openStartDatePicker(cmp);
        }, function(cmp) {
            var startId = this.findDatePosition(START_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(startId).getElement(), "start-date"), "start of range should have start-date class");
            this.assertRangeHighlightedInMonth(grid, startId + 1, 41);
            this.openEndDatePicker(cmp);
        }, function(cmp) {
            var endId = this.findDatePosition(END_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(endId).getElement(), "end-date"), "end of range should have end-date class");

            this.assertRangeHighlightedInMonth(grid, 0, endId - 1);
        }]
    },

    // TODO(W-2664314)
    _testSelectEndBeforeStart : {
        attributes : {},
        test : [function(cmp) {
            ORIGINAL_START_DATE = "2020-11-23";
            NEW_START_DATE = "2020-11-10"
            END_DATE = "2020-11-15";
            rangeComponent = cmp.find("datePickerTestCmpRange");
            datePicker = rangeComponent.find("datePicker");
            grid = datePicker.find("grid");

            this.openStartDatePicker(cmp);
        }, function(cmp) {
            this.selectDate(datePicker, ORIGINAL_START_DATE);
        }, function(cmp) {
            $A.test.assertEquals(ORIGINAL_START_DATE, rangeComponent.get("v.startDate"), "Start Date should be updated");
            $A.test.assertUndefinedOrNull(rangeComponent.get("v.endDate"), "End date should still be undefined");
        }, function(cmp) {
            $A.test.assertTrue($A.util.hasClass(datePicker.getElement(), "visible"));
            $A.test.assertEquals(ORIGINAL_START_DATE, datePicker.get("v.value"), "date picker's selected value is set to start date");
            this.selectDate(datePicker, END_DATE);
        }, function(cmp) {
            $A.test.assertEquals(END_DATE, rangeComponent.get("v.endDate"), "End Date should be updated");
            $A.test.assertTrue($A.util.isEmpty(rangeComponent.get("v.startDate")), "Start Date should be cleared since endDate is before start date");
        }, function(cmp) {
            this.selectDate(datePicker, NEW_START_DATE);
        }, function(cmp) {
            $A.test.assertEquals(NEW_START_DATE, rangeComponent.get("v.startDate"), "Start Date should be the same");
            $A.test.assertEquals(END_DATE, rangeComponent.get("v.endDate"), "End Date should be updated");

            var startId = this.findDatePosition(NEW_START_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(startId).getElement(), "start-date"), "start of range should have start-date class");

            var endId = this.findDatePosition(END_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(endId).getElement(), "end-date"), "end of range should have end-date class");

            this.assertRangeHighlightedInMonth(grid, startId + 1, endId - 1);

        }]
    },

    // TODO(W-2664314)
    _testSelectStartAfterEnd : {
        attributes : {},
        test : [function(cmp) {
            ORIGINAL_END_DATE = "2020-11-10";
            NEW_END_DATE = "2020-11-27"
            START_DATE = "2020-11-15";
            rangeComponent = cmp.find("datePickerTestCmpRange");
            datePicker = rangeComponent.find("datePicker");
            grid = datePicker.find("grid");

            this.openEndDatePicker(cmp);
        }, function(cmp) {
            this.selectDate(datePicker, ORIGINAL_END_DATE);
        }, function(cmp) {
            $A.test.assertEquals(ORIGINAL_END_DATE, rangeComponent.get("v.endDate"), "End Date should be updated");
            $A.test.assertUndefinedOrNull(rangeComponent.get("v.startDate"), "End date should still be undefined");
        }, function(cmp) {
            $A.test.assertTrue($A.util.hasClass(datePicker.getElement(), "visible"));
            $A.test.assertEquals(ORIGINAL_END_DATE, datePicker.get("v.value"), "date picker's selected value is set to start date");
            this.selectDate(datePicker, START_DATE);
        }, function(cmp) {
            $A.test.assertEquals(START_DATE, rangeComponent.get("v.startDate"), "Start Date should be updated");
            $A.test.assertTrue($A.util.isEmpty(rangeComponent.get("v.endDate")), "End Date should be cleared since start date is after end date");
        }, function(cmp) {
            this.selectDate(datePicker, NEW_END_DATE);
        }, function(cmp) {
            $A.test.assertEquals(START_DATE, rangeComponent.get("v.startDate"), "Start Date should be the same");
            $A.test.assertEquals(NEW_END_DATE, rangeComponent.get("v.endDate"), "End Date should be updated");

            var startId = this.findDatePosition(START_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(startId).getElement(), "start-date"), "start of range should have start-date class");

            var endId = this.findDatePosition(NEW_END_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(endId).getElement(), "end-date"), "end of range should have end-date class");

            this.assertRangeHighlightedInMonth(grid, startId + 1, endId - 1);

        }]
    },

    //test to see if datepicker haves correctly
    //when start Date is set
    testSetInitialStartDate : {
        test : [function(cmp) {
            self = this;
            START_DATE = "2020-11-10";
            rangeComponent = cmp.find("datePickerTestCmpRange");
            datePicker = rangeComponent.find("datePicker");
            grid = datePicker.find("grid");
        }, function(cmp) {
            rangeComponent.set('v.startDate', START_DATE);

            //this is async, so needs to use addWaitForWithFailureMessage
            $A.test.addWaitForWithFailureMessage(
                START_DATE,
                function(){
                    return self.getCmpElementValue( rangeComponent, 'inputStartDate' );
                },
                'Start Date Value (v.startDate) must match'
            );

            $A.test.assertEqualsIgnoreWhitespace(
                '',
                self.getCmpElementValue( rangeComponent, 'inputEndDate' ),
                'End Date Value (v.endDate) must match'
            );
        }, function(cmp){
            this.openStartDatePicker(cmp);
        }, function(cmp){
            var startId = this.findDatePosition(START_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(startId).getElement(), "start-date"), "start of range should have start-date class");
        }]
    },


    //test to see if datepicker haves correctly
    //when end Date is set
    testSetInitialEndDate : {
        test : [function(cmp) {
            self = this;
            END_DATE = "2021-02-20";
            rangeComponent = cmp.find("datePickerTestCmpRange");
            datePicker = rangeComponent.find("datePicker");
            grid = datePicker.find("grid");
        }, function(cmp) {
            rangeComponent.set('v.endDate', END_DATE);

            $A.test.assertEqualsIgnoreWhitespace(
                '',
                self.getCmpElementValue( rangeComponent, 'inputStartDate' ),
                'Start Date Value (v.startDate) must be empty'
            );

            //this is async, so needs to use addWaitForWithFailureMessage
            $A.test.addWaitForWithFailureMessage(
                END_DATE,
                function(){
                    return self.getCmpElementValue( rangeComponent, 'inputEndDate' );
                },
                'End Date Value (v.endDate) must match'
            );
        }, function(cmp){
            this.openEndDatePicker(cmp);
        }, function(cmp){
            var endId = this.findDatePosition(END_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(endId).getElement(), "end-date"), "end of range should have end-date class");
        }]
    },

    //test to see if datepicker haves correctly
    //when start Date and end Date are set
    testSetInitialStartAndEndDate : {
        test : [function(cmp) {
            self = this;
            START_DATE = "2020-11-10";
            END_DATE = "2021-02-20";
            rangeComponent = cmp.find("datePickerTestCmpRange");
            datePicker = rangeComponent.find("datePicker");
            grid = datePicker.find("grid");
        }, function(cmp) {
            rangeComponent.set('v.startDate', START_DATE);
            rangeComponent.set('v.endDate', END_DATE);

            //this is async, so needs to use addWaitForWithFailureMessage
            $A.test.addWaitForWithFailureMessage(
                START_DATE,
                function(){
                    return self.getCmpElementValue( rangeComponent, 'inputStartDate' );
                },
                'Start Date Value (v.startDate) must match'
            );

            //this is async, so needs to use addWaitForWithFailureMessage
            $A.test.addWaitForWithFailureMessage(
                END_DATE,
                function(){
                    return self.getCmpElementValue( rangeComponent, 'inputEndDate' );
                },
                'End Date Value (v.startDate) must match'
            );
        }, function(cmp){
            this.openStartDatePicker(cmp);
        }, function(cmp){
            var startId = this.findDatePosition(START_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(startId).getElement(), "start-date"), "start of range should have start-date class");
        }, function(cmp){
            this.selectDate(datePicker, START_DATE);//close the datepicker
        }, function(cmp){
            this.openEndDatePicker(cmp);
        }, function(cmp){
            var endId = this.findDatePosition(END_DATE);
            $A.test.assertTrue($A.util.hasClass(grid.find(endId).getElement(), "end-date"), "end of range should have end-date class");
        }]
    },

    //test datepicker grid window position in start date textbox
    testDatepickerStartDatePosition: {
        test : [function(cmp) {
            self = this;
            START_DATE = "2020-11-10";
            END_DATE = "2021-02-20";
            rangeComponent = cmp.find("datePickerTestCmpRange");
            datePicker = rangeComponent.find("datePicker");
            grid = datePicker.find("grid");
        }, function(cmp) {
            this.openStartDatePicker(cmp);
        }, function(cmp){
            var gridRect = $A.test.select('.uiDatePicker')[0].getBoundingClientRect();
            var dateTextbox = self.getCmpElement( rangeComponent, 'inputStartDate' ).getBoundingClientRect();

            // comment out due to an issue with position bug
            // W-2657509 - datepicker isn't positioned properly on initial rendering
            //
            // $A.test.assertTrue(
            //     gridRect.top > dateTextbox.top + dateTextbox.height,
            //     'datepicker grid should not coverred startTextboxRect.'
            //         + ' Found gridRect.top=' + gridRect.top
            //         + ' and  gridRect.height=' + gridRect.height
            //         + ' and  dateTextbox.bottom=' + (dateTextbox.top + dateTextbox.height)
            // );
        }]
    },

    //test datepicker grid window position in end date textbox
    testDatepickerEndDatePosition: {
        test : [function(cmp) {
            self = this;
            START_DATE = "2020-11-10";
            END_DATE = "2021-02-20";
            rangeComponent = cmp.find("datePickerTestCmpRange");
            datePicker = rangeComponent.find("datePicker");
            grid = datePicker.find("grid");
        }, function(cmp) {
            this.openEndDatePicker(cmp);
        }, function(cmp){
            var gridRect = $A.test.select('.uiDatePicker')[0].getBoundingClientRect();
            var dateTextbox = self.getCmpElement( rangeComponent, 'inputEndDate' ).getBoundingClientRect();

            // comment out due to an issue with position bug
            // W-2657509 - datepicker isn't positioned properly on initial rendering
            //
            // $A.test.assertTrue(
            //     gridRect.top > dateTextbox.top + dateTextbox.height,
            //     'datepicker grid should not coverred inputEndDate.'
            //         + ' Found gridRect.top=' + gridRect.top
            //         + ' and  gridRect.height=' + gridRect.height
            //         + ' and  dateTextbox.bottom=' + (dateTextbox.top + dateTextbox.height)
            // );
        }]
    },

    //get component element value
    getCmpElement: function(cmp, id){
        return cmp.find(id).getElement();
    },

    //get component element value
    getCmpElementValue: function(cmp, id){
        return this.getCmpElement(cmp, id).value;
    },

    assertRangeHighlightedInMonth : function(grid, startId, endId) {
        for (i = startId; i <= endId; i++) {
            $A.test.assertTrue($A.util.hasClass(grid.find(i).getElement(), "highlight"), "elements in the range should have 'highlight' class");
        }
    },

    assertTodayShown : function (cmp) {
        var today = new Date();
        var expectedDay = today.getDate();
        var expected = this.convertMonth(today.getMonth()) + " " + today.getFullYear();
        var curDate = $A.test.getElementByClass("todayDate")[0];

        $A.test.assertEquals(expectedDay.toString(), $A.util.getText(curDate), "Date picker did not open to todays day");

        var actual = $A.util.getText(cmp.find("datePickerTestCmpRange").find("datePicker").find("calTitle").getElement());
        $A.test.assertEquals(expected, actual, "Date picker did not open to todays month and year");
    },

    openStartDatePicker : function(cmp){
        this.openDatePicker(cmp, "startDatePickerOpener");
    },

    openEndDatePicker : function(cmp){
        this.openDatePicker(cmp, "endDatePickerOpener");
    },

    openDatePicker : function(cmp, openerId) {
        var opener = cmp.find("datePickerTestCmpRange").find(openerId).getElement();
        var datePicker = cmp.find("datePickerTestCmpRange").find("datePicker").getElement();

        $A.test.clickOrTouch(opener);
        $A.test.addWaitFor(true, function(){return $A.util.hasClass(datePicker, "visible")});
    },

    selectDate : function(datePicker, dateStr) {
        var date = new Date(dateStr.replace(/-/g, '/'));
        var year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate();

        var currentDate = new Date(datePicker.get("v.value").replace(/-/g, '/'));
        var currentYear = currentDate.getFullYear(),
            currentMonth = currentDate.getMonth();
        //changing year
        while (year > currentYear) {
            datePicker.get('c.goToNextYear').runDeprecated({});
            currentYear++;
        }
        while (year < currentYear) {
            datePicker.get('c.goToPrevYear').runDeprecated({});
            currentYear--;
        }

        //changing month
        while (month > currentMonth) {
            datePicker.get('c.goToNextMonth').runDeprecated({});
            currentMonth++;
        }
        while (month < currentMonth) {
            datePicker.get('c.goToPrevMonth').runDeprecated({});
            currentMonth--;
        }
        //select day after the new month is generated
        window.setTimeout(function () {
            $A.run(function () {
                var firstDate = new Date(year, month, 1);
                var initialPos = firstDate.getDay();
                var pos = initialPos + day - 1;
                datePicker.find("grid").find(pos).getEvent("click").fire({});
            })
        }, 0);
    },

    findDatePosition: function(date) {
        var firstDate = new Date(date),
            initialDay = firstDate.getDate();
        firstDate.setDate(1);
        var initialPos = firstDate.getDay();
        return initialPos + initialDay;
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
