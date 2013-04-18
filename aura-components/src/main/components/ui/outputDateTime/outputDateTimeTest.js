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
     * Verify behavior by assigning a long value representing a date value in milliseconds since Epoch.
     */
    // W-1075522 https://gus.soma.salesforce.com/a07B0000000GCLaIAO
    _testLongValueAndDefaultTimezoneAndDefaultFormat: {
        attributes: {value : '1095957000000'},
        test: function(component){
            aura.test.assertEquals("09/23/2004 16:30:00 GMT", $A.test.getText(component.find('span').getElement()), "Incorrect date/time");
        }
    },
    /**
     * Verify behavior when 'Value' attribute is assigned an empty string.
     */
    //TODO W-984924 value must be set in markup. moved to js://uitest.outputCmps_EmptyStringValue for now.
    _testEmptyStringValue: {
        attributes: {value : ''},
        test: function(component){
            aura.test.assertEquals('', $A.test.getText(component.find('span').getElement()), "Expected an empty span.");
        }
    },

    /**
     * Verify behavior when 'Value' attribute is assigned a Garbage value.
     */
    //TODO: W-967009
    _testInvalidValue: {
        attributes: {value : 'cornholio'},
        test: function(component){
            aura.test.assertEquals("Value must be a value in milliseconds or bound to a java.util.Calendar model value", $A.test.getText(component.find('span').getElement()), "Expected an error message.");
        }
    },


    /**
     * Verify behavior when 'timezone' attribute is assigned an empty string.
     */
    testEmptyStringForTimeZone:{
        attributes: {value : '1095957000000', timezone: ''},
        test: function(component){
            aura.test.assertEquals("9/23/04 4:30 PM", $A.test.getText(component.find('span').getElement()), "Should have used GMT as default timezone.");
        }
    },
    /**
     * Verify behavior when 'timezone' is assigned a valid time zone.
     */
    testTimezoneByCity: {
        attributes: {value : '1095957000000', timezone: 'America/Phoenix'},
        test: function(component){
            aura.test.assertEquals("9/23/04 9:30 AM", $A.test.getText(component.find('span').getElement()), "Incorrect date/time, failed to use specified timezone");
      }
    },
    testTimezoneByCode: {
        attributes: {value : '1095957000000', timezone: 'MST'},
        test: function(component){
            aura.test.assertEquals("9/23/04 10:30 AM", $A.test.getText(component.find('span').getElement()), "Incorrect date/time, failed to use specified timezone code");
      }
    },
    testTimezoneObeysDayLightSaving: {
        attributes: {value : '1095957000000', timezone: 'America/Los_Angeles'},
        test: function(component){
            aura.test.assertEquals("9/23/04 9:30 AM", $A.test.getText(component.find('span').getElement()), "Incorrect date/time, failed to recognize that timezone has Daylight saving in effect.");
      }
    },
    /**
     * Verify behavior when 'timezone' attribute is assigned a garbage value.
     */
    testInvalidTimezoneIsIgnored: {
        attributes: {value : '1095957000000', timezone: 'sasquatch'},
        test: function(component){
            aura.test.assertEquals("9/23/04 4:30 PM", $A.test.getText(component.find('span').getElement()), "Should have used GMT timezone by default.");
        }
    },


    /**
     * Verify behavior when 'format' attribute is assigned an empty string.
     */
    testEmptyStringForFormat:{
        attributes: {value : '1095957000000', format: ''},
        test:function(component){
            aura.test.assertEquals("", $A.test.getText(component.find('span').getElement()), "Incorrect date/time format, should not have displaed anything.");
        }
    },
    /**
     * Verify behavior when 'format' is given a valid time format.
     */
    // W-1075522 https://gus.soma.salesforce.com/a07B0000000GCLaIAO
    _testFormat: {
        attributes: {value : '1095957000000', format: 'z ss:mm:HH MM dd yyyy'},
        test: function(component){
            aura.test.assertEquals("GMT 00:30:16 09 23 2004", $A.test.getText(component.find('span').getElement()), "Incorrect date/time format in display.");
      }
    },
    /**
     * Verify behavior when 'format' attribute is assigned a garbage value.
     */
    testInvalidFormat: {
        attributes: {value : '1095957000000', format: 'cornholio'},
        test: function(component){
            aura.test.assertEquals("You must provide a valid format: Illegal pattern component: c", $A.test.getText(component.find('span').getElement()), "Expected an error message.");
      }
    },

    testDefaultDateStyle: {
        attributes: {value: '1339121817481', timezone: 'GMT'},
    test: function(component){
       $A.test.assertEquals("6/8/12 2:16 AM", $A.test.getText(component.find('span').getElement()), "Date value does not match with default dateStyle 'short'");
           $A.test.assertEquals("short", component.get("v.dateStyle"), "Incorrect default value set for attribute dateStyle");
    }
    },

    testDefaultTimeStyle: {
        attributes: {value: '1339121817481', timezone: 'GMT'},
    test: function(component){
       $A.test.assertEquals("6/8/12 2:16 AM", $A.test.getText(component.find('span').getElement()), "Date value does not match with default timeStyle 'short'");
           $A.test.assertEquals("short", component.get("v.timeStyle"), "Incorrect default value set for attribute timeStyle");
    }
    },

    testValueWithDateAndTimeStyle: {
        attributes: {value: '1339121817481', timezone: 'GMT', dateStyle: 'full', timeStyle: 'full', format: 'EEE, d MMM yyyy HH:mm:ss'},
    test: function(component){
       $A.test.assertEquals("Fri, 8 Jun 2012 02:16:57", $A.test.getText(component.find('span').getElement()), "Date value does not match with dateStyle 'full'");
           $A.test.assertEquals("full", component.get("v.dateStyle"), "Incorrect value set for attribute dateStyle");
       $A.test.assertEquals("full", component.get("v.timeStyle"), "Incorrect value set for attribute timeStyle");
    }
    }
})
