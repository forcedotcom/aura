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
    /** the top level element in the child component should get the flavor class name of the base component */
    testFlavorableTag: {
        test: function(cmp) {
            var target = cmp.find("target");
            var inner = cmp.find("inner");

            var targetEl = target.getElement();
            var innerEl = inner.getElement();

            var expected = $A.util.buildFlavorClass(cmp.getSuper(), "default");

            $A.test.assertTrue($A.util.hasClass(targetEl, expected), "outer element didn't get flavor class");
            $A.test.assertFalse($A.util.hasClass(innerEl, expected), "inner element shouldn't get flavor class");
        }
    }
})
