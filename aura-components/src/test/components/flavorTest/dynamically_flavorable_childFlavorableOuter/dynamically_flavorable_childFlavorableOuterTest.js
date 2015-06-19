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
    /** if the child cmp is also flavorable it should get both class names*/
    testChildFlavorable: {
        test: function(cmp) {
            var target = cmp.find("target");
            var targetEl = target.getElement();

            var expected1 = $A.util.buildFlavorClass(cmp.getSuper(), "default");
            var expected2 = $A.util.buildFlavorClass(cmp, "default");

            $A.test.assertTrue($A.util.hasClass(targetEl, expected1), "element didn't get parent flavor class");
            $A.test.assertTrue($A.util.hasClass(targetEl, expected2), "element didn't get own flavor class");
        }
    }
})
