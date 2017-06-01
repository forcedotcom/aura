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
    EMPTY_STRING : '',
    /**
     * Test when value is not assigned.
     */
    testUnassigned: {
        test : function(component) {
            var attr = component.get("v.value");
            $A.test.assertEquals(undefined, attr);
        }
    },

	/**
	 * Test max value.
	 */
    testMax: {
        attributes : {max : 9876.54321},
        test : function(component){
            $A.test.assertEquals(9876.54321, component.get("v.max"), "max does not equal expected");
        }
    },

    /**
     * Test min value.
     */
    testMin: {
        attributes : {min : 0.0003},
        test : function(component){
            $A.test.assertEquals(0.0003, component.get("v.min"), "min does not equal expected");
        }
    },

    /**
     * Test step.
     */
    testStep: {
        attributes : {step : 1.23},
        test : function(component){
            $A.test.assertEquals(1.23, component.get("v.step"), "step does not equal expected");
        }
    },

    /**
     * Test disabled.
     */
    testDisabled: {
        attributes : {disabled : true},
        test : function(component){
            var inputElm = component.getElement();
            $A.test.assertTrue(component.get("v.disabled"), "disable should be true");
            $A.test.assertDefined(inputElm.getAttribute("disabled"), "<input> should have 'disabled' attribute");
        }
    },

    /**
     * Test decimal value.
     */
    testDecimalValue: {
        attributes : {value : 10.3249},
        test : function(component){
            $A.test.assertEquals(10.3249, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test integer value
     */
    testIntValue: {
        attributes : {value : 100},
        test : function(component){
            $A.test.assertEquals(100, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test negative value.
     */
    testNegativeValue: {
        attributes : {value : -5},
        test : function(component){
            $A.test.assertEquals(-5, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Assign Negative value for attribute 'value' and special negative format
     */
    testNegativeValueWithNegativeFormat:{
        attributes: {value : -123.936, format:"#.0#;(#.0#)"},
        test: function(component){
        	var value = component.getElement().value;
            $A.test.assertEquals(-123.936, component.get("v.value"), "Cmp value: Negative values not displayed correctly.");
            $A.test.assertEquals('(123.94)', value, "Element value: Negative values not displayed correctly.");
        }
    },

    /**
     * Test small decimal value.
     */
    testSmallValue: {
        attributes : {value : 0.000005},
        test : function(component){
            $A.test.assertEquals(0.000005, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test large number
     */
    testLargeValue: {
        attributes : {value : 99999999999999},
        test : function(component){
            $A.test.assertEquals(99999999999999, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test zero value.
     */
    testZeroValue: {
        attributes : {value : 0},
        test : function(component){
            $A.test.assertEquals(0, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test when value is empty string
     */
    testEmptyValue: {
        attributes : {value : ""},
        test : function(component){
            $A.test.assertEquals(undefined, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test number formated correctly.
     */
    testNumberFormat: {
    	attributes : {value : 123, format : "#,#"},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(123, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("1,2,3", value, "Element value does not equal expected");
    	}
    },

    /**
     * Test number formated correctly when format is empty.
     */
    testNumberFormatEmptyString: {
    	attributes : {value : 123, format : ""},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(123, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("123", value, "Element value does not equal expected");
    	}
    },

    /**
     * Test number formated correctly when format is invalid.
     */
    testNumberFormatInvalidFormat: {
    	attributes : {value : 123, format : "#.#,0"},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(123, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("123", value, "Element value does not equal expected");
    	}
    },

    /**
     * Test number formated correctly when format is not of a recognizable type.
     */
    testNumberFormatUnrecognizedFormat: {
    	attributes : {value : 123, format : "xyz"},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(123, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("123", value, "Element value does not equal expected");
    	}
    },

    /**
    * Positive test case: Assign nothing to format value and verify default precision used to display decimal.
    */
   testDefaultDecimalPrecision: {
       attributes : {value : 123.450},
       test: function(component){
    	   var value = component.getElement().value;
           $A.test.assertEquals(123.45, component.get("v.value"), "Cmp value not displayed as expected when format is not specified.");
           $A.test.assertEquals("123.45", value, " Element value not displayed as expected when format is not specified.");
       }
   },

   /**
    * Verify Rounding up of lots of 9s
    */
   testRoundingLotsOfNines: {
       attributes : {value : 999999.9, format : '#,##0'},
       test: function(component){
    	   var value = component.getElement().value;
           $A.test.assertEquals(999999.9, component.get("v.value"), "Cmp value: Nines were not rounded up correctly");
           $A.test.assertEquals('1,000,000', value, "Element value: Nines were not rounded up correctly");
       }
   },
   /**
    * Verify Rounding up of lots of 9s with extra zero padding
    */
   testRoundingLotsOfNinesAndZeroPadding: {
       attributes : {value : 999999.9, format : '00000000'},
       test: function(component){
    	   var value = component.getElement().value;
           $A.test.assertEquals(999999.9, component.get("v.value"), "Cmp value: Nines were not round up correctly");
           $A.test.assertEquals('01000000', value, "Element value: Nines were not round up correctly");
       }
   },
   /**
    * Verify Rounding up of decimal part of value.
    */
   testFormat2DecimalPlaces_RoundUp: {
       attributes : {value : 3.1459, format : '.00'},
       test: function(component){
    	   var value = component.getElement().value;
           $A.test.assertEquals(3.1459, component.get("v.value"), "Cmp value: Decimal part of value was not rounded up based on format.");
           $A.test.assertEquals('3.15', value, "Element value: Decimal part of value was not rounded up based on format.");
       }
   },
   /**
    * Verify Rounding down of decimal part of value.
    */
   testFormat2DecimalPlaces_RoundDown: {
       attributes : {value : 3.14159, format : '.00'},
       test: function(component){
    	   var value = component.getElement().value;
           $A.test.assertEquals(3.14159, component.get("v.value"), "Cmp value: Decimal part of value was not rounded down based on format.");
           $A.test.assertEquals('3.14', value, "Element value: Decimal part of value was not rounded down based on format.");
       }
   },
   /**
    * Verify Rounding functionality when length of integer part is restricted by format.
    */
   testFormatDoesNotRestrictIntegerValue: {
       attributes : {value : 22.7, format : '0.0'},
       test: function(component){
    	   var value = component.getElement().value;
           $A.test.assertEquals(22.7, component.get("v.value"), "Cmp value: Should have displayed full value but was probably truncated.");
           $A.test.assertEquals('22.7', value, "Element value: Should have displayed full value but was probably truncated.");
       }
   },
   /**
    * Verify that zeros are appended to decimal value to match format.
    */
   testAppendingZeroToMatchFormat: {
       attributes : {value : 22.7, format : '.000'},
       test: function(component){
    	   var value = component.getElement().value;
           $A.test.assertEquals(22.7, component.get("v.value"), "Cmp value: Should have appended two zeros to match format.");
           $A.test.assertEquals('22.700', value, "Element value: Should have appended two zeros to match format.");
       }
   },

    /**
     * Test big value that is too large for a js number and is represented instead by a string
     *
     * Disabled for now due to new changes to inputNumber
     * TODO: wait for this W-2947804 and re-enable the test
     */
    _testBigDecimal: {
        attributes: {value: '1234567890123456789012345678901234567890.12', format: '.00'},
        test: function(component){
            var value = component.getElement().value;
            $A.test.assertEquals('1234567890123456789012345678901234567890.12', component.get("v.value"), "Cmp value: Unexpected value.");
            $A.test.assertEquals('1234567890123456789012345678901234567890.12', value, "Element value: Unexpected value.");
        }
    },

    /**
     * Test well-formatted value
     */
    testSetValueWithWellFormattedValue: {
        test: [function(component) {
            component.set('v.value', '56,789');
        }, function(component) {
            this.assertCmpElemValues(component, 56789, '56,789');
        }]
    },

    /**
     * Test set value using number string
     */
    testSetValueWithString: {
        test: [function(component) {
            component.set('v.value', '56789');
        }, function(component) {
            this.assertCmpElemValues(component, 56789, '56,789');
        }]
    },


   /**
    * Verify that when the value changes it is rerendered with the unformated new value
    */
   testUpdateValue: {
       attributes : {value : 22.7, format : '##,#0,00.00#####'},
       test: [function(component){
    	   var value = component.getElement().value;
    	   $A.test.assertEquals(22.7, component.get("v.value"), "Cmp: Value not formatted correctly.");
           $A.test.assertEquals('0,22.70', value, "Element: Value not formatted correctly.");
           component.set("v.value", 49322);
       }, function(component){
           // after dirty component is re-rendered, now input element
           // should be displaying the new value
    	   var value = component.getElement().value;
    	   $A.test.assertEquals(49322, component.get("v.value"), "Cmp: Value not formatted correctly.");
           $A.test.assertEquals('4,93,22.00', value, "Element: Value not formatted correctly.");
       }]
   },

   /**
    * Verify that when the format changes it is not rerendered with the new format
    */
   testUpdateFormat: {
       attributes : {value : 22.7, format : '##,#0,00.00#####'},
       test: [function(component){
    	   var value = component.getElement().value;
    	   $A.test.assertEquals(22.7, component.get("v.value"), "Cmp: Value not formatted correctly.");
           $A.test.assertEquals('0,22.70', value, "Element: Value not formatted correctly.");
           component.set("v.format", '.000');
       }, function(component){
           // updating format dynamically is not supported
           // value stays the same
           var value = component.getElement().value;
    	   $A.test.assertEquals(22.7, component.get("v.value"), "Cmp: Value not formatted correctly.");
           $A.test.assertEquals('0,22.70', value, "Element: Value not formatted correctly.");
       }]
   },

    /*
     * Verify that when value is set to an invalid value,
     * internal v.value should be undefined
     * displayed value should be empty
     */
    testSetInvalidValue: {
        attributes: {value: 12},
        test: [function (component) {
            component.set('v.value', 'abc');
        }, function(component){
            var inputValue = component.getElement().value;
            $A.test.assertEquals(this.EMPTY_STRING, inputValue, "Cmp: input value should be empty string");
            $A.test.assertEquals(null, component.get("v.value"), "Cmp: value should be undefined.");
        }]
    },

    /**
     * Test shortcut K/k as in thousand
     */
    testShortcutK: {
        test: [function(component) {
            this.inputValue(component, "1k");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000, "1,000");
        }, function(component) {
            this.inputValue(component, "1K");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000, "1,000");
        }]
    },

    /**
     * Test shortcut M/m as in million
     */
    testShortcutM: {
        test: [function(component) {
            this.inputValue(component, "1m");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000000, "1,000,000");
        }, function(component) {
            this.inputValue(component, "1M");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000000, "1,000,000");
        }]
    },

    /**
     * Test shortcut B/b as in billion
     */
    testShortcutB: {
        test: [function(component) {
            this.inputValue(component, "1b");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000000000, "1,000,000,000");
        }, function(component) {
            this.inputValue(component, "1B");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000000000, "1,000,000,000");
        }]
    },

    /**
     * Test shortcut T/t as in trillion
     */
    testShortcutT: {
        test: [function(component) {
            this.inputValue(component, "1t");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000000000000, "1,000,000,000,000");
        }, function(component) {
            this.inputValue(component, "1T");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000000000000, "1,000,000,000,000");
        }]
    },

    /**
     * Test shortcut should still work for decimal value
     */
    testShortcutWithDecimalValue: {
        test: [function(component) {
            this.inputValue(component, "0.1m");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 100000, "100,000");
        }]
    },

    /**
     * Test shortcut should still work follow after the decimal mark
     */
    testShortcutAfterDecimalMark: {
        test: [function(component) {
            this.inputValue(component, "1.k");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000, "1,000");
        }]
    },

    /**
     * Test input with a positive sign
     */
    testPositiveSign: {
        test: [function(component) {
            this.inputValue(component, "+123");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 123, "123");
        }]
    },

    /**
     * Test input with a negative sign
     */
    testNegativeSign: {
        test: [function(component) {
            this.inputValue(component, "-123");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, -123, "-123");
        }]
    },

    /**
     * Any number of thousand marker should be allowed in integer part
     */
    testThousandMarkerInIntegerPart: {
        test: [function(component) {
            this.inputValue(component, "1,2,3,4,5");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 12345, "12,345");
        }]
    },

    /**
     * Leading decimal mark should be treated as "0."
     */
    testLeadingDecimalMark: {
        test: [function(component) {
            this.inputValue(component, ".12");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 0.12, "0.12");
        }, function(component) {
            this.inputValue(component, "+.34");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 0.34, "0.34");
        }, function(component) {
            this.inputValue(component, "-.56");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, -0.56, "-0.56");
        }]
    },

    /**
     * Test trailing decimal marker has no effect to the value
     * @bug W-3216262@
     */
    testTrailingDecimalMarker: {
        test: [function(component) {
            this.inputValue(component, "123.");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 123, "123");
        }]
    },

    /**
     * updateOn=keyup|keydown|keypress|input should be treated the same
     * and updates on "input" event
     */
    testUpdateOnKeyup: {
        attributes: { updateOn: "keyup" },
        test: [function(component) {
            this.inputValue(component, "1k");
        }, function(component) {
            $A.test.assertEquals(component.get("v.value"), 1000);
        }]
    },

    testUpdateOnKeydown: {
        attributes: { updateOn: "keydown" },
        test: [function(component) {
            this.inputValue(component, "1k");
        }, function(component) {
            $A.test.assertEquals(component.get("v.value"), 1000);
        }]
    },

    testUpdateOnKeypress: {
        attributes: { updateOn: "keypress" },
        test: [function(component) {
            this.inputValue(component, "1k");
        }, function(component) {
            $A.test.assertEquals(component.get("v.value"), 1000);
        }]
    },

    testUpdateOnInput: {
        attributes: { updateOn: "input" },
        test: [function(component) {
            this.inputValue(component, "1k");
        }, function(component) {
            $A.test.assertEquals(component.get("v.value"), 1000);
        }]
    },

    /**
     * default is updateOn=change
     */
    testUpdateOnChange: {
        test: [function(component) {
            $A.test.assertEquals(component.get("v.updateOn"), "change");
            // enter 1k and fire input event
            this.inputValue(component, "1k");
        }, function(component) {
            // v.value should still be undefined since change event is not fired yet
            $A.test.assertEquals(component.get("v.value"), undefined);
            // fire change event
            var inputElm = component.getElement();
            $A.test.fireDomEvent(inputElm, "change");
        }, function(component) {
            $A.test.assertEquals(component.get("v.value"), 1000);
        }]
    },

    /*****************
     * Helpers
     *****************/

    // set element value and fire appropriate events to simulate what happens
    // when user types in input box
    inputValue: function(component, value) {
        var inputElm = component.getElement();
        inputElm.value = value;
        // typing triggers input event
        // it tells the component to cache the elem value for when a change/blur event happens
        $A.test.fireDomEvent(inputElm, "input");
    },

    // fire blur event to update v.value and format elem value
    triggerUpdateCmpElmValues: function(component) {
        var inputElm = component.getElement();
        $A.test.fireDomEvent(inputElm, "blur");
    },

    // check component's internval v.value and displayed value on the input box
    assertCmpElemValues: function (component, expectedCmpVal, expectedElemVal) {
        $A.test.assertEquals(expectedCmpVal, component.get("v.value"),
                "Cmp value doesn't equal to expected");
        $A.test.assertEquals(expectedElemVal, component.getElement().value,
                "Element value is not displayed/formatted correctly.");
    }
})// eslint-disable-line semi
