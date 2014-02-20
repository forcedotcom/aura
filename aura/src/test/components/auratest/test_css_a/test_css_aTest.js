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
	/**
     * Verify class attribute for DOM elements created using facets.
     * Create a chain of components as facet and verify the order of selectors(Style Defs)
     * @throws Exception
     */
	testVerifyClassNameOrder:{
		test: function(cmp){
			var b = cmp.find("b");
			$A.test.assertEquals("auratestTest_css_d auratestTest_css_c auratestTest_css_b auratestTest_css_a", b.getElement()["className"],
					"Unexpected CSS selector: Expected class attribute to have all components in the hierarchy");
			
			var c = cmp.find("c");
			$A.test.assertEquals("auratestTest_css_d auratestTest_css_c auratestTest_css_a", c.getElement()["className"],
					"Unexpected CSS selector: Expected root component name, auratestTest_css_c and its facet");
		}
	}
})