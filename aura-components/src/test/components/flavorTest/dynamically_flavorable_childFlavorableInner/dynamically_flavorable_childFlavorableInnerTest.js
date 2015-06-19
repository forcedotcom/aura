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
    /** if the child cmp has a flavorable element inside of another element, the outside one gets the parent flavor and the inner one gets the cmps flavor */
    testChildFlavorable: {
        test: function(cmp) {
            var outer = cmp.find("outer");
            var outerEl = outer.getElement();
            var inner = cmp.find("inner");
            var innerEl = inner.getElement();

            var expectedOuter = $A.util.buildFlavorClass(cmp.getSuper(), "default");
            var expectedInner = $A.util.buildFlavorClass(cmp, "default");

            $A.test.assertTrue($A.util.hasClass(outerEl, expectedOuter));
            $A.test.assertFalse($A.util.hasClass(outerEl, expectedInner));
            $A.test.assertTrue($A.util.hasClass(innerEl, expectedInner));
            $A.test.assertFalse($A.util.hasClass(innerEl, expectedOuter));
        }
    }
})
