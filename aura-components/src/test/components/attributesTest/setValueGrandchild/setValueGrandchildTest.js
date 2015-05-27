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
    testAttributeSetOnComponents: {
        test: [
                function(cmp) {
                    $A.test.assertTrue($A.util.isArray(cmp.get("v.componentDefault")));
                },
                function(cmp) {
                    var expected = "setValueChild";
                    var actual = cmp.get("v.componentDefault")[0].get("v.value").trim();
                    $A.test.assertEquals(expected, actual);
                }
            ]
    },
    testAttributeSetOnComponents2: {
        test: function(cmp) {
            var expected = "setValueGrandchild";
            var actual = cmp.get("v.componentDefault2")[0].get("v.value").trim();
            $A.test.assertEquals(expected, actual);
        }
    },
    testAttributeSetOnMap: {
        test: [
                function(cmp) {
                    $A.test.assertTrue($A.util.isObject(cmp.get("v.mapAttributeWithDefaultValue")));
                },
                function(cmp) {
                    var actual = cmp.get("v.mapAttributeWithDefaultValue");
                    $A.test.assertEquals(2, actual.b);
                    $A.test.assertEquals(3, actual.c);
                }
            ]
    },
    testAttributeSetOnObject: {
        test: [
                function(cmp) {
                    // It's a string because the attribute is of type "Object" which is a base type of String
                    $A.test.assertTrue(typeof cmp.get("v.objAttributeWithDefaultValue") == "string");
                },
                function(cmp) {
                    var actual = cmp.get("v.objAttributeWithDefaultValue");
                    $A.test.assertEquals("['grey','silver','slate']", actual);
                }
            ]
    },
    testAttributeSetOnList: {
        test: [
                function(cmp) {
                    $A.test.assertTrue($A.util.isArray(cmp.get("v.listAttributeWithDefaultValue")));
                },
                function(cmp) {
                    var actual = cmp.get("v.listAttributeWithDefaultValue");
                    $A.test.assertEquals("grey,silver,slate", actual.join(","));
                }
            ]
    },
    testAttributeSetOnBooleanArray: {
        test: [
                function(cmp) {
                    $A.test.assertTrue($A.util.isArray(cmp.get("v.arrayAttributeWithDefaultValue")));
                },
                function(cmp) {
                    var actual = cmp.get("v.arrayAttributeWithDefaultValue");
                    $A.test.assertEquals(false, actual[0]);
                    $A.test.assertEquals('true', actual[1]);
                    $A.test.assertEquals(true, actual[2]);
                }
            ]
    },
    testAttributeSetOnLong: {
        test: [
                function(cmp) {
                    $A.test.assertTrue($A.util.isNumber(cmp.get("v.longDefaultWithStringPositiveInt")));
                },
                function(cmp) {
                    var actual = cmp.get("v.longDefaultWithStringPositiveInt");
                    $A.test.assertEquals(9007199254740991, actual);
                }
            ]
    },
    testAttributeSetOnInteger: {
        test: [
                function(cmp) {
                    $A.test.assertTrue($A.util.isNumber(cmp.get("v.integerDefaultWithStringPositiveInt")));
                },
                function(cmp) {
                    var actual = cmp.get("v.integerDefaultWithStringPositiveInt");
                    $A.test.assertEquals(2147483647, actual);    
                }
            ]
    },
    testAttributeSetOnDouble: {
        test: [
                function(cmp) {
                    $A.test.assertTrue($A.util.isNumber(cmp.get("v.doubleDefaultWithStringPositiveInt")));
                },
                function(cmp) {
                    var actual = cmp.get("v.doubleDefaultWithStringPositiveInt");
                    $A.test.assertEquals(9007199254740991, actual);    
                }
            ]
    },
    testAttributeSetOnDecimal: {
        test: [
                function(cmp) {
                    $A.test.assertTrue($A.util.isNumber(cmp.get("v.decimalDefaultWithStringPositiveInt")));
                },
                function(cmp) {
                    var actual = cmp.get("v.decimalDefaultWithStringPositiveInt");
                    $A.test.assertEquals(9.99999999999999, actual);    
                }
            ]
    },
    testAttributeSetOnDateTime: {
        test: function(cmp) {
            $A.test.assertTrue(cmp.get("v.dateTimeDefaultWithString").indexOf("2015-05-01T") == 0);
        }
    },
    testAttributeSetOnDate: {
        test: function(cmp) {
            $A.test.assertTrue(cmp.get("v.dateDefaultWithString").indexOf("2015-02-05T") == 0);
        }
    },
    testAttributeSetOnString: {
        test: [
                function(cmp) {
                    $A.test.assertTrue($A.util.isString(cmp.get("v.stringDefaultWithString")));
                },
                function(cmp) {
                    var actual = cmp.get("v.stringDefaultWithString");
                    $A.test.assertEquals("test string2", actual);
                }
            ]
    },
    testAttributeSetOnBoolean: {
        test: [
                function(cmp) {
                    $A.test.assertFalse(cmp.get("v.booleanDefaultWithStringFalse"));
                },
                function(cmp) {
                    $A.test.assertTrue($A.util.isBoolean(cmp.get("v.booleanDefaultWithStringFalse")));
                }
            ]
    }


})