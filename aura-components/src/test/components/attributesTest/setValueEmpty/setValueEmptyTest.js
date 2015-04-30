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
	testAllAreBlank: {
		test: function(cmp) {
			$A.test.assertEquals(0, cmp.get("v.componentDefault").length);
			$A.test.assertEquals("{}", JSON.stringify(cmp.get("v.mapAttributeWithDefaultValue")));
			$A.test.assertEquals("", cmp.get("v.objAttributeWithDefaultValue"));
			$A.test.assertEquals("[]", JSON.stringify(cmp.get("v.listAttributeWithDefaultValue")));
			$A.test.assertEquals("[]", JSON.stringify(cmp.get("v.arrayAttributeWithDefaultValue")));
			$A.test.assertEquals(undefined, cmp.get("v.longDefaultWithStringPositiveInt"));
			$A.test.assertEquals(undefined, cmp.get("v.integerDefaultWithStringPositiveInt"));
			$A.test.assertEquals(undefined, cmp.get("v.doubleDefaultWithStringPositiveInt"));
			$A.test.assertEquals(undefined, cmp.get("v.decimalDefaultWithStringPositiveInt"));
			$A.test.assertEquals(undefined, cmp.get("v.dateTimeDefaultWithString"));
			$A.test.assertEquals(undefined, cmp.get("v.dateDefaultWithString"));
			$A.test.assertEquals("", cmp.get("v.stringDefaultWithString"));
			$A.test.assertEquals(false, cmp.get("v.booleanDefaultWithStringFalse"));
		}
	}

})