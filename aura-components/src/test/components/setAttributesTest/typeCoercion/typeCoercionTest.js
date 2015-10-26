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
	
	// Programmatic set
	testSetBodyAsNonArray: {
		test: function(cmp) {
			var body = "text";
			var value;
			
			cmp.set("v.body", body);
			value = cmp.get("v.body");
			
			$A.test.assert($A.util.isArray(value), "Body was of the wrong type, it was of type " + typeof value);
		}
	},

	testProgrammaticCreateFromConfig: {
		test: [
		       function(cmp) {
		           var completed = false;
		           $A.createComponent("setAttributesTest:typeCoercion", { listAttribute: ["list1", "list2"] }, function(newCmp) {
		               var actual = newCmp.get("v.listAttribute");
		               $A.test.assert($A.util.isArray(actual), "listAttribute was not set on the component as an array");
		               completed = true;
		           });
		    	   $A.test.addWaitFor(true, function(){ return completed; });
		       }
		]
	},

	testAttributeSetFromTest: {
		attributes: {
			stringAttribute: "string",
			stringArrayAttribute: ["string1", "string2"],
			listAttribute: ["list1", "list2"]
		},
		test: [
		       function(cmp) {
		    	   var value = cmp.get("v.stringAttribute");
		    	   $A.test.assert($A.util.isString(value), "stringAttribute was not set as a string, it was type " + typeof value);
		       },
		       function(cmp) {
		    	   $A.test.assert($A.util.isArray(cmp.get("v.stringArrayAttribute")), "stringArrayAttribute was not set to an array from the test attributes");
		       },
		       function(cmp){
		    	   $A.test.assert($A.util.isArray(cmp.get("v.listAttribute")), "listAttribute was not set to an array from the test attributes");
		       },
		       function(cmp) {
		    	   $A.test.assertEquals(2, cmp.get("v.listAttribute").length, "listAttribute was not set to an array from the test attributes");
		       }
		]
	},

	testAttributeSetFromTestArrayAttribute: {
		attributes: {
			// This is how it currently works, so we should probably make sure it continues to work
			stringArrayAttribute: "string1, string2",
			listAttribute: "list1, list2"
		},
		test: [
		       function(cmp) {
		    	   $A.test.assert($A.util.isArray(cmp.get("v.stringArrayAttribute")), "stringArrayAttribute was not set to an array from the test attributes");
		       },
		       function(cmp) {
		    	   $A.test.assert($A.util.isArray(cmp.get("v.listAttribute")), "listAttribute was not set to an array from the test attributes");
		       },
		       function(cmp) {
		    	   $A.test.assertEquals(2, cmp.get("v.listAttribute").length, "listAttribute was not set to an array from the test attributes");
		       }
		]
	}
})