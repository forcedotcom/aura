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
            this.assertCmpElemValues(component, 0, "$0.00");
        }
    },

    /*
     * Test integer value
     */
    testIntegerCurrency: {
        attributes: {value: 12345},
        test: function (component) {
            this.assertCmpElemValues(component, 12345, "$12,345.00");
        }
    },

    /*
     * Test decimal value
     */
    testDecimalCurrency: {
        attributes: {value: 12345.67},
        test: function (component) {
            this.assertCmpElemValues(component, 12345.67, "$12,345.67");
        }
    },

    /*
     * Test negative value
     */
    testNegativeCurrency: {
        attributes: {value: -123},
        test: function (component) {
            this.assertCmpElemValues(component, -123, "-$123.00");
        }
    },

    /**
     * Test currency formatted correctly.
     */
    testDefaultFormat: {
        attributes: {value: 1234},
        test: function (component) {
            this.assertCmpElemValues(component, 1234, "$1,234.00");
            $A.test.assertEquals("¤#,##0.00", component.get('v.format'),
                    "The actual format did not match the expected format");
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
        attributes: {value: 1234, format: ',,'},
        test: function (component) {
            this.assertCmpElemValues(component, 1234, "$1,234.00");
        }
    },

    /**
     * Test currency formatted correctly with custom format.
     */
    testWithFormat: {
        attributes: {value: 1234.56, format: "$#,###.0000"},
        test: function (component) {
            this.assertCmpElemValues(component, 1234.56, "$1,234.5600");
        }
    },

    /**
     * Test well-formatted value
     */
    testSetValueWithWellFormattedValue: {
        test: [function(component) {
            component.set('v.value', '$56,789.00');
        }, function(component) {
            this.assertCmpElemValues(component, 56789, '$56,789.00');
        }]
    },

    /**
     * Test set value using number string
     */
    testSetValueWithString: {
        test: [function(component) {
            component.set('v.value', '56789');
        }, function(component) {
            this.assertCmpElemValues(component, 56789, '$56,789.00');
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
        }, function(component){
            this.assertCmpElemValues(component, null, this.EMPTY_STRING);
        }]
    },

    /*
     * Verify that when the value changes it is re-rendered with the new format
     */
    testUpdateValue: {
        attributes: {value: 1234, format: "$#,###.0000"},
        test: [function (component) {
            this.assertCmpElemValues(component, 1234, "$1,234.0000");
            component.set("v.value", 5678);
        }, function (component) {
            // after dirty component is re-rendered, now input element
            // should be displaying the new value
            this.assertCmpElemValues(component, 5678, "$5,678.0000");
        }]
    },

    /**
     * Verify that when the format changes it is not re-rendered with the new format
     */
    testUpdateFormat: {
        attributes: {value: 1234, format: "@#,###.0000"},
        test: [function (component) {
            this.assertCmpElemValues(component, 1234, "@1,234.0000");
            component.set("v.format", '$#,###.00');
        }, function (component) {
            // updating format dynamically is not supported
            // value stays the same
            this.assertCmpElemValues(component, 1234, "@1,234.0000");
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
            this.assertCmpElemValues(component, 1000, "$1,000.00");
        }, function(component) {
            this.inputValue(component, "1K");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000, "$1,000.00");
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
            this.assertCmpElemValues(component, 1000000, "$1,000,000.00");
        }, function(component) {
            this.inputValue(component, "1M");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000000, "$1,000,000.00");
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
            this.assertCmpElemValues(component, 1000000000, "$1,000,000,000.00");
        }, function(component) {
            this.inputValue(component, "1B");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000000000, "$1,000,000,000.00");
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
            this.assertCmpElemValues(component, 1000000000000, "$1,000,000,000,000.00");
        }, function(component) {
            this.inputValue(component, "1T");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 1000000000000, "$1,000,000,000,000.00");
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
            this.assertCmpElemValues(component, 100000, "$100,000.00");
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
            this.assertCmpElemValues(component, 1000, "$1,000.00");
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
            this.assertCmpElemValues(component, 123, "$123.00");
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
            this.assertCmpElemValues(component, -123, "-$123.00");
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
            this.assertCmpElemValues(component, 12345, "$12,345.00");
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
            this.assertCmpElemValues(component, 0.12, "$0.12");
        }, function(component) {
            this.inputValue(component, "+.34");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, 0.34, "$0.34");
        }, function(component) {
            this.inputValue(component, "-.56");
        }, function(component) {
            this.triggerUpdateCmpElmValues(component);
        }, function(component) {
            this.assertCmpElemValues(component, -0.56, "-$0.56");
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
            this.assertCmpElemValues(component, 123, "$123.00");
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
            this.assertCmpElemValues(component, 1000, "1k");
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
