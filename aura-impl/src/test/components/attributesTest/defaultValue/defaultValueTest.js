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
			$A.test.assertEquals('Aura', cmp.get("v.strAttributeWithDefaultValue"));
			$A.test.assertUndefined(cmp.get("v.StrAttributeWithDefaultValue"));
			$A.test.assertUndefined(cmp.get("v.strATTRIBUTEWithDefaultValue"));
			$A.test.assertUndefined(cmp.get("v.strATTRIBUTEWithNODefaultValue"));
		}
	},

	/**
	 * Verify that a locally created component has the same set of default attribute values. In this case the component
	 * being creates already has its def at the client.
	 */
	testNewComponentChangingDefaultValues : {
		test : function(cmp) {
			$A.newCmpAsync(
					this,
					function (newComp) {
        				this.verifyChangingAttributeValues(newComp);
					},
					"markup://attributesTest:defaultValue"
			);

		}
	},

	testNewComponentDefaultValueBasicDataTypes: {
		test: function(cmp) {
			$A.newCmpAsync(
					this,
					function (newComp) {
        				this.verifyDefaultValuesOfBasicDataType(newComp);
					},
					"markup://attributesTest:defaultValue"
			);
		}
	},

	testNewComponentDefaultValueObjectDataType: {
		test: function(cmp) {
			$A.newCmpAsync(
					this,
					function (newComp) {
        				this.verifyDefaultValuesOfObjectDataType(newComp);
					},
					"markup://attributesTest:defaultValue"
			);
		}
	},

	testNewComponentDefaultValueListDataType: {
		test: function(cmp) {
			$A.newCmpAsync(
					this,
					function (newComp) {
        				this.verifyDefaultValuesOfListDataType(newComp);
					},
					"markup://attributesTest:defaultValue"
			);
		}
	},

	testNewComponentDefaultValueMapDataType: {
		test: function(cmp) {
			$A.newCmpAsync(
					this,
					function (newComp) {
        				this.verifyDefaultValuesOfMapDataType(newComp);
					},
					"markup://attributesTest:defaultValue"
			);
		}
	},

	testDefaultValueComponentArrayIsArrayOfComponents: {
		test: function(cmp) {
			var cmpValue = cmp.get("v.componentDefault");
			$A.test.assertEquals("Component", cmpValue[0].auraType);
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

			// KRIS: If this is failing it's possibly because the Array of Components has not been converted to components, but instead
			// is still component configs.
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
		$A.test.assertEquals("Saturday Night Live", testCmp.get("v.strAttributeWithNoDefaultValue")
				, "Failed to change value of attribute.");

		testCmp.set("v.objAttributeWithDefaultValue", "['white','black']")
		$A.test.assertEquals("['white','black']", testCmp.get("v.objAttributeWithDefaultValue"),
				"Failed to change value of attribute.");

		//TODO W-2248588
//		testCmp.set("v.fooBar", "Jacked")
//		$A.test.assertFalsy(testCmp.get("v.fooBar"),
//				"Should not be able to create and set values for unidentified attributes.");
	}
})
