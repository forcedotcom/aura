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

    testDisplayDurationWithoutSuffix: {
        test: function() {
            var duration = $A.localizationService.duration(1095957000000, "milliseconds"); // 35 years

            var actual = $A.localizationService.displayDuration(duration, false);

            $A.test.assertEquals("35 years", actual, "displayDuration() returns an incorrect duration string");
        }
    },

    testDisplayDurationWithSuffix: {
        test: function() {
            var duration = $A.localizationService.duration(1095957000000, "milliseconds"); // 35 years

            var actual = $A.localizationService.displayDuration(duration, true);

            $A.test.assertEquals("in 35 years", actual, "displayDuration() returns an incorrect duration string");
        }
    },

    testDisplayDurationInYears: {
        test: function() {
            var duration = $A.localizationService.duration(30, "months");

            var actual = $A.localizationService.displayDurationInYears(duration);

            $A.test.assertEquals(2.5, actual, "unexpected length of the duration in years");
        }
    },

    testGetYearsInDuration: {
        test: function() {
            var duration = $A.localizationService.duration(30, "months");

            var actual = $A.localizationService.getYearsInDuration(duration);

            $A.test.assertEquals(2, actual, "unexpected number of years");
        }
    },

    testDisplayDurationInMonths: {
        test: function() {
            var duration = $A.localizationService.duration(2, "years");

            var actual = $A.localizationService.displayDurationInMonths(duration);

            $A.test.assertEquals(24, actual, "unexpected length of the duration in months");
        }
    },

    testGetMonthsInDuration: {
        test: function() {
            var duration = $A.localizationService.duration(2, "years");

            var actual = $A.localizationService.getMonthsInDuration(duration);

            $A.test.assertEquals(0, actual, "unexpected length of the duration in months");
        }
    },

    testDisplayDurationInDays: {
        test: function() {
            var duration = $A.localizationService.duration(60, "hours");

            var actual = $A.localizationService.displayDurationInDays(duration);

            $A.test.assertEquals(2.5, actual, "unexpected length of the duration in days");
        }
    },

    testGetDaysInDuration: {
        test: function() {
            var duration = $A.localizationService.duration(60, "hours");

            var actual = $A.localizationService.getDaysInDuration(duration);

            $A.test.assertEquals(2, actual, "unexpected number of days");
        }
    },

    testDisplayDurationInHours: {
        test: function() {
            var duration = $A.localizationService.duration(30, "minutes");

            var actual = $A.localizationService.displayDurationInHours(duration);

            $A.test.assertEquals(0.5, actual, "unexpected length of the duration in hours");
        }
    },

    testGetHoursInDuration: {
        test: function() {
            var duration = $A.localizationService.duration(30, "minutes");

            var actual = $A.localizationService.getHoursInDuration(duration);

            $A.test.assertEquals(0, actual, "unexpected number of hours");
        }
    },

    testDisplayDurationInMinutes: {
        test: function() {
            var duration = $A.localizationService.duration(105, "seconds");

            var actual = $A.localizationService.displayDurationInMinutes(duration);

            $A.test.assertEquals(1.75, actual, "unexpected length of the duration in minutes");
        }
    },

    testGetMinutesInDuration: {
        test: function() {
            var duration = $A.localizationService.duration(105, "seconds");

            var actual = $A.localizationService.getMinutesInDuration(duration);

            $A.test.assertEquals(1, actual, "unexpected number of minutes");
        }
    },

    testDisplayDurationInSeconds: {
        test: function() {
            var duration = $A.localizationService.duration(1500, "milliseconds");

            var actual = $A.localizationService.displayDurationInSeconds(duration);

            $A.test.assertEquals(1.5, actual, "unexpected length of the duration in seconds");
        }
    },

    testGetSecondsInDuration: {
        test: function() {
            var duration = $A.localizationService.duration(1500, "milliseconds");

            var actual = $A.localizationService.getSecondsInDuration(duration);

            $A.test.assertEquals(1, actual, "unexpected number of seconds");
        }
    },

    testDisplayDurationInMilliseconds: {
        test: function() {
            var duration = $A.localizationService.duration(1500, "milliseconds");

            var actual = $A.localizationService.displayDurationInMilliseconds(duration);

            $A.test.assertEquals(1500, actual, "unexpected length of the duration in milliseconds");
        }
    },

    testGetMillisecondsInDuration: {
        test: function() {
            var duration = $A.localizationService.duration(1500, "milliseconds");

            var actual = $A.localizationService.getMillisecondsInDuration(duration);

            // In moment, duration().milliseconds() only returns a number between 0 and 999
            $A.test.assertEquals(500, actual, "unexpected number of milliseconds");
        }
    }

})
