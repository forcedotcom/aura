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
     * Verify that outputDateTime can accept ISO8601 format from java model and display it.
     */
    testDateTimeISOValueFromJavaModel: {
        test: function(cmp) {
            var testCmp = cmp.find('ISOStringFromJava');
            this.waitForTextPresent(testCmp, "10/23/2004 16:30:00 +00:00");
        }
    },
    /**
     * Verify that timezone can be 'overriden' using timezone attribute.
     */
    _testCalendarISOValueWithTimeZoneOverride: {
        test: function(cmp) {
            var testCmp = cmp.find('ISOStringFromJavaWithTZOverride');
            this.waitForTextPresent(testCmp, "2004-10-23 09:30:00");
        }
    },

    /**
     * Verify that outputDateTime can accept Calendar object from java model and display it.
     */
    testCalendarValueFromJavaModel: {
        test: function(cmp) {
            var testCmp = cmp.find('calendarFromJava');
            this.waitForTextPresent(testCmp, "Oct 23, 2004 4:30:00 PM");
        }
    },

    /**
     * Verify that timezone can be 'overriden' using timezone attribute.
     */
    testCalendarValueWithTimeZoneOverride: {
        test: function(cmp) {
            var testCmp = cmp.find('calendarFromJavaWithTZOverride');
            this.waitForTextPresent(testCmp, "2005-07-04 09:30:00");
        }
    },

    waitForTextPresent: function(testCmp, expText) {
        $A.test.assertNotNull(testCmp);
        $A.test.addWaitForWithFailureMessage(expText, function() {
            return $A.test.getTextByComponent(testCmp);
        }, "Failed to display DateTime from Java model");
    }
})
