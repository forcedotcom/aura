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
     * Verify default format.
     */
    testDefaultFormat: {
        attributes: {value : '2004-09-23'},
        test: function(component){
            aura.test.assertEquals("2004-09-23", $A.test.getText(component.find('span').getElement()), "Incorrect date");
        }
    },
    /**
     * Verify default format with a date before 1970.
     */
    testDefaultFormatWithBefore1970: {
        attributes: {value : '1935-04-10'},
        test: function(component){
            aura.test.assertEquals("1935-04-10", $A.test.getText(component.find('span').getElement()), "Incorrect date");
        }
    },
    /**
     * Verify behavior when 'Value' attribute is assigned an empty string.
     */
    testEmptyStringValue: {
        attributes: {value : ''},
        test: function(component){
            aura.test.assertEquals('', $A.test.getText(component.find('span').getElement()), "Expected an empty span.");
        }
    },
    /**
     * Verify behavior when 'Value' attribute is assigned a Garbage value.
     */
    testInvalidValue: {
        attributes: {value : 'cornholio'},
        test: function(component){
            aura.test.assertEquals("cornholio", $A.test.getText(component.find('span').getElement()), "Display the original value if it is not a valid date value.");
        }
    },

    /**
     * Verify behavior when 'format' attribute is assigned an empty string.
     */
    testEmptyStringForFormat:{
        attributes: {value : '2004-09-23', format: ''},
        test:function(component){
            aura.test.assertEquals("2004-09-23", $A.test.getText(component.find('span').getElement()), "Incorrect date format, should display as it is.");
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
     * MMMM-(Full month)
     * ww-(week of year)
     * DDD-(day of year)
     * EEEE-(day in week)
     */
    testAllPossibleFormats: {
        attributes: {value : '2004-09-23', format: 'yyyy MMMM EEEE DDD ww'},
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
            aura.test.assertEquals("bb", $A.test.getText(component.find('span').getElement()), "Expected the garbage format value.");
      }
    }
})
