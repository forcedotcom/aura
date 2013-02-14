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
     * Verify behavior by assigning a long value representing a date value in milliseconds since Epoch.
     * value of '0' is 01/01/1970 in Epoch calendar
     */
    testLongValueAndDefaultFormat: {
        attributes: {value : '2004-09-23'},
        test: function(component){
            aura.test.assertEquals("9/23/04", $A.test.getText(component.find('span').getElement()), "Incorrect date");
        }
    },
    /**
     * Verify behavior by assigning a negative long value representing a date value in milliseconds since Epoch.
     * value of '0' is 01/01/1970 in Epoch calendar
     */
    testNegativeLongValue: {
        attributes: {value : '1935-04-10'},
        test: function(component){
            aura.test.assertEquals("4/10/35", $A.test.getText(component.find('span').getElement()), "Incorrect date");
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
            aura.test.assertEquals("Value must be a value in milliseconds or bound to a java.util.Date model value", $A.test.getText(component.find('span').getElement()), "Expected an error message.");
        }
    },

    /**
     * Verify behavior when 'format' attribute is assigned an empty string.
     */
    testEmptyStringForFormat:{
        attributes: {value : '2004-09-23', format: ''},
        test:function(component){
            aura.test.assertEquals("", $A.test.getText(component.find('span').getElement()), "Incorrect date format, should not have displayed anything.");
        }
    },

    /**
     * Verify behavior when 'format' is given a valid date format.
     */
    testFormat: {
        attributes: {value : '2004-09-23', format: 'MM dd yyyy'},
        test: function(component){
            aura.test.assertEquals("09 23 2004", $A.test.getText(component.find('span').getElement()), "Incorrect date format in display.");
      }
    },
    /**
     * Verify behavior when 'format' is given a valid date format.
     * G-(era)
     * MMMMMMMMMMMM-(Full month)
     * w-(week in year)
     * D-(day in year)
     * E-(day in week)
     */
    testAllPossibleFormats: {
        attributes: {value : '2004-09-23', format: 'yyyy MMMMMMMMMM EEEEEEEEE DDD ww'},
        test: function(component){
            aura.test.assertEquals("2004 September Thursday 267 39", $A.test.getText(component.find('span').getElement()), "Incorrect date format in display.");
      }
    },

    /**
     * Verify behavior when 'format' attribute is assigned a garbage value.
     */
    testInvalidFormat: {
        attributes: {value : '2004-09-23', format: 'bb'},
        test: function(component){
            aura.test.assertEquals("You must provide a valid format: Illegal pattern component: bb", $A.test.getText(component.find('span').getElement()), "Expected an error message.");
      }
    },

    testTimezone: {
        attributes: {value: '2012-06-07', timezone: 'CST', dateStyle: 'full', format: 'EEE, d MMM yyyy HH:mm:ss'},
        test: function(component){
       $A.test.assertEquals("CST", component.get("v.timezone"), "Incorrect value set for attribute timezone");
    }

    },

    testDefaultDateStyle: {
        attributes: {value: '2012-06-07'},
    test: function(component){
       $A.test.assertEquals("6/7/12", $A.test.getText(component.find('span').getElement()), "Date value does not match with dateStyle 'medium'");
           $A.test.assertEquals("short", component.get("v.dateStyle"), "Incorrect default value set for attribute dateStyle");
    }
    }
})
