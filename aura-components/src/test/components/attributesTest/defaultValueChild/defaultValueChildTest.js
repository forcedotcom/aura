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
    testBasicTypeDefaultValueFromParentCmp : {
        test : function(cmp) {
            $A.test.assertTrue(cmp.get("v.booleanDefaultInherit"),
                    "Boolean attribute value did not match default value given by a parent cmp attribute.");
            $A.test.assertEquals(168.34, cmp.get("v.decimalDefaultInherit"),
                    "Deciaml attribute value did not match default value given by a parent cmp attribute.")
            $A.test.assertEquals(-168.34, cmp.get("v.doubleDefaultInherit"),
                    "Double attribute value did not match default value given by a parent cmp attribute.");
            $A.test.assertEquals(123, cmp.get("v.integerDefaultInherit"),
                    "Integer attribute value did not match default value given by a parent cmp attribute.");
            $A.test.assertEquals(-123, cmp.get("v.longDefaultInherit"),
                    "Long attribute value did not match default value given by a parent cmp attribute.");
            $A.test.assertEquals("test string", cmp.get("v.stringDefaultInherit"),
                    "String attribute value did not match default value given by a parent cmp attribute.");
        }
    },

    testBasicTypeDefaultValueOfParentCmp : {
        test : function(cmp) {
            $A.test.assertFalse(cmp.get("v.booleanDefaultWithViewExpFalse"),
                    "Boolean attribute did not match expected default value defined in parent cmp.");
            $A.test.assertEquals(168.34, cmp.get("v.decimalDefaultWithStringPositiveDecimal"),
                    "Decimal attribute did not match expected default value defined in parent cmp.");
            $A.test.assertEquals(-168.34, cmp.get("v.doubleDefaultWithStringNegativeDecimal"),
                    "Double attribute did not match expected default value defined in parent cmp.");
            $A.test.assertEquals(123, cmp.get("v.integerDefaultWithStringPositiveInt"),
                    "Integer attribute did not match expected default value defined in parent cmp.");
            $A.test.assertEquals(-123, cmp.get("v.longDefaultWithStringNegativeInt"),
                    "Long attribute did not match expected default value defined in parent cmp.");
            $A.test.assertEquals("test string", cmp.get("v.stringDefaultWithString"),
                    "String attribute did not match expected default value defined in parent cmp.");
        },
    },

    testObjectDefaultValueFromParentCmp : {
        test : function(cmp) {
            $A.test.assertEquals("['red','green','blue']", cmp.get("v.objectDefaultInherit"),
                    "Object attribute did not match expected default value given by a parent cmp attribute.");
        }
    },

    testObjectDefaultValueOfParentCmp : {
        test : function(cmp) {
            $A.test.assertEquals("['red','green','blue']", cmp.get("v.objAttributeWithDefaultValue"),
                    "Object attribute did not match expected default value defined in parent cmp.");
        }
    },

    testMapDefaultValueFromParentCmp : {
        test : function(cmp) {
            var mapAttr = cmp.get("v.mapDefaultInherit");
            $A.test.assertTrue($A.util.isObject(mapAttr), "Expected to find attribute of Map(Object)");
            $A.test.assertEquals(1, mapAttr.a);
            $A.test.assertEquals(2, mapAttr.b);
        }
    },

    testMapDefaultValueOfParentCmp : {
        test : function(cmp) {
            var mapAttr = cmp.get("v.mapAttributeWithDefaultValue");
            $A.test.assertTrue($A.util.isObject(mapAttr), "Expected to find attribute of Map(Object)");
            $A.test.assertEquals(1, mapAttr.a);
            $A.test.assertEquals(2, mapAttr.b);
        }
    },

    testListDefaultValueFromParentCmp : {
        test : function(cmp) {
            var listAttr = cmp.get("v.listDefaultInherit");
            $A.test.assertTrue($A.util.isArray(listAttr), "Expected to find attribute of Array type");
            $A.test.assertEquals("true", listAttr[0]);
            $A.test.assertEquals("false", listAttr[1]);
            $A.test.assertEquals("true", listAttr[2]);
        }
    },

    testListDefaultValueOfParentCmp : {
        test : function(cmp) {
            var listAttr = cmp.get("v.listAttributeWithDefaultValue");
            $A.test.assertTrue($A.util.isArray(listAttr), "Expected to find attribute of Array type");
            $A.test.assertEquals("true", listAttr[0]);
            $A.test.assertEquals("false", listAttr[1]);
            $A.test.assertEquals("true", listAttr[2]);
        }
    }
})