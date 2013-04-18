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
     * Test case that verifies features that this component has to support universal usage (Accessibility)
     */
    testUniversalDesignFeatures:{
        test:function(cmp){
            var ulElement = cmp.find('ul').getElement();
            aura.test.assertNotNull(ulElement, "Could not locate UL element in tabset.");
            aura.test.assertTrue(ulElement.tagName.toLowerCase() === "ul", "A tabset should be displayed in UL element because a ordered list is not guaranteed.");
        }
    },
    /**
     * Test case that verifies the role attribute is correctly set (Accessibility)
     */
    testRole:{
        test:function(cmp){
            var div = cmp.find("div");
            aura.test.assertNotNull(div);
            aura.test.assertEquals("tablist", div.getElement().getAttribute("role"), "A tablist role should be set on div element.");
        }
    }
})
