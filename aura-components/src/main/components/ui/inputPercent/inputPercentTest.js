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

    /*****************
     * Helpers
     *****************/
    // check component's internval v.value and displayed value on the input box
    assertCmpElemValues: function (component, expectedCmpVal, expectedElemVal) {
        $A.test.assertEquals(expectedCmpVal, component.get("v.value"));
        $A.test.assertEquals(expectedElemVal, component.getElement().value,
                "Element value is not displayed/formatted correctly.");
    }
})// eslint-disable-line semi
