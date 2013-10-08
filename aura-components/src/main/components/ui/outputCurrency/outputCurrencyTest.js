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
     * Positive test case: Assign Negative value for attribute 'value'.
     */
    testNegativeValue:{
        attributes: {value : -123},
        test: function(component){
            aura.test.assertEquals('($123.00)', $A.test.getText(component.find('span').getElement()), "Negative values not displayed correctly.");
        }
    },
    /**
     * Positive test case: Assign fractional value for attribute 'value'.
     */
    testFractionalValue:{
        attributes: {value : .5},
        test: function(component){
            aura.test.assertEquals('$0.50', $A.test.getText(component.find('span').getElement()), "Fractional values should be displayed in 0.XX format.");
        }
    },
    /**
     * Positive test case: Assign Positive value for attribute 'value'.
     */
    testValue: {
        attributes : {value : 123},
        test: function(component){
            aura.test.assertEquals('$123.00', $A.test.getText(component.find('span').getElement()), "Positive value attribute not displayed correctly");
        }
    },
    /**
     * Negative test case: Assign blank value for attribute 'value'.
     * Expect it to show nothing.
     */
    //TODO W-984924 value must be set in markup. moved to js://uitest.outputCmps_EmptyStringValue for now.
    _testEmptyStringValue: {
        attributes : {value : ''},
        test: function(component){
            aura.test.assertEquals('', $A.test.getText(component.find('span').getElement()), "Should have displayed empty span.");
        }
    },
    /**
     * Negative test case:Verify providing non numeric value for Value attribute.
     */
    //TODO: W-967009
    _testNonNumericValue: {
        attributes : {value : 'foo'},
        test: function(component){
            aura.test.assertEquals('The value attribute must be assigned a numeric value', $A.test.getText(component.find('span').getElement()), "Should have displayed an error message.");
        }
    },

    /**
     * Negative test case: Verify that non char value cannot be used for currency code.
     */
    _testNonCharCurrencyCode: {
        attributes : {value : 123, currencyCode: 123.4},
        test: function(component){
            aura.test.assertEquals('The currencyCode attribute must be a valid ISO 4217 currency code', $A.test.getText(component.find('span').getElement()), "Should have used USD as default currency code.");
        }
    },
    /**
     * Negative test case: Assign 'ABC' for attribute 'currencyCode'
     */
    _testInvalidCurrencyCode: {
        attributes : {value : 123, currencyCode : 'ABC'},
        test: function(component){
            aura.test.assertEquals('The currencyCode attribute must be a valid ISO 4217 currency code', $A.test.getText(component.find('span').getElement()), "Should have displayed an error message");
        }
    },
    /**
     * Positive test case: Verify the default currency code used.
     */
    testDefaultCurrencyCode: {
        attributes : {value : 123},
        test: function(component){
            aura.test.assertEquals('$123.00', $A.test.getText(component.find('span').getElement()), "Should have used USD as default currency code.");
        }
    },
    /**
     * Positive test case: Assign 'GBP' for attribute 'currencyCode'
     */
    testCurrencyCodeGBP: {
        attributes : {value : 123, currencyCode : 'GBP'},
        test: function(component){
            aura.test.assertEquals('GBP123.00', $A.test.getText(component.find('span').getElement()), "Text not correct when currencyCode is specified");
        }
    },
    /**
     * Positive test case: Assign 'GBP' for attribute 'currencyCode'
     */
    testCurrencySymbolGBP: {
        // TODO(W-1787430): Special char added to formatted currency values in IE
        browsers: ["-IE7","-IE8","-IE9","-IE10"],
        attributes : {value : 123, currencySymbol : '£'},
        test: function(component){
            aura.test.assertEquals('£123.00', $A.test.getText(component.find('span').getElement()), "Text not correct when currencySymbol is specified");
        }
    },
    /**
     * Positive test case: Verify with a currency where numbers are grouped in twos' after the thousand mark.
     * Numbers are grouped in threes because Locale.US is being used.
     * Assign 'INR' for attribute 'currencyCode'.
     */
    testCurrencyCodeINR_NumberGrouping: {
        attributes : {value : 121212000.54, currencyCode : 'INR'},
        test: function(component){
            aura.test.assertEquals('INR121,212,000.54', $A.test.getText(component.find('span').getElement()), "Should follow three digit grouping regardless of currency.");
        }
    },
    /**
     * Positive test case: Verify with a currency where comma is decimal separator.
     * Dot is being used as decimal separator because Locale.US is being used.
     * Assign 'EUR' for attribute 'currencyCode'.
     */
    testCurrencyCodeEUR_CommaDecimalSeperator: {
        attributes : {value : 121212000.54, currencyCode : 'EUR'},
        test: function(component){
            aura.test.assertEquals('EUR121,212,000.54', $A.test.getText(component.find('span').getElement()), "Show follow US locale since outputCurrency is not locale aware.");
        }
    },
    /**
     * Positive test case: Assign fractionDigits value of 4 and provide a integer value. Verifying padding to match precision.
     */
    testFractionDigitsPad: {
        // TODO(W-1787430): Special char added to formatted currency values in IE
        browsers: ["-IE7","-IE8","-IE9","-IE10"],
        attributes : {value : 1234567890, format : '¤#,##0.0000'},
        test: function(component){
            aura.test.assertEquals('$1,234,567,890.0000', $A.test.getText(component.find('span').getElement()), "Value not displayed correctly when fractionDigits is specified and pads with zeros.");
        }
    },
    /**
     * Positive test case: Assign fractionDigits value of 4 and verify rounding down function
     */
    testFractionDigitsTruncate_RoundDown: {
        // TODO(W-1787430): Special char added to formatted currency values in IE
        browsers: ["-IE7","-IE8","-IE9","-IE10"],
        attributes : {value : 1234567890.7654321, format : '¤#,##0.0000'},
        test: function(component){
            aura.test.assertEquals('$1,234,567,890.7654', $A.test.getText(component.find('span').getElement()), "Value not displayed correctly when fractionDigits is specified and truncates.");
        }
    },
    /**
     * Positive test case: Assign fractionDigits value of 4 and verify rounding up function
     */
    testFractionDigitsTruncate_RoundUp: {
        // TODO(W-1787430): Special char added to formatted currency values in IE
        browsers: ["-IE7","-IE8","-IE9","-IE10"],
        attributes : {value : 1234567890.7654521, format : '¤#,##0.0000'},
        test: function(component){
            aura.test.assertEquals('$1,234,567,890.7655', $A.test.getText(component.find('span').getElement()), "Value not displayed correctly when fractionDigits is specified and truncates.");
        }
    },
    /**
     * Positive test case: Assign fractionDigits value of 0
     * @ExpectedResult Displays integer part of value
     */
    testFractionDigitsZeroValue: {
        // TODO(W-1787430): Special char added to formatted currency values in IE
        browsers: ["-IE7","-IE8","-IE9","-IE10"],
        attributes : {value : 123.45, format : '¤#'},
        test: function(component){
            aura.test.assertEquals('$123', $A.test.getText(component.find('span').getElement()), "fractionDigits should be allowed to take value of 0.");
        }
    },

    /**
     * Test big value.
     */
    testBigDecimal:{
        attributes : {value : '1234567890123456789012345678901234567890.12'},
        test: function(component){
            aura.test.assertEquals('$1,234,567,890,123,456,789,012,345,678,901,234,567,890.12', $A.test.getText(component.find('span').getElement()), "Unexpected value.");
        }
    },
    
    /**
     * Verify that when the value changes it is rerendered with the new value
     */
    testUpdateValue: {
        // TODO(W-1787430): Special char added to formatted currency values in IE
        browsers: ["-IE7","-IE8","-IE9","-IE10"],
        attributes : {value : 1234567890, format : '¤#,##0.0000'},
        test: function(component){
            aura.test.assertEquals('$1,234,567,890.0000', $A.test.getText(component.find('span').getElement()), "Value not formatted correctly");
            component.getValue("v.value").setValue(1234567890.1234);
            $A.rerender(component);
            aura.test.assertEquals('$1,234,567,890.1234', $A.test.getText(component.find('span').getElement()), "Value not updated after changed");
        }
    },
    
    /**
     * Verify that when the value doesn't change it is rerendered with the same value
     */
    testUpdateValueWithSame: {
        // TODO(W-1787430): Special char added to formatted currency values in IE
        browsers: ["-IE7","-IE8","-IE9","-IE10"],
        attributes : {value : 1234567890, format : '¤#,##0.0000'},
        test: function(component){
        	aura.test.assertEquals('$1,234,567,890.0000', $A.test.getText(component.find('span').getElement()), "Value not formatted correctly");
            component.getValue("v.value").setValue(1234567890);
            $A.rerender(component);
            aura.test.assertEquals('$1,234,567,890.0000', $A.test.getText(component.find('span').getElement()), "Value not updated after changed");
        }
    },

    /**
     * Verify that when the format changes it is rerendered using the new format
     */
    testUpdateFormat: {
        // TODO(W-1787430): Special char added to formatted currency values in IE
        browsers: ["-IE7","-IE8","-IE9","-IE10"],
        attributes : {value : 1234567890, format : '¤#,##0.0000'},
        test: function(component){
            aura.test.assertEquals('$1,234,567,890.0000', $A.test.getText(component.find('span').getElement()), "Value not formatted correctly");
            component.getValue("v.format").setValue("¤#,##0.00");
            $A.rerender(component);
            aura.test.assertEquals('$1,234,567,890.00', $A.test.getText(component.find('span').getElement()), "Value not updated after format changed");
        }
    },
    
    /**
     * Verify that when the format doesn't change it is rerendered using the same format
     */
    testUpdateFormatWithSame: {
        // TODO(W-1787430): Special char added to formatted currency values in IE
        browsers: ["-IE7","-IE8","-IE9","-IE10"],
        attributes : {value : 1234567890, format : '¤#,##0.0000'},
        test: function(component){
        	aura.test.assertEquals('$1,234,567,890.0000', $A.test.getText(component.find('span').getElement()), "Value not formatted correctly");
            component.getValue("v.format").setValue("¤#,##0.0000");
            $A.rerender(component);
            aura.test.assertEquals('$1,234,567,890.0000', $A.test.getText(component.find('span').getElement()), "Value not updated after format changed");
        }
    },
    
    /**
     * Verify that when the currencySymbol changes it is rerendered with the new currencySymbol
     */
    testUpdateCurrencySymbol: {
        attributes : {value : 1234567890, currencySymbol : '$'},
        test: function(component){
            aura.test.assertEquals('$1,234,567,890.00', $A.test.getText(component.find('span').getElement()), "Value not formatted correctly");
            component.getValue("v.currencySymbol").setValue('£');
            $A.rerender(component);
            aura.test.assertEquals('£1,234,567,890.00', $A.test.getText(component.find('span').getElement()), "Value not updated after changed");
        }
    },
    
    /**
     * Verify that when the currencyCode changes it is rerendered with the new currencyCode
     */
    testUpdateCurrencyCode: {
        attributes : {value : 1234567890, currencyCode : 'USD'},
        test: function(component){
            aura.test.assertEquals('USD1,234,567,890.00', $A.test.getText(component.find('span').getElement()), "Value not formatted correctly");
            component.getValue("v.currencyCode").setValue('GBP');
            $A.rerender(component);
            aura.test.assertEquals('GBP1,234,567,890.00', $A.test.getText(component.find('span').getElement()), "Value not updated after changed");
        }
    }
})
