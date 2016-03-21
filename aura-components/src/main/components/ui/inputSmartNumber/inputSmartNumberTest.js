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
    /*
     * Pass nothing to component
     */
    testUnassigned: {
        test: function (component) {
            this.assertValue(component, undefined, "");
        }
    },

    /*
     * Test 0 to catch if(number) bug
     */
    testZero: {
        attributes: {value: 0},
        test: function (component) {
            this.assertValue(component, 0, "0");
        }
    },

    /*
     * Test general number
     */
    testNumber: {
        attributes: {value: 12345.67},
        test: function (component) {
            this.assertValue(component, 12345.67, "12,345.67");
        }
    },

    /*
     * Test negative number
     */
    testNegativeNumber: {
        attributes: {value: -12345.67},
        test: function (component) {
            this.assertValue(component, -12345.67, "-12,345.67");
        }
    },

    /**
     * Verify that when the format changes it is not re-rendered with the new format
     */
    testUpdateFormat: {
        attributes: {value: 1234, format: "#,###.0000"},
        test: [
            function (component) {
                this.assertValue(component, 1234, "1,234.0000");
                component.set("v.format", '#,##.00');
            },
            function (component) {
                this.assertValue(component, 1234, "1,234.0000");
            }
        ]
    },

    // check component's internval v.value and displayed value on the input box
    assertValue: function (component, expectedComponentValue, expectedElementValue) {
        $A.test.assertEquals(expectedComponentValue, component.get("v.value"),
                "Cmp value does not equal expected");
        $A.test.assertEquals(expectedElementValue, component.getElement().value,
                "Element value does not equal expected");
    },
    testCheckValueTypePassingAttr :  {
        attributes : { value : 12345 },
        test : [
            function (cmp) {
                var value = cmp.get('v.value');
                $A.test.assertEquals('number',typeof value,'The type of value should be and Number');
            }
        ]
    },
    testCheckValueTypeSettingAttr : {
        test : [
            function (cmp) {
                cmp.set('v.value',12345);
            },
            function (cmp) {
                var value = cmp.get('v.value');
                $A.test.assertEquals('number',typeof value,'The type of value should be and Number');
            }
        ]
    }
})// eslint-disable-line semi
