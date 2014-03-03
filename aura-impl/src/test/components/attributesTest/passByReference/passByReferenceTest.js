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
		testPassingValueByReference:{
			test: function(cmp){
				$A.test.assertEquals(2007, cmp.get("v.attrByReference"));
				$A.test.assertEquals(2007, cmp.find("innerCmp").get("v.intAttribute"));
				$A.test.assertEquals("2007", $A.test.getTextByComponent(cmp));
			}
		},
		testSettingValueInInnerComponent:{
			test: function(cmp){
				cmp.find("innerCmp").getValue("v.intAttribute").setValue(5565);
				$A.test.assertEquals(5565, cmp.get("v.attrByReference"));
				$A.test.assertEquals(5565, cmp.find("innerCmp").get("v.intAttribute"));
			}
		},
		testSettingValueOnParentComponent:{
			test: function(cmp){
				cmp.getValue("v.attrByReference").setValue(9999);
				$A.test.assertEquals(9999, cmp.get("v.attrByReference"));
				$A.test.assertEquals(9999, cmp.find("innerCmp").get("v.intAttribute"));
			}
		}
})
