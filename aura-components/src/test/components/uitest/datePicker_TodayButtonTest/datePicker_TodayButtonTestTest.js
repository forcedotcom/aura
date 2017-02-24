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
    owner:"ctatlah",

    CSS_SELECTOR:{
        todayButton : 'span.today',
        uiDatePicker : '.uiDatePicker'
    },


    //test to check if the Today Button is visible (showToday=true)
    //clicking on the today button should populate the datepicker to today date
    testShowTodayDatepickerFlag: {
        attributes : {"renderItem" : "testShowTodayDatepickerFlag"},
        test: [
            function waitForTodayIsSet(cmp) {
                var datepickerCmp = cmp.find('datePicker');
                $A.test.addWaitFor(true, function() { return !!datepickerCmp.find("grid").get('v._today'); });
            },
            function(cmp) {
                var el = cmp.getElement();
                var uiDatepicker = $A.test.select(this.CSS_SELECTOR.uiDatePicker)[0];

                //should be visible
                this.verifyContainClass(
                    uiDatepicker,
                    'visible'
                );

                //at first selected date should be empty
                $A.test.assertUndefinedOrNull(
                    cmp.get('v.selectedDate.value'),
                    'At first : selected date value should be undefined'
                );

                //verify that today button is visible
                this.verifyTodayButtonVisible(true);

                //verify today date based on timezone
                this.verifyDatepickerTodayAttr(cmp);

                //click on today button
                $A.test.clickOrTouch(
                    $A.test.select(this.CSS_SELECTOR.todayButton)[0]
                );

                //assert the today date
                this.verifySelectedDateDefined(cmp);

                //date picker should not visible after clicking on the today button
                this.verifyNotContainClass(
                    el,
                    'visible'
                );
            }
        ]
    },


    //test to check if the Today Button is not visible (showToday=false)
    testHideTodayDatepickerFlag: {
        attributes : {"renderItem" : "testHideTodayDatepickerFlag"},
        test: [
            function waitForTodayIsSet(cmp) {
                var datepickerCmp = cmp.find('datePicker');
                $A.test.addWaitFor(true, function() { return !!datepickerCmp.find("grid").get('v._today'); });
            },
            function(cmp) {
                var el = cmp.getElement();
                var uiDatepicker = $A.test.select(this.CSS_SELECTOR.uiDatePicker)[0];

                this.verifyTodayButtonVisible(false);//verify that today button is not visible
                this.verifySelectedDateUndefined(cmp);
                this.verifyDatepickerTodayAttr(cmp);
            }
        ]
    },

    testDefaultValueOfDatePicker: {
        attributes : {"renderItem" : "testDefaultValueOfDatePicker"},
        test: [
            function waitForTodayIsSet(cmp) {
                var datepickerCmp = cmp.find('datePicker');
                $A.test.addWaitFor(true, function() { return !!datepickerCmp.find("grid").get('v._today'); });
            },
            function(cmp) {
                var el = cmp.getElement();
                var uiDatepicker = $A.test.select(this.CSS_SELECTOR.uiDatePicker)[0];

                this.verifyTodayButtonVisible(true);//verify that today button is not visible
                this.verifySelectedDateUndefined(cmp);
                this.verifyDatepickerTodayAttr(
                    cmp,
                    15,//day
                    6,//month start from 0 instead of 1, this is JULY
                    2015//year
                );
            }
        ]
    },

    //test localized service
    //SAME YEAR, MONTH, DAY
    testLocalizedTodayWithTimezoneAPISameDayMonthYear: {
        attributes : {"renderItem" : "testLocalizedTodayWithTimezoneAPI"},
        test: [function(cmp){
            this.setupTimezones(cmp);
        }, function(cmp) {
            //based on the locale
            var self = this;
            cmp.set('v.todayDate', new Date('Jul 06 2015 01:26:37 GMT-0700 (PDT)'));
            cmp.set('v.todayDate_str', cmp.get('v.todayDate').toString());
            cmp.set('v.expectedDiffCase', 'SAME YEAR, MONTH, DAY');
        }, function(cmp){
            //based on the locale
            var self = this;

            $A.localizationService.getDateStringBasedOnTimezone(
                cmp.get('v.timezone1'),
                cmp.get('v.todayDate'),
                function(dateString) {
                    cmp.set('v.todayDate1', dateString);
                    self.verifyValidDateString( dateString);
                }
            );

            $A.localizationService.getDateStringBasedOnTimezone(
                cmp.get('v.timezone2'),
                cmp.get('v.todayDate'),
                function(dateString) {
                    cmp.set('v.todayDate2', dateString);
                    self.verifyValidDateString( dateString);
                }
            );
        }, function(cmp){
            var self = this;

            $A.test.addWaitForWithFailureMessage(
                true,
                function(){//testFunction
                    return cmp.get('v.todayDate1') && cmp.get('v.todayDate2') &&
                        cmp.get('v.todayDate1').length > 0 && cmp.get('v.todayDate2').length > 0;
                },
                'today Dates should have been initialized',//failureMessage
                function(){//callback
                    self.verifyDateOffset( cmp.get('v.todayDate1'), cmp.get('v.todayDate2'), cmp);
                }
            );
        }]
    },



    //test localized service
    //NEXT DAY SAME MONTH
    testLocalizedTodayWithTimezoneAPINextDaySameMonth: {
        attributes : {"renderItem" : "testLocalizedTodayWithTimezoneAPI"},
        test: [function(cmp){
            this.setupTimezones(cmp);
        }, function(cmp) {
            //based on the locale
            var self = this;
            cmp.set('v.todayDate', new Date('Jul 06 2015 21:26:37 GMT-0700 (PDT)'));
            cmp.set('v.todayDate_str', cmp.get('v.todayDate').toString());
            cmp.set('v.expectedDiffCase', 'NEXT DAY SAME MONTH');
        }, function(cmp){
            //based on the locale
            var self = this;

            $A.localizationService.getDateStringBasedOnTimezone(
                cmp.get('v.timezone1'),
                cmp.get('v.todayDate'),
                function(dateString) {
                    cmp.set('v.todayDate1', dateString);
                    self.verifyValidDateString( dateString);
                }
            );

            $A.localizationService.getDateStringBasedOnTimezone(
                cmp.get('v.timezone2'),
                cmp.get('v.todayDate'),
                function(dateString) {
                    cmp.set('v.todayDate2', dateString);
                    self.verifyValidDateString( dateString);
                }
            );
        }, function(cmp){
            var self = this;

            $A.test.addWaitForWithFailureMessage(
                true,
                function(){//testFunction
                    return cmp.get('v.todayDate1') && cmp.get('v.todayDate2') &&
                        cmp.get('v.todayDate1').length > 0 && cmp.get('v.todayDate2').length > 0;
                },
                'today Dates should have been initialized',//failureMessage
                function(){//callback
                    self.verifyDateOffset( cmp.get('v.todayDate1'), cmp.get('v.todayDate2'), cmp);
                }
            );
        }]
    },



    //test localized service
    //FIRST DAY NEXT MONTH
    testLocalizedTodayWithTimezoneAPIFirstDayNextMonth: {
        attributes : {"renderItem" : "testLocalizedTodayWithTimezoneAPI"},
        test: [function(cmp){
            this.setupTimezones(cmp);
        }, function(cmp) {
            //based on the locale
            var self = this;
            cmp.set('v.todayDate', new Date('Jul 31 2015 21:26:37 GMT-0700 (PDT)'));
            cmp.set('v.todayDate_str', cmp.get('v.todayDate').toString());
            cmp.set('v.expectedDiffCase', 'FIRST DAY NEXT MONTH');
        }, function(cmp){
            //based on the locale
            var self = this;

            $A.localizationService.getDateStringBasedOnTimezone(
                cmp.get('v.timezone1'),
                cmp.get('v.todayDate'),
                function(dateString) {
                    cmp.set('v.todayDate1', dateString);
                    self.verifyValidDateString( dateString);
                }
            );

            $A.localizationService.getDateStringBasedOnTimezone(
                cmp.get('v.timezone2'),
                cmp.get('v.todayDate'),
                function(dateString) {
                    cmp.set('v.todayDate2', dateString);
                    self.verifyValidDateString( dateString);
                }
            );
        }, function(cmp){
            var self = this;

            $A.test.addWaitForWithFailureMessage(
                true,
                function(){//testFunction
                    return cmp.get('v.todayDate1') && cmp.get('v.todayDate2') &&
                        cmp.get('v.todayDate1').length > 0 && cmp.get('v.todayDate2').length > 0;
                },
                'today Dates should have been initialized',//failureMessage
                function(){//callback
                    self.verifyDateOffset( cmp.get('v.todayDate1'), cmp.get('v.todayDate2'), cmp);
                }
            );
        }]
    },


    //test localized service
    //FIRST DAY NEXT YEAR
    testLocalizedTodayWithTimezoneAPIFirstDayNextYear: {
        attributes : {"renderItem" : "testLocalizedTodayWithTimezoneAPI"},
        test: [function(cmp){
            this.setupTimezones(cmp);
        }, function(cmp) {
            //based on the locale
            var self = this;
            cmp.set('v.todayDate', new Date('Dec 31 2015 21:26:37 GMT-0700 (PDT)'));
            cmp.set('v.todayDate_str', cmp.get('v.todayDate').toString());
            cmp.set('v.expectedDiffCase', 'FIRST DAY NEXT YEAR');
        }, function(cmp){
            //based on the locale
            var self = this;

            $A.localizationService.getDateStringBasedOnTimezone(
                cmp.get('v.timezone1'),
                cmp.get('v.todayDate'),
                function(dateString) {
                    cmp.set('v.todayDate1', dateString);
                    self.verifyValidDateString( dateString);
                }
            );

            $A.localizationService.getDateStringBasedOnTimezone(
                cmp.get('v.timezone2'),
                cmp.get('v.todayDate'),
                function(dateString) {
                    cmp.set('v.todayDate2', dateString);
                    self.verifyValidDateString( dateString);
                }
            );
        }, function(cmp){
            var self = this;

            $A.test.addWaitForWithFailureMessage(
                true,
                function(){//testFunction
                    return cmp.get('v.todayDate1') && cmp.get('v.todayDate2') &&
                        cmp.get('v.todayDate1').length > 0 && cmp.get('v.todayDate2').length > 0;
                },
                'today Dates should have been initialized',//failureMessage
                function(){//callback
                    self.verifyDateOffset( cmp.get('v.todayDate1'), cmp.get('v.todayDate2'), cmp);
                }
            );
        }]
    },


    //helper
    //verify if an element el contains css class name
    verifyContainClass: function(el, cssClassName){
        $A.test.assertTrue(
            $A.util.hasClass(el, cssClassName),
            'Datepicker should have "' + cssClassName + '" style: classList=' + el.className
        );
    },


    //verify if an element el doesn't contain css class name
    verifyNotContainClass: function(el, cssClassName){
        $A.test.assertFalse(
            $A.util.hasClass(el, cssClassName),
            'Datepicker should NOT have "' + cssClassName + '" style: classList=' + el.className
        );
    },


    //verify if selected date value is undefined
    verifySelectedDateUndefined: function(cmp){
        $A.test.assertUndefinedOrNull(
            cmp.get('v.selectedDate.value'),
            'selected date value should be undefined'
        );
    },


    //verify if selected date value is defined
    verifySelectedDateDefined: function(cmp){
        $A.test.assertTrue(
            cmp.get('v.selectedDate.value').length > 0,
            'Today date needs to be defined after clicking on today button'
        );

        this.verifyValidDateString(cmp.get('v.selectedDate.value'));
    },

    //verify if today button is visible
    verifyTodayButtonVisible: function(isTodayButtonVisible){
        $A.test.assertEquals(
            isTodayButtonVisible ? 1 : 0,
            $A.test.select(this.CSS_SELECTOR.todayButton).length,
            isTodayButtonVisible ? 'Today button needs to be VISIBLE' : 'Today button needs to be HIDDEN'
        );
    },

    //verify if date string is valid
    verifyValidDateString: function(dateString){
        var dateStringSplit = dateString.split('-');

        //make sure there are 3 splits
        $A.test.assertTrue(
            dateStringSplit.length === 3,
            'DateString should contains 3 split separated by "-" : found ' + dateStringSplit.length + ' : dateString ' + dateString
        );

        var yearStr = dateStringSplit[0];
        var monthStr = dateStringSplit[1];
        var dayStr = dateStringSplit[2];

        var yearInt = parseInt(yearStr);
        var monthInt = parseInt(monthStr);
        var dayInt = parseInt(dayStr);


        $A.test.assertTrue(
            yearStr.length === 4 && yearInt > 1900,
            'YEAR value needs to be valid (yearStr.length === 4 && yearInt > 1900): dateString="' + dateString + '"'
        );

        $A.test.assertTrue(
            monthStr.length <= 2 && monthInt <= 12  && monthInt >= 1,
            'MONTH value needs to be valid (monthStr.length <= 2 && monthInt<= 12  && monthInt >= 1): dateString="' + dateString + '"'
        );

        $A.test.assertTrue(
            dayStr.length <= 2 && dayInt <= 31  && dayInt >= 1,
            'DAY value needs to be valid (dayStr.length <= 2 && dayInt <= 31  && dayInt >= 1): dateString="' + dateString + '"'
        );

        return {
            year: yearInt,
            month: monthInt,
            day: dayInt
        };
    },


    //verify date offset
    verifyDateOffset: function(todayDateString1, todayDateString2, cmp){
        var self = this;

        var todayDateObj1 = self.verifyValidDateString( todayDateString1 );
        var todayDateObj2 = self.verifyValidDateString( todayDateString2 );

        if (todayDateObj1.day !== todayDateObj2.day){
            //timezone provides different dates, needs further date

            if (todayDateObj1.day < todayDateObj2.day){
                //next day same month
                cmp.set('v.timeDiffCase', 'NEXT DAY SAME MONTH: todayDate2.day = todayDate1.day + 1');
                $A.test.assertTrue(
                    todayDateObj2.day - 1 === todayDateObj1.day,
                    'NEXT DAY SAME MONTH: todayDate2.day = todayDate1.day + 1'
                );
            }
            else if (todayDateObj1.month < todayDateObj2.month){
                //first day next month
                cmp.set('v.timeDiffCase', 'FIRST DAY NEXT MONTH: todayDate2.month = todayDate1.month + 1');
                $A.test.assertTrue(
                    todayDateObj2.month - 1 === todayDateObj1.month,
                    'FIRST DAY NEXT MONTH: todayDate2.month = todayDate1.month + 1'
                );
            }
            else{
                //next year first day first month
                cmp.set('v.timeDiffCase', 'FIRST DAY NEXT YEAR: todayDate2.year = todayDate1.year + 1');
                $A.test.assertTrue(
                    todayDateObj2.year - 1 === todayDateObj1.year,
                    'FIRST DAY NEXT YEAR: todayDate2.year = todayDate1.year + 1'
                );
            }
        }
        else{
            cmp.set('v.timeDiffCase', 'SAME DAY, MONTH, YEAR, offset is minor');
            $A.test.assertEquals(
                todayDateObj1.day,
                todayDateObj2.day,
                'SAME DAY, MONTH, YEAR : day should match'
            );
            $A.test.assertEquals(
                todayDateObj1.month,
                todayDateObj2.month,
                'SAME DAY, MONTH, YEAR : month should match'
            );
            $A.test.assertEquals(
                todayDateObj1.year,
                todayDateObj2.year,
                'SAME DAY, MONTH, YEAR : year should match'
            );
        }
    },

    verifyDatepickerTodayAttr: function(cmp, expectedDay, expectedMonth_StartFromZero, expectedYear){
        var datepickerCmp = cmp.find('datePicker');
        var todayStr = datepickerCmp.find("grid").get('v._today');//yyyy-MM-dd
        var todayObj = this.verifyValidDateString(todayStr);

        $A.test.assertEquals(
            expectedDay || todayObj.day,
            datepickerCmp.find('grid').get("v.date"),
            'DATE Val must match. Found : ' + todayStr
        );
        $A.test.assertEquals(
            expectedMonth_StartFromZero || todayObj.month - 1,//please note that JS month starts from 0
            datepickerCmp.find('grid').get("v.month"),
            'MONTH Val must match. Found : ' + todayStr
        );
        $A.test.assertEquals(
            expectedYear || todayObj.year,
            datepickerCmp.find('grid').get("v.year"),
            'YEAR Val must match. Found : ' + todayStr
        );
    },


    //set up timezones
    setupTimezones: function(cmp){
        cmp.set('v.timezone1', 'America/Los_Angeles');
        cmp.set('v.timezone2', 'Asia/Bankok');
    }
})
