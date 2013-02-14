/*
 * Copyright (C) 2012 salesforce.com, inc.
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
     * Verify that outputDateTime can accept Calendar object from java model and display it.
     */
    // W-1075522 https://gus.soma.salesforce.com/a07B0000000GCLaIAO
    _testCalendarValueFromJavaModel:{
        test:function(cmp){
            var testCmp = cmp.find('calendarFromJava');
            aura.test.assertNotNull(testCmp);
            aura.test.assertEquals('10/23/2004 16:30:00 GMT', $A.test.getText(testCmp.find('span').getElement()), "Failed to display DateTime from Java model");
        }
    },
    /**
     * Verify that timezone can be 'overriden' using timezone attribute.
     */
    testCalendarValueWithTimeZoneOverride:{
        test:function(cmp){
        var testCmp = cmp.find('calendarFromJavaWithTZOverride');
        aura.test.assertNotNull(testCmp);
        aura.test.assertEquals('2005-07-04 09:30:00 MST', $A.test.getText(testCmp.find('span').getElement()), "Failed to display DateTime from Java model");
        }
    }
})
