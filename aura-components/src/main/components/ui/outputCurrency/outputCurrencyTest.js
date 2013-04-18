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
     * Negative test case: Verify that empty string cannot be used for currency code.
     */
    testEmptyStringCurrencyCode: {
        attributes : {value : 123, currencyCode: ''},
        test: function(component){
            aura.test.assertEquals('The currencyCode attribute must be a valid ISO 4217 currency code', $A.test.getText(component.find('span').getElement()), "Should have used USD as default currency code.");
        }
    },
    /**
     * Negative test case: Verify that non char value cannot be used for currency code.
     */
    testNonCharCurrencyCode: {
        attributes : {value : 123, currencyCode: 123.4},
        test: function(component){
            aura.test.assertEquals('The currencyCode attribute must be a valid ISO 4217 currency code', $A.test.getText(component.find('span').getElement()), "Should have used USD as default currency code.");
        }
    },
    /**
     * Negative test case: Assign 'ABC' for attribute 'currencyCode'
     */
    testInvalidCurrencyCode: {
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
     * Positive test case: Assign 'USD' for attribute 'currencyCode'
     */
    testCurrencyCodeUSD: {
        attributes : {value : 123, currencyCode : 'USD'},
        test: function(component){
            aura.test.assertEquals('$123.00', $A.test.getText(component.find('span').getElement()), "Text not correct when currencyCode is specified");
        }
    },
    /**
     * Positive test case: Assign '  USD  ' for attribute 'currencyCode'
     */
    //TODO: W-1075402 (probably) - whitespace not trimmed
    _testCurrencyCodeWithSpaces: {
        attributes : {value : 123, currencyCode : '   USD   '},
        test: function(component){
            aura.test.assertEquals('$123.00', $A.test.getText(component.find('span').getElement()), "outputCurrency does not process currencyDode after trimming");
        }
    },
    /**
     * Positive test case: Assign '$' for attribute 'currencyCode'
     */
    testSymbolAsCurrencyCode: {
        attributes : {value : 123, currencyCode : '$'},
        test: function(component){
            aura.test.assertEquals('The currencyCode attribute must be a valid ISO 4217 currency code', $A.test.getText(component.find('span').getElement()), "Should have displayed an error message");
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
     * Positive test case: Verify the default values of 'FractionDigits' attributes
     */
    testDefaultIntegerFractionDigits:{
        attributes : {value : '12345678909876543.444'},
        test: function(component){
            aura.test.assertEquals(2, component.getValue('v.fractionDigits').getValue(), "Expected fractionDigits attribute to be 2");
            aura.test.assertEquals('$12,345,678,909,876,543.44', $A.test.getText(component.find('span').getElement()), "Failed to use default value of fractionDigits attribute.");
        }

    },
    /**
     * Negative test case: Verify that fractionDigits attribute cannot take negative value.
     * @expectedResult Error message
     */
    testFractionDigitsNegativeValue:{
        attributes : {value : 123.789, fractionDigits : '-1'},
        test: function(component){
            aura.test.assertEquals('The fractionDigits attribute must be assigned a non-negative integer value',$A.test.getText(component.find('span').getElement()), "Negative values should not be accepted for fractionDigits attribute");
        }
    },
    /**
     * Negative test case: Verify that fractional values are not accepted for fractionDigits attribute.
     */
    //TODO: W-967009
    _testFractionDigitsNonIntegerValue:{
        attributes: {value: 123.789, fractionDigits : '2.5'},
        test:function(component){
            aura.test.assertEquals('The fractionDigits attribute must be assigned a non-negative integer value', $A.test.getText(component.find('span').getElement()), "Should have displayed an error message for using fractional values for fractionDigits attribute.");
        }
    },
    /**
     * Negative test case: Verify that string values cannot be used for intergerDigits attribute.
     */
    //TODO: W-967009
    _testFractionDigitsStringValue:{
        attributes: {value: 123.789, fractionDigits : 'ABC'},
        test:function(component){
            aura.test.assertEquals('The fractionDigits attribute must be assigned a non-negative integer value', $A.test.getText(component.find('span').getElement()), "Should have displayed an error message for using literal values for fractionDigits attribute.");
        }
    },
    /**
     * Negative test case: Assign empty string to fractionDigits attribute
     * @ExpectedResult Error message
     */
    //TODO: W-967009
    _testFractionDigitsEmptyString: {
        attributes : {value : 123.45, fractionDigits : ''},
        test: function(component){
            aura.test.assertEquals('The fractionDigits attribute must be assigned a non-negative integer value', $A.test.getText(component.find('span').getElement()), "Should have displayed an error message if fractionDigits attribute is assigned a non integer value.");
        }
    },
    /**
     * Positive test case: Assign fractionDigits value of 2
     */
   testFractionDigits: {
        attributes : {value : 1234567890.45, fractionDigits : '2'},
        test: function(component){
            aura.test.assertEquals('$1,234,567,890.45', $A.test.getText(component.find('span').getElement()), "Value not displayed correctly when fractionDigits is specified.");
        }
    },
    /**
     * Positive test case: Verify that fractionDigits handles value of > 340.
     * DecimalFormat is being used by OutputCurrencyModel. DecimalFormat lets you to use upto 340, and not anymore, for fraction digits.
     * Beyond 340, it overrides the value by using 340.
     */
    testFractionDigitsMaxValue:{
        attributes: {value: 123, fractionDigits : '341'},
        test:function(component){
            aura.test.assertTrue($A.test.getText(component.find('span').getElement()).indexOf('$123.00')===0, "Failed to process big values for fractionDigits.");
        }
    },
    /**
     * Positive test case: Assign fractionDigits value of 4 and provide a integer value. Verifying padding to match precision.
     */
    testFractionDigitsPad: {
        attributes : {value : 1234567890, fractionDigits : '4'},
        test: function(component){
            aura.test.assertEquals('$1,234,567,890.0000', $A.test.getText(component.find('span').getElement()), "Value not displayed correctly when fractionDigits is specified and pads with zeros.");
        }
    },
    /**
     * Positive test case: Assign fractionDigits value of 4 and verify rounding down function
     */
    testFractionDigitsTruncate_RoundDown: {
        attributes : {value : 1234567890.7654321, fractionDigits : '4'},
        test: function(component){
            aura.test.assertEquals('$1,234,567,890.7654', $A.test.getText(component.find('span').getElement()), "Value not displayed correctly when fractionDigits is specified and truncates.");
        }
    },
    /**
     * Positive test case: Assign fractionDigits value of 4 and verify rounding up function
     */
    testFractionDigitsTruncate_RoundUp: {
        attributes : {value : 1234567890.7654521, fractionDigits : '4'},
        test: function(component){
            aura.test.assertEquals('$1,234,567,890.7655', $A.test.getText(component.find('span').getElement()), "Value not displayed correctly when fractionDigits is specified and truncates.");
        }
    },
    /**
     * Positive test case: Assign fractionDigits value of 0
     * @ExpectedResult Displays integer part of value
     */
    testFractionDigitsZeroValue: {
        attributes : {value : 123.45, fractionDigits : '0'},
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
    }
})
