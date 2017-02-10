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
	_testIterationInFacetSet: {
		test: function(cmp) {
			var expected = "[setFacet3_Facet][setFacet1.0_Facet][/setFacet3_Facet][setFacet3_Facet][setFacet1.1_Facet][/setFacet3_Facet][setFacet3_Facet][setFacet1.2_Facet][/setFacet3_Facet]";

			var actual = $A.test.getText(cmp.find("setFacet3_Facet_Output").getElement());

			$A.test.assertEquals(expected, actual);
		}
	},
	_testIterationInDefRefSet: {
		test: function(cmp) {
			var expected = "[setFacet3_DefRef][setFacet1.0_Facet][/setFacet3_DefRef][setFacet3_DefRef][setFacet1.1_Facet][/setFacet3_DefRef][setFacet3_DefRef][setFacet1.2_Facet][/setFacet3_DefRef]";

			var actual = $A.test.getText(cmp.find("setFacet3_DefRef_Output").getElement());

			$A.test.assertEquals(expected, actual);
		}
	}
})