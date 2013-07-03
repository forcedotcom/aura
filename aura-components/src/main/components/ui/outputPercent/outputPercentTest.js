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
    testPositiveValue: {
        attributes : {value : 1.145, format : '0000.0%'},
        test: function(component){
            aura.test.assertEquals('0114.5%', $A.test.getText(component.find('span').getElement()), "Percentage not correct");
        }
    },

    testNegativeValue: {
        attributes : {value : -0.14, format : '.000%'},
        test: function(component){
            aura.test.assertEquals('-14.000%', $A.test.getText(component.find('span').getElement()), "Percentage not correct");
        }
    },

    //TODO W-984924 value must be set in markup. moved to js://uitest.outputCmps_EmptyStringValue for now.
    _testEmptyStringValue: {
        attributes : {value : ''},
        test: function(component){
            aura.test.assertEquals('', $A.test.getText(component.find('span').getElement()), "Expect to see an empty span.");
        }
    },

    testUnassignedFormat: {
        attributes : {value : 0.01},
        test: function(component){
            aura.test.assertEquals('1%', $A.test.getText(component.find('span').getElement()), "Expected default format to be used");
        }
    },

    testInvalidFormat: {
        attributes : {value : 30, format: ',,'},
        test: function(component){
            aura.test.assertEquals('Invalid format attribute', $A.test.getText(component.find('span').getElement()), "Expected error message");
        }
    },

    testRounding: {
        attributes : {value : 0.14566, format: '0.00%'},
        test: function(component){
            aura.test.assertEquals('14.57%', $A.test.getText(component.find('span').getElement()), "Rounding not correct");
        }
    },

    testPrecision: {
        attributes : {value : .05, format : '.0%'},
        test: function(component){
            aura.test.assertEquals('5.0%', $A.test.getText(component.find('span').getElement()), "Percentage not correct");
        }
    },

    /**
     * Verify that the scale is applied
     */
    testScale: {
        attributes : {value : 22.7, valueScale: -2},
        test: function(component){
            aura.test.assertEquals('23%', $A.test.getText(component.find('span').getElement()), "Value not formatted correctly");
        }
    },

    /**
     * Verify that when the value changes it is rerendered with the new value
     */
    testUpdateValue: {
        attributes : {value : .227},
        test: function(component){
            aura.test.assertEquals('23%', $A.test.getText(component.find('span').getElement()), "Value not formatted correctly");
            component.getValue("v.value").setValue(965.21);
            $A.rerender(component);
            aura.test.assertEquals('96,521%', $A.test.getText(component.find('span').getElement()), "Value not updated after changed");
        }
    },

    /**
     * Verify that when the format changes it is rerendered using the new format
     */
    testUpdateFormat: {
        attributes : {value : .227, format : '#0.#%'},
        test: function(component){
            aura.test.assertEquals('22.7%', $A.test.getText(component.find('span').getElement()), "Value not formatted correctly");
            component.getValue("v.format").setValue("000.00 %");
            $A.rerender(component);
            aura.test.assertEquals('022.70 %', $A.test.getText(component.find('span').getElement()), "Value not updated after format changed");
        }
    },

    //TODO: W-967009
    _testNonNumericValue: {
        attributes : {value : 'true'},
        test: function(component){
            aura.test.assertEquals('The value attribute must be assigned a numeric value', $A.test.getText(component.find('span').getElement()), "Expected error message");
        }
    }
})
