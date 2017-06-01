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
    EMPTY_STRING: '',
    /*
     * Pass nothing to component
     */
    testUnassigned: {
        test: function (component) {
            this.assertCmpElemValues(component, undefined, this.EMPTY_STRING);
        }
    },

    /*
     * Test 0 to catch if(number) bug
     */
    testZero: {
        attributes: {value: 0},
        test: function (component) {
            this.assertCmpElemValues(component, 0, "0%");
        }
    },

    /**
     * Test percent formated correctly with default format
     */
    testDefaultFormat: {
        attributes: {value: .12},
        test: function(component) {
            this.assertCmpElemValues(component, 0.12, '12%');
        }
    },

    /**
     * Test percent formated correclty with value scale
     */
    testValueScale: {
        attributes: {value: .12, valueScale: "5" },
        test: function(component) {
            this.assertCmpElemValues(component, 0.12, '1,200,000%');
        }
    },

    /**
     * Test percent formatted correctly when value scale is a negative value
     * displayed value = value * 100. so value 12000 -> display 1200000 -> -5 scale (divide 10^5) -> 12
     */
    testValueScaleNegative: {
        attributes: {value: 12000, valueScale: "-5"},
        test: function(component) {
            this.assertCmpElemValues(component, 12000, '12%');
        }
    },

    /**
     * Test percent formated correctly with custom format
     */
    testValueScaleWithFormat: {
        attributes: {value: .12,  valueScale: "5", format: "#,###.00%"},
        test: function(component) {
            this.assertCmpElemValues(component, 0.12, '1,200,000.00%');
        }
    },

    /**
     * Test to make sure positive value works when changing the format
     */
    testPositiveValueWithFormat: {
        attributes: {value: 1.145, format: '0000.0%'},
        test: function(component) {
            this.assertCmpElemValues(component, 1.145, '0114.5%');
        }
    },

    /**
     * Test to make sure negative value works when changing the format
     */
    testNegativeValueWithFormat: {
        attributes: {value: -0.14, format: '.000%'},
        test: function(component) {
            this.assertCmpElemValues(component, -0.14, '-14.000%');
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
     * Test passing invalid format. Expect to use default format.
     */
    testInvalidFormat: {
        attributes: { value: 30, format: ',,'},
        test: function(component) {
            this.assertCmpElemValues(component, 30, '3,000%');
        }
    },

    /**
     * Test rounding up
     */
    testRoundingUp: {
        attributes: {value: 0.14565, format: '0.00%'},
        test: function(component) {
            this.assertCmpElemValues(component, 0.14565, '14.57%');
        }
    },

    /**
     * Test rounding down
     */
    testRoundingDown: {
        attributes: {value: 0.14564, format: '0.00%'},
        test: function(component) {
            this.assertCmpElemValues(component, 0.14564, '14.56%');
        }
    },

    /**
     * Test precision with format
     */
    testPrecision: {
        attributes: {value: .05, format: '.0%'},
        test: function(component) {
            this.assertCmpElemValues(component, .05, '5.0%');
        }
    },

    /**
     * Test set value using number string
     */
    testSetValueWithString: {
        test: [function(component) {
            component.set('v.value', '56789');
        }, function(component) {
            this.assertCmpElemValues(component, 56789, '5,678,900%');
        }]
    },

    /*
     * Verify that when value is set to an invalid value,
     * internal v.value should be undefined
     * displayed value should be empty
     */
    testSetInvalidValue: {
        test: [function (component) {
            component.set('v.value', 'abc');
        }, function(component) {
            this.assertCmpElemValues(component, null, this.EMPTY_STRING);
        }]
    },

    /**
     * Verify that when the value changes it is rerendered with the unformated new value
     */
    testUpdateValue: {
        attributes: {value: .23},
        test: [function(component) {
            this.assertCmpElemValues(component, .23, '23%');
            component.set("v.value", 965.21);
        }, function(component) {
            // after dirty component is re-rendered, now input element
            // should be displaying the new value
            this.assertCmpElemValues(component, 965.21, '96,521%');
        }]
    },

    /**
     * Verify that when the format changes it is not re-rendered dynamically using the new format
     */
    testUpdateFormat: {
        attributes: {value: .227, format: '#0.#%'},
        test: [function(component) {
            this.assertCmpElemValues(component, .227, '22.7%');
            component.set("v.format", "000.00 %");
        }, function(component) {
            // updating format dynamically is not supported
            // displayed value stays the same unless value gets updated
            this.assertCmpElemValues(component, .227, '22.7%');
        }]
    },

    /**
     * Verify that when the valueScale changes it is not re-rendered dynamically using the new scale
     */
    testUpdateValueScale: {
        attributes: {value: .12, valueScale: 5},
        test: [function(component) {
            this.assertCmpElemValues(component, 0.12, '1,200,000%');
            component.set("v.valueScale", 0);
        }, function(component) {
            // updating valueScale dynamically is not supported
            // value stays the same unless value gets updated
            this.assertCmpElemValues(component, 0.12, '1,200,000%');
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
            this.assertCmpElemValues(component, 10, "1,000%");
        }, function(component) {
            this.inputValue(component, "1K");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 10, "1,000%");
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
            this.assertCmpElemValues(component, 10000, "1,000,000%");
        }, function(component) {
            this.inputValue(component, "1M");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 10000, "1,000,000%");
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
            this.assertCmpElemValues(component, 10000000, "1,000,000,000%");
        }, function(component) {
            this.inputValue(component, "1B");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 10000000, "1,000,000,000%");
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
            this.assertCmpElemValues(component, 10000000000, "1,000,000,000,000%");
        }, function(component) {
            this.inputValue(component, "1T");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 10000000000, "1,000,000,000,000%");
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
            this.assertCmpElemValues(component, 1000, "100,000%");
        }]
    },
    
    /**
     * Test shortcut should work for decimal value when update on input
     */
    testShortcutWithDecimalUpdateOnInput : {
    	attributes: { updateOn: "input" },
    	test : [function(component) {
    		this.inputValue(component, ".");
    		$A.test.assertEquals(".", component.getElement().value, "Unexpected input value");
    	}, function(component) {
            var existingInputVal = component.getElement().value;
    		this.inputValue(component, existingInputVal + "1");
    		$A.test.assertEquals(".1", component.getElement().value, "Unexpected input value");
    	}, function(component) {
    		var existingInputVal = component.getElement().value;
    		this.inputValue(component, existingInputVal + "m");
    		$A.test.assertEquals(".1m", component.getElement().value, "Unexpected input value");
    	},function(component) {
    		this.triggerUpdateCmpElmValues(component);
    	}, function(component) {
    		this.assertCmpElemValues(component, 1000, "100,000%");
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
            this.assertCmpElemValues(component, 10, "1,000%");
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
            this.assertCmpElemValues(component, 1.23, "123%");
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
            this.assertCmpElemValues(component, -1.23, "-123%");
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
            this.assertCmpElemValues(component, 123.45, "12,345%");
        }]
    },

    /**
     * Leading decimal mark should be treated as "0."
     * Expected results should all get rounded
     * as percent doesn't allow decimal
     */
    testLeadingDecimalMark: {
        test: [function(component) {
            this.inputValue(component, ".56");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 0.01, "1%");
        }, function(component) {
            this.inputValue(component, "+.12");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 0, "0%");
        }, function(component) {
            this.inputValue(component, "-.91");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, -0.01, "-1%");
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
            this.assertCmpElemValues(component, 1.23, "123%");
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
            $A.test.assertEquals(component.get("v.value"), 10);
        }]
    },

    testUpdateOnKeydown: {
        attributes: { updateOn: "keydown" },
        test: [function(component) {
            this.inputValue(component, "1k");
        }, function(component) {
            $A.test.assertEquals(component.get("v.value"), 10);
        }]
    },

    testUpdateOnKeypress: {
        attributes: { updateOn: "keypress" },
        test: [function(component) {
            this.inputValue(component, "1k");
        }, function(component) {
            $A.test.assertEquals(component.get("v.value"), 10);
        }]
    },

    testUpdateOnInput: {
        attributes: { updateOn: "input" },
        test: [function(component) {
            this.inputValue(component, "1k");
        }, function(component) {
            $A.test.assertEquals(component.get("v.value"), 10);
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
            $A.test.assertEquals(component.get("v.value"), 10);
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
        $A.test.fireDomEvent(inputElm, "change");
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
