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
	_testSetting_setFacet1_String: {
		test: function(cmp) {
			var expected = "[setFacet1_String]";

			var actual = cmp.get("v.setFacet1_String");

			$A.test.assertEquals(expected, actual);
		}
	},
	
	_testSetting_setFacet1_Facet: {
		test: function(cmp) {
			var expected = "[setFacet1_Facet][setFacet1_String][/setFacet1_Facet]";

			var actual = $A.test.getText(cmp.find("setFacet1_Facet_Output").getElement()).trim();

			$A.test.assertEquals(expected, actual);
		}
	},
	
	_testSetting_setFacet1_DefRef: {
		test: function(cmp) {
			var expected = "[setFacet1_DefRef][setFacet1_String][/setFacet1_DefRef]";

			var actual = $A.test.getText(cmp.find("setFacet1_DefRef_Output").getElement()).trim();

			$A.test.assertEquals(expected, actual);
		}
	},
	
	_testSetting_setFacet1_DefaultFacet: {
		test: function(cmp) {
			var expected = "[setFacet1_DefaultFacet][setFacet1_DefaultString][/setFacet1_DefaultFacet]";

			var actual = $A.test.getText(cmp.find("setFacet1_DefaultFacet_Output").getElement()).trim();

			$A.test.assertEquals(expected, actual);
		}
	},
	
	_testSetting_setFacet1_DefaultDefRef: {
		test: function(cmp) {
			var expected = "[setFacet1_DefaultDefRef][setFacet1_DefaultString][/setFacet1_DefaultDefRef]";

			var actual = $A.test.getText(cmp.find("setFacet1_DefaultDefRef_Output").getElement()).trim();

			$A.test.assertEquals(expected, actual);
		}
	}
})