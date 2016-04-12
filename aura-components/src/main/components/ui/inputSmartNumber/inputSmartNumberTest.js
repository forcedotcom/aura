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
            this.assertCmpElemValues(component, 0, "0");
        }
    },

    /*
     * Test decimal number
     */
    testDecimalNumber: {
        attributes: {value: 12345.67},
        test: function (component) {
            this.assertCmpElemValues(component, 12345.67, "12,345.67");
        }
    },

    /*
     * Test negative number
     */
    testNegativeNumber: {
        attributes: {value: -12345.67},
        test: function (component) {
            this.assertCmpElemValues(component, -12345.67, "-12,345.67");
        }
    },

    /*
     * Test integer number
     */
    testIntegerNumber: {
        attributes: {value: 12345},
        test: function (component) {
            this.assertCmpElemValues(component, 12345, "12,345");
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
        attributes: {value: 22.7, format: '##,#0,00.00#####'},
        test: [function(component) {
            this.assertCmpElemValues(component, 22.7, "0,22.70");
            component.set("v.value", 49322);
        }, function(component) {
           this.assertCmpElemValues(component, 49322, "4,93,22.00");
        }]
    },

    /**
     * Test value is formatted correctly
     */
    testFormatValue: {
        attributes: {value: 12345.67, format: "$#,##.0000:)"},
        test: function (component) {
            this.assertCmpElemValues(component, 12345.67, "$1,23,45.6700:)");
        }
    },

    /**
     * Verify that when the format changes it is not re-rendered with the new format
     */
    testUpdateFormat: {
        attributes: {value: 1234, format: "#,###.0000"},
        test: [function (component) {
            this.assertCmpElemValues(component, 1234, "1,234.0000");
            component.set("v.format", '#,##.00');
        }, function (component) {
            // updating format dynamically is not supported
            // value stays the same
            this.assertCmpElemValues(component, 1234, "1,234.0000");
        }]
    },

    testCheckValueTypePassingAttr:  {
        attributes: {value: 12345},
        test: [function (cmp) {
            var value = cmp.get('v.value');
            $A.test.assertEquals('number', typeof value, 'The type of value should be and Number');
        }]
    },

    testCheckValueTypeSettingAttr: {
        test: [function (cmp) {
            cmp.set('v.value', 12345);
        }, function (cmp) {
            var value = cmp.get('v.value');
            $A.test.assertEquals('number', typeof value, 'The type of value should be and Number');
        }]
    },
    testNegativeFormatWithparenthesis : {
        attributes : {
            format : '$#,##0;($#,##0)',
            value  : -1234
        },
        test : [
            function (cmp) {
                this.assertCmpElemValues(cmp, -1234, "($1,234)");
                cmp.set('v.value',1234);
            },
            function (cmp) {
                this.assertCmpElemValues(cmp, 1234, "$1,234");
                cmp.set('v.value',-1234);
            },
            function (cmp) {
                this.assertCmpElemValues(cmp, -1234, "($1,234)");
            }
        ]
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
