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
    /** test an included component with a flavorable element on the top level */
    testOuter: {
        test: function(cmp) {
            var outer = cmp.find("outer");
            var el = outer.getElement();
            var expected = $A.util.buildFlavorClass(outer, "flavorA");
            $A.test.assertTrue($A.util.hasClass(el, expected));
        }
    },

    /** test an included component with a flavorable element nested (inner level) */
    testNested: {
        test: function(cmp)  {
            var nested = cmp.find("inner");
            var parent = nested.getElement();
            var child = parent.firstChild;

            var expected = $A.util.buildFlavorClass(nested, "flavorB");
            $A.test.assertFalse($A.util.hasClass(parent, expected));
            $A.test.assertTrue($A.util.hasClass(child, expected));
        }
    },

    /** test an included component with a flavorable element nested even further */
    testSuperNested: {
        test: function(cmp)  {
            // the outer div should have a flavor
            var parentCmp = cmp.find("superInnerParentCmp");
            var el = parentCmp.getElement();
            var expected = $A.util.buildFlavorClass(parentCmp, "flavorC");
            $A.test.assertTrue($A.util.hasClass(el, expected));

            // the wrapper div passed to v.body should not have a flavor
            var wrapperDiv = cmp.find("superInnerWrapperDiv").getElement();
            $A.test.assertFalse($A.util.hasClass(wrapperDiv, expected));
            $A.test.assertEquals("wrapper", wrapperDiv.className);

            // the sampleNested cmp inside of the wrapper div should have flavor
            // on it's inner div
            var nestedCmp = cmp.find("superInner");
            var nestedParent = nestedCmp.getElement();
            var nestedChild = nestedParent.firstChild;

            expected = $A.util.buildFlavorClass(nestedCmp, "flavorA");
            $A.test.assertFalse($A.util.hasClass(nestedParent, expected));
            $A.test.assertTrue($A.util.hasClass(nestedChild, expected));
        }
    }
})
