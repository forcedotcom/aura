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

    testObjectDataTypeAndDefaultValue : {
        test : function(cmp) {
            this.verifyDefaultValuesOfObjectDataType(cmp);
        }
    },

    testListDataTypeAndDefaultValue : {
        test : function(cmp) {
            this.verifyDefaultValuesOfListDataType(cmp);
        }
    },

    testMapDataTypeAndDefaultValue : {
        test : function(cmp) {
            this.verifyDefaultValuesOfMapDataType(cmp);
        }
    },

    testSetTypeWithEmptyDefaultValue : {
        test : function(cmp) {
            var actual = cmp.get("v.setDefaultWithEmpty");
            $A.test.assertTrue($A.util.isArray(actual));
            $A.test.assertEquals(0, actual.length);
        }
    },

    testSetTypeWithStringDefaultValue : {
        test : function(cmp) {
            var except = ['a', 'b', 'c'];
            var actual = cmp.get("v.setDefaultWithString");
            $A.test.assertTrue($A.util.isArray(actual));
            // Set is unordered
            var result = $A.test.compareValues(except.sort(), actual.sort());
            $A.test.assertTrue(result['match'], result['reasons']);
        }
    },

    testSetTypeWithStringDefaultValue : {
        test : function(cmp) {
            var except = [1, 2, 3];
            var actual = cmp.get("v.setDefaultWithBracketString");
            $A.test.assertTrue($A.util.isArray(actual));
            // Set is unordered
            var result = $A.test.compareValues(except.sort(), actual.sort());
            $A.test.assertTrue(result['match'], result['reasons']);
        }
    },

    testSetTypeWithStringElementContainBrancketDefaultValue : {
        test : function(cmp) {
            var except = ['[1]', '2', '3'];
            var actual = cmp.get("v.setDefaultWithStringContainBracket");
            $A.test.assertTrue($A.util.isArray(actual));
            // Set is unordered
            var result = $A.test.compareValues(except.sort(), actual.sort());
            $A.test.assertTrue(result['match'], result['reasons']);
        }
    },

    testCaseSensitivity : {
        test : [
            function(cmp) {
                $A.test.assertEquals('Aura', cmp.get("v.strAttributeWithDefaultValue"));
            },
            function(cmp) {
                $A.test.expectAuraError("Access Check Failed!");
                $A.test.assertUndefined(cmp.get("v.StrAttributeWithDefaultValue"));
            },
            function(cmp) {
                $A.test.expectAuraError("Access Check Failed!");
                $A.test.assertUndefined(cmp.get("v.strATTRIBUTEWithDefaultValue"));
            },
            function(cmp) {
                $A.test.expectAuraError("Access Check Failed!");
                $A.test.assertUndefined(cmp.get("v.strATTRIBUTEWithNODefaultValue"));
            }
        ]
    },

    /**
     * Verify that a locally created component has the same set of default attribute values. In this case the component
     * being creates already has its def at the client.
     */
    testNewComponentChangingDefaultValues : {
        test : function(cmp) {
            var self = this;
            $A.createComponent("attributesTest:defaultValue", {},
                function (newComp) {
                    self.verifyChangingAttributeValues(newComp);
                }
            );
        }
    },

    testNewComponentDefaultValueBasicDataTypes: {
        test: function(cmp) {
            var self = this;
            $A.createComponent("attributesTest:defaultValue", {},
                function (newComp) {
                    self.verifyDefaultValuesOfBasicDataType(newComp);
                }
            );
        }
    },

    testNewComponentDefaultValueObjectDataType: {
        test: function(cmp) {
            var self = this;
            $A.createComponent("attributesTest:defaultValue", {},
                function(newComp) {
                    self.verifyDefaultValuesOfObjectDataType(newComp);
                }
            );
        }
    },

    testNewComponentDefaultValueListDataType: {
        test: function(cmp) {
            var self = this;
            $A.createComponent("attributesTest:defaultValue", {},
                function (newComp) {
                    self.verifyDefaultValuesOfListDataType(newComp);
                }
            );
        }
    },

    testNewComponentDefaultValueMapDataType: {
        test: function(cmp) {
            var self = this;
            $A.createComponent("attributesTest:defaultValue", {},
                function (newComp) {
                    self.verifyDefaultValuesOfMapDataType(newComp);
                }
            );
        }
    },

    testDefaultValueComponentArrayIsArrayOfComponents: {
        test: function(cmp) {
            var cmpValue = cmp.get("v.componentDefault");
            $A.test.assertTrue($A.util.isComponent(cmpValue[0]));
        }
    },

    testChangingAttributesWithDefalutValue : {
        test : function(cmp) {
            this.verifyChangingAttributeValues(cmp);
        }
    },

    testDefaultValuesOfComponentType : {
        test : function(cmp) {
            var cmpValue = cmp.get("v.componentDefault");
            $A.test.assertTrue($A.util.isArray(cmpValue));
            $A.test.assertEquals(1, cmpValue.length);
            // KRIS: If this is failing it's possibly because the Array of Components has not been converted to components, but instead
            // is still component configs.
            $A.test.assertEquals("markup://aura:text", cmpValue[0].getDef().getDescriptor().toString());
        }
    },

    verifyDefaultValuesOfObjectDataType : function(testCmp) {
        $A.test.assertEquals("['red','green','blue']", testCmp.get("v.objAttributeWithDefaultValue"),
                "Failed to see default value of object attribute.");
        $A.test.assertEquals("['red','green','blue']", testCmp.get("v.objAttributeWithDefaultValue"));
        $A.test.assertFalsy(testCmp.get("v.objAttributeWithNoDefaultValue"),
                "Attributes without default value should have undefined as value");
    },

    verifyDefaultValuesOfListDataType : function(testCmp) {
        var listAttr = testCmp.get("v.listAttributeWithDefaultValue");
        $A.test.assertTrue($A.util.isArray(listAttr), "Expected to find attribute of Array type");
        $A.test.assertEquals("true", listAttr[0]);
        $A.test.assertEquals("false", listAttr[1]);
        $A.test.assertEquals("true", listAttr[2]);

        var a = testCmp.get("v.listAttributeWithNoDefaultValue");
        $A.test.assertTrue($A.util.isArray(a));
        $A.test.assertTrue($A.util.isEmpty(a), "Array type attributes without default value should have empty array as value");
    },

    verifyDefaultValuesOfMapDataType : function(testCmp) {
        var mapAttr = testCmp.get("v.mapAttributeWithDefaultValue");
        $A.test.assertTrue($A.util.isObject(mapAttr), "Expected to find attribute of Map(Object)");
        $A.test.assertEquals(1, mapAttr.a);
        var a = testCmp.get("v.mapAttributeWithNoDefaultValue");
        $A.test.assertTrue(a === null, "Expected to find attribute of Map(Object)");
    },

    verifyChangingAttributeValues : function(testCmp) {
        testCmp.set("v.strAttributeWithDefaultValue", "nemuL");
        $A.test.assertEquals("nemuL", testCmp.get("v.strAttributeWithDefaultValue"),
                "Failed to change value of attribute.");

        testCmp.set("v.strAttributeWithNoDefaultValue", "Saturday Night Live");
        $A.test.assertEquals("Saturday Night Live", testCmp.get("v.strAttributeWithNoDefaultValue"),
                "Failed to change value of attribute.");

        testCmp.set("v.objAttributeWithDefaultValue", "['white','black']")
        $A.test.assertEquals("['white','black']", testCmp.get("v.objAttributeWithDefaultValue"),
                "Failed to change value of attribute.");

        //TODO W-2248588
//        testCmp.set("v.fooBar", "Jacked")
//        $A.test.assertFalsy(testCmp.get("v.fooBar"),
//                "Should not be able to create and set values for unidentified attributes.");
    },

    testDefaultValueOfInteger : {
        test : function(cmp) {
            // TODO (W-2501367) using falsy to check the value when no default is given, might need to check more specific value
            // after we have more consistency.
            $A.test.assertFalsy(cmp.get("v.integerDefaultWithNoValue"),
                    "Integer attribute without defined default value should have falsy value.");

            var attributeType = "integer";
            this.verifyDefaultValueOfBasicNumber(cmp, attributeType);
            this.verifyDefaultValueOfBasicNumberInExpression(cmp, attributeType);
        }
    },

    testDefaultValueOfLong : {
        test : function(cmp) {
            $A.test.assertFalsy(cmp.get("v.longDefaultWithNoValue"),
                    "Long attribute without defined default value should have falsy value.");

            var attributeType = "long";
            this.verifyDefaultValueOfBasicNumber(cmp, attributeType);
            this.verifyDefaultValueOfBasicNumberInExpression(cmp, attributeType);
        }
    },

    testDefaultValueOfDecimal : {
        test : function(cmp) {
            $A.test.assertFalsy(cmp.get("v.decimalDefaultWithNoValue"),
                    "Decimal attribute without defined default value should have falsy value.");

            var attributeType = "decimal";
            this.verifyDefaultValueOfBasicNumber(cmp, attributeType);
            this.verifyDefaultValueOfBasicNumberWithFraction(cmp, attributeType);
            this.verifyDefaultValueOfBasicNumberWithFractionInExpression(cmp, attributeType);
        }
    },

    testDefaultValueOfDouble : {
        test : function(cmp) {
            $A.test.assertFalsy(cmp.get("v.doubleDefaultWithNoValue"),
                    "Double attribute without defined default value should have falsy value.");

            var attributeType = "double";
            this.verifyDefaultValueOfBasicNumber(cmp, attributeType);
            this.verifyDefaultValueOfBasicNumberWithFraction(cmp, attributeType);
            this.verifyDefaultValueOfBasicNumberWithFractionInExpression(cmp, attributeType);
        }
    },

    testDefaultValueOfBoolean : {
        test : function(cmp) {
            $A.test.assertFalsy(cmp.get("v.booleanDefaultWithNoValue"),
                    "Boolean attribute without defined default value should have falsy value.");

            var attributeType = "boolean";
            $A.test.assertEquals(true, cmp.get("v.booleanDefaultWithStringTrue"),
                    "boolean attribute value did not match default value as true in String.");
            $A.test.assertEquals(false, cmp.get("v.booleanDefaultWithStringFalse"),
                    "boolean attribute value did not match default value as false in String.");
            $A.test.assertEquals(true, cmp.get("v.booleanDefaultWithLiteralExpTrue"),
                    "boolean attribute value did not match default value as true in literal expression.");
            $A.test.assertEquals(false, cmp.get("v.booleanDefaultWithLiteralExpFalse"),
                    "boolean attribute value did not match default value as false in literal expression.");
            $A.test.assertEquals(true, cmp.get("v.booleanDefaultWithViewExpTrue"),
                    "boolean attribute value did not match default value as true in expression.");
            $A.test.assertEquals(false, cmp.get("v.booleanDefaultWithViewExpFalse"),
                    "boolean attribute value did not match default value as false in expression.");
        }
    },

    testDefaultValueOfString : {
        test : function(cmp) {
            $A.test.assertFalsy(cmp.get("v.stringDefaultWithNoValue"),
                    "String attribute without defined default value should have falsy value.");

            var attributeType = "string";
            var expected = "test string";
            $A.test.assertEquals(expected, cmp.get("v.stringDefaultWithString"),
                    "string attribute value did not match default value in String.");
            $A.test.assertEquals(expected, cmp.get("v.stringDefaultWithLiteralExp"),
                    "string attribute value did not match default value in literal expression.");

            expected = "";
            $A.test.assertEquals(expected, cmp.get("v.stringDefaultWithStringEmptyString"),
                    "string attribute value did not match default value as empty string in String.");
            $A.test.assertEquals(expected, cmp.get("v.stringDefaultWithLiteralExpEmptyString"),
                    "string attribute value did not match default value as empty string in literal expression.");

            $A.test.assertEquals("test string", cmp.get("v.stringDefaultWithExpView"),
                    "string attribute value did not match default value in expression with view provider.");
            $A.test.assertEquals("test string bla", cmp.get("v.stringDefaultWithExpression"),
                    "string attribute value did not match default value in expression.");
            $A.test.assertEquals("testing label", cmp.get("v.stringDefaultWithExpGVP"),
                    "string attribute value did not match default value in expression with GVP.");
        }
    },

    testDefaultValueOfDate : {
        test : function(cmp) {
            $A.test.assertFalsy(cmp.get("v.dateDefaultWithNoValue"),
                    "Date attribute without defined default value should have falsy value.");

            // TODO (W-2496936) the attribute values are inconsistent btw given by string and literal expression
            // ignore time portion because it currently depends on the client/server timezone diff
            var dateValue = cmp.get("v.dateDefaultWithString").split("T")[0];
            $A.test.assertEquals("2013-03-06", dateValue,
                    "Date attribute value did not match default value in String.");
            $A.test.assertEquals("2013-03-06", cmp.get("v.dateDefaultWithLiteralExp"),
                    "Date attribute value did not match default value in literal expression.");

            dateValue = cmp.get("v.dateDefaultWithTimeString").split("T")[0];
            $A.test.assertEquals("2013-03-06", dateValue,
                    "Date attribute value did not match default value with time in String.");
            dateValue = cmp.get("v.dateDefaultWithTimeLiteralExp").split("T")[0];
            $A.test.assertEquals("2013-03-06", dateValue,
                    "Date attribute value did not match default value with time in literal expression.");
        }
    },

    testDefaultValueOfDateTime : {
        test : function(cmp) {
            $A.test.assertFalsy(cmp.get("v.dateTimeDefaultWithNoValue"),
                    "Datetime attribute without defined default value should have falsy value.");

            $A.test.assertEquals("1970-01-01T00:00:00.000Z", cmp.get("v.dateTimeDefaultZero"));
            $A.test.assertEquals("1970-01-02T10:17:36.789Z", cmp.get("v.dateTimeDefaultWithString"));
            // TODO (W-2496936)
            //$A.test.assertEquals("1970-01-02T10:17:36.789Z", cmp.get("v.dateTimeDefaultWithLiteralExp"));
        }
    },

    verifyDefaultValueOfBasicNumber : function(testCmp, attributeType) {
        // testing cases basic numbers without fractional part

        var attributeName = this.getDefaultValueTestAttributeName(attributeType, "StringPositiveInt");
        $A.test.assertEquals(123, testCmp.get(attributeName),
                attributeType + " attribute value did not match default value as a positive integer in String.");

        attributeName = this.getDefaultValueTestAttributeName(attributeType, "StringNegativeInt");
        $A.test.assertEquals(-123, testCmp.get(attributeName),
                attributeType + " attribute value did not match default value as a negative integer in String.");

        attributeName = this.getDefaultValueTestAttributeName(attributeType, "LiteralExpPositiveInt");
        $A.test.assertEquals(123, testCmp.get(attributeName),
                attributeType + " attribute value did not match default value as a positive integer in literal expression.");

        attributeName = this.getDefaultValueTestAttributeName(attributeType, "LiteralExpNegativeInt");
        $A.test.assertEquals(-123, testCmp.get(attributeName),
                attributeType + " attribute value did not match default value as a negative integer in literal expression.");
    },

    verifyDefaultValueOfBasicNumberWithFraction : function(testCmp, attributeType) {
        // testing cases basic numbers WITH fractional part

        var attributeName = this.getDefaultValueTestAttributeName(attributeType, "StringPositiveDecimal");
        $A.test.assertEquals(168.34, testCmp.get(attributeName),
                attributeType + " attribute value did not match default value as a positive decimal in String.");

        attributeName = this.getDefaultValueTestAttributeName(attributeType, "StringNegativeDecimal");
        $A.test.assertEquals(-168.34, testCmp.get(attributeName),
                attributeType + " attribute value did not match default value as a negative decimal in String.");

        attributeName = this.getDefaultValueTestAttributeName(attributeType, "LiteralExpPositiveDecimal");
        $A.test.assertEquals(168.34, testCmp.get(attributeName),
                attributeType + " attribute value did not match default value as a positive decimal in literal expression.");

        attributeName = this.getDefaultValueTestAttributeName(attributeType, "LiteralExpNegativeDecimal");
        $A.test.assertEquals(-168.34, testCmp.get(attributeName),
                attributeType + " attribute value did not match default value as a negative decimal in literal expression.");

    },

    verifyDefaultValueOfBasicNumberInExpression : function(testCmp, attributeType) {
        var attributeName = this.getDefaultValueTestAttributeName(attributeType, "ExpView");
        $A.test.assertEquals(123, testCmp.get(attributeName),
                attributeType + " attribute value did not match expected default value given from view value provider.");

        attributeName = this.getDefaultValueTestAttributeName(attributeType, "Expression");
        $A.test.assertEquals(250, testCmp.get(attributeName),
                attributeType + " attribute value did not match expected default value given from expression.");
    },

    verifyDefaultValueOfBasicNumberWithFractionInExpression : function(testCmp, attributeType) {
        var attributeName = this.getDefaultValueTestAttributeName(attributeType, "ExpView");
        $A.test.assertEquals(168.34, testCmp.get(attributeName),
                attributeType + " attribute value did not match expected default value given from view value provider.");

        attributeName = this.getDefaultValueTestAttributeName(attributeType, "Expression");
        $A.test.assertEquals(0.3, testCmp.get(attributeName),
                attributeType + " attribute value did not match expected default value given from expression.");
    },

    getDefaultValueTestAttributeName : function(attributeType, format) {
        return $A.util.format("v.{0}DefaultWith{1}", attributeType, format);
    },

    verifyDefaultValuesOfBasicDataType : function(testCmp) {
        $A.test.assertEquals("Aura", testCmp.get("v.strAttributeWithDefaultValue"),
                "Failed to see default value of String attribute.");
        // The other way of accessing a attribute value.
        $A.test.assertEquals("Aura", testCmp.get("v.strAttributeWithDefaultValue"));
        $A.test.assertFalsy(testCmp.get("v.strAttributeWithNoDefaultValue"),
                "Attributes without default value should have undefined as value");
    }

})
