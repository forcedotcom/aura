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
     * Verify class attribute for DOM elements created using hierarchy.
     * Create a chain of components by hierarchy and verify the order of selectors(Style Defs)
     * @throws Exception
     */
	testVerifyClassNameOrder:{
		test: function(cmp){
			var child = cmp.find("child");
			$A.test.assertEquals("auratestTest_css_grandParent auratestTest_css_parent auratestTest_css_child", child.getElement()["className"],
					"Unexpected CSS selector: Expected class attribute to have all components in the hierarchy");
			
			var parent = cmp.getSuper().find("parent");
			$A.test.assertEquals("auratestTest_css_grandParent auratestTest_css_parent auratestTest_css_child", parent.getElement()["className"],
					"Unexpected CSS selector: parent included in child's body should have same selector as root elements");
			
			var grandParent = cmp.getSuper().getSuper().find("grandParent");
			$A.test.assertEquals("auratestTest_css_grandParent auratestTest_css_parent auratestTest_css_child", grandParent.getElement()["className"],
					"Unexpected CSS selector: grandParent included in child's body should have same selector as root elements");

		}
	}	
})