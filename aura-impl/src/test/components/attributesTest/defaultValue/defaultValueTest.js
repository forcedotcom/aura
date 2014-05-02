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
	testBasicDataTypeAndDefaultValue : {
		test : function(cmp) {
			this.verifyDefaultValuesOfBasicDataType(cmp);
		}
	},

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

	testCaseSensitivity : {
		test : function(cmp) {
			$A.test.assertEquals("Aura", cmp.get("v.strATTRIBUTEWithDefaultValue"));
			$A.test.assertFalsy(cmp.get("v.strATTRIBUTEWithNODefaultValue"));
		}
	},

	testDefaultValueOfNonExistingAttribute : {
		test : function(cmp) {
			$A.test.assertFalsy(cmp.get("v.fooBar"),
					"Should not be able to read non existing attributes.");
			try {
				$A.test.assertFalsy(cmp.getAttributes().getValue(undefined));
				$A.test.fail("Should not be able to use undefined in getValue()");
			} catch (e) {
				$A.test.assertEquals("Assertion Failed!: Key is required for getValue on MapValue : undefined",
						e.message)
			}
			try {
				$A.test.assertFalsy(cmp.getAttributes().getValue(null));
				$A.test.fail("Should not be able to use null in getValue()");
			} catch (e) {
				$A.test.assertEquals("Assertion Failed!: Key is required for getValue on MapValue : null", e.message)
			}
			try {
				$A.test.assertFalsy(cmp.getAttributes().getValue());
				$A.test.fail("Should not be able to use null in getValue()");
			} catch (e) {
				$A.test.assertEquals("Assertion Failed!: Key is required for getValue on MapValue : undefined",
						e.message)
			}
		}
	},

	/**
	 * Verify that a locally created component has the same set of default attribute values. In this case the component
	 * being creates already has its def at the client.
	 */
	testDefaultValueOfNewLocalComponentWithDefAtClient : {
		test : function(cmp) {
			$A.newCmpAsync(
					this,
					function (newComp) {
        				this.verifyDefaultValuesOfBasicDataType(newComp);
        				this.verifyDefaultValuesOfObjectDataType(newComp);
        				// W-1324216
        				// this.verifyDefaultValuesOfListDataType(newComp);
        				this.verifyChangingAttributeValues(newComp);
                        this.verifyDefaultValuesOfMapDataType(newComp);
					},
					"markup://attributesTest:defaultValue",
					null, null, null
			);

		}
	},

	testChangingAttributesWithDefalutValue : {
		test : function(cmp) {
			this.verifyChangingAttributeValues(cmp);
		}
	},

	testDefaultValueType : {
		test : function(cmp) {
			$A.test.assertEquals(true, cmp.get("v.booleanDefault"));
			$A.test.assertEquals(23, cmp.get("v.longDefault"));
			// ignore time portion because it currently depends on the client/server timezone diff
			var dateValue = cmp.get("v.dateDefault").split("T")[0];
			$A.test.assertEquals("2013-03-06", dateValue);
			$A.test.assertEquals("1970-01-02T10:17:36.789Z", cmp.get("v.dateTimeDefault"));
			var cmpValue = cmp.get("v.componentDefault");
			$A.test.assertTrue($A.util.isArray(cmpValue));
			$A.test.assertEquals(1, cmpValue.length);
			$A.test.assertEquals("markup://aura:text", cmpValue[0].getDef().getDescriptor().toString());
		}
	},

	verifyDefaultValuesOfBasicDataType : function(testCmp) {
		$A.test.assertEquals("Aura", testCmp.get("v.strAttributeWithDefaultValue"),
				"Failed to see default value of String attribute.");
		// The other way of accessing a attribute value.
		$A.test.assertEquals("Aura", testCmp.get("v.strAttributeWithDefaultValue"));
		$A.test.assertFalsy(testCmp.get("v.strAttributeWithNoDefaultValue"),
				"Attributes without default value should have undefined as value");
	},

	verifyDefaultValuesOfObjectDataType : function(testCmp) {
		$A.test.assertEquals("['red','green','blue']", testCmp.get("v.objAttributeWithDefaultValue"),
				"Failed to see default value of object attribute.");
		$A.test.assertEquals("['red','green','blue']", testCmp.getValue("v.objAttributeWithDefaultValue")
				.getValue());
		$A.test.assertFalsy(testCmp.get("v.objAttributeWithNoDefaultValue"),
				"Attributes without default value should have undefined as value");
	},

	verifyDefaultValuesOfListDataType : function(testCmp) {
		var listAttr = testCmp.getValue("v.listAttributeWithDefaultValue");
		$A.test.assertTrue(listAttr.toString() === "ArrayValue",
				"Expected to find attribute of ArrayValue type but found" + listAttr.toString());
		$A.test.assertEquals("Value", listAttr.auraType);
		$A.test.assertEquals("true", listAttr.getValue(0).getValue());
		$A.test.assertEquals("false", listAttr.getValue(1).getValue());
		$A.test.assertEquals("true", listAttr.getValue(2).getValue());

		var a = testCmp.getValue("v.listAttributeWithNoDefaultValue");
        $A.test.assertTrue(a.isUnset());
        $A.test.assertTrue(a.toString() === "ArrayValue");
        $A.test.assertEquals(0, a.getLength());
        a = testCmp.get("v.listAttributeWithNoDefaultValue");
        $A.test.assertTrue($A.util.isArray(a));
		$A.test.assertEquals(0, a.length, "Array type attributes without default value should have empty as value");

	},

	verifyDefaultValuesOfMapDataType : function(testCmp) {
		var mapAttr = testCmp.getValue("v.mapAttributeWithDefaultValue");
		$A.test.assertTrue(mapAttr.toString() === "MapValue",
				"Expected to find attribute of MapValue type but found" + mapAttr.toString());
		$A.test.assertEquals("Value", mapAttr.auraType);
		$A.test.assertEquals(1, mapAttr.get("a"));

		var a = testCmp.getValue("v.mapAttributeWithNoDefaultValue");
		$A.test.assertTrue(a.toString() === "MapValue", "Expected no-default map to be a MapValue, not " + a.toString());
		$A.test.assertTrue(a.isUnset());
		$A.test.assertEquals(undefined, a.get("a"));
	},

	verifyChangingAttributeValues : function(testCmp) {
		testCmp.set("v.strAttributeWithDefaultValue", "nemuL");
		$A.test.assertEquals("nemuL", testCmp.get("v.strAttributeWithDefaultValue"),
				"Failed to change value of attribute.");

		testCmp.set("v.strAttributeWithNoDefaultValue", "Saturday Night Live");
		$A.test.assertEquals("Saturday Night Live", testCmp.getValue("v.strAttributeWithNoDefaultValue")
				.getValue(), "Failed to change value of attribute.");

		testCmp.set("v.objAttributeWithDefaultValue", "['white','black']")
		$A.test.assertEquals("['white','black']", testCmp.get("v.objAttributeWithDefaultValue"),
				"Failed to change value of attribute.");

		testCmp.set("v.fooBar", "Jacked")
		$A.test.assertFalsy(testCmp.get("v.fooBar"),
				"Should not be able to create and set values for unidentified attributes.");
	}
})
