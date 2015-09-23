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
    /*
     * Mobile devices are still using the old time picker.
     */
    browsers: ['DESKTOP'],

    /**
     * Passing interval as '' should set interval to the default value: 30
     */
    testEmptyInterval: {
        attributes: {timeFormat: 'hh:mma', interval: '', langLocale: 'en', visible: 'true'},
        test: function(cmp) {
            this.checkIntervals(cmp);
        }
    },

    /**
     * Not specifying interval should set interval to the default value: 30
     */
    testDefaultInterval: {
        attributes: {timeFormat: 'hh:mma', langLocale: 'en', visible: 'true'},
        test: function(cmp) {
            this.checkIntervals(cmp);
        }
    },

    /**
     * Passing interval as '15' and check if timePicker's values are correct
     */
    testValidInterval: {
        attributes: {timeFormat: 'hh:mma', interval: '15', langLocale: 'en', visible: 'true'},
        test: function(cmp) {
            this.checkIntervals(cmp);
        }
    },

    /***********************************************************************************************
     *********************************** HELPER FUNCTIONS*******************************************
     ***********************************************************************************************/

    /**
     * Go through each time value in the component
     * and check if they are correct based on the interval value
     */
    checkIntervals: function(cmp) {
        var timeFormat = cmp.get("v.timeFormat");
        var langLocale = cmp.get("v.langLocale");
        var interval = parseInt(cmp.get("v.interval"));

        var expectedIntervals = this.generateTimeIntervals(interval, timeFormat, langLocale);
        var actualIntervals = cmp.find("timeList").getElement().children;

        // same errorMsg is used since both fails for the same reason
        var errorMsg = "Timepicker select list is incorrect!";
        // check timePicker list length
        $A.test.assertEquals(expectedIntervals.length, actualIntervals.length, errorMsg);

        for (var i = 0; i < expectedIntervals.length; i++) {
            var expectedInterval = expectedIntervals[i];
            var actualInterval = $A.test.getText(actualIntervals[i]);
            // check against each time value
            $A.test.assertEquals(expectedInterval, actualInterval, errorMsg);
        }
    },

    generateTimeIntervals: function(interval, timeFormat, locale){
        var date = new Date();
        var timevals = [];

        for (var hours = 0; hours < 24; hours++) {
            for (var minutes = 0; minutes < 60; minutes += interval) {
                date.setHours(hours, minutes);
                timevals.push($A.localizationService.formatTime(date, timeFormat, locale));
            }
        }
        return timevals;
    }
})
