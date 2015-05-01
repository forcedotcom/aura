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
    testStandard: {
        test: function(cmp) {
            var standard = cmp.find("standard");
            var el = standard.getElement();
            var expected = $A.util.buildFlavorClass(standard, "info");
            $A.test.assertTrue($A.util.hasClass(el, expected));
        }
    },

    testNested: {
        test: function(cmp)  {
            var nested = cmp.find("nested");
            var el = nested.getElement().firstChild;
            var expected = $A.util.buildFlavorClass(nested, "neutral");
            $A.test.assertTrue($A.util.hasClass(el, expected));
        }
    },

    testSuperNested: {
        test: function(cmp)  {
            var superNested = cmp.find("superNested");
            var el = superNested.getElement();
            var expected = $A.util.buildFlavorClass(superNested, "default");
            $A.test.assertTrue($A.util.hasClass(el, expected));

            var superNestedChild = cmp.find("superNestedChild");
            var el = superNestedChild.getElement().firstChild;
            var expected = $A.util.buildFlavorClass(superNestedChild, "neutral");
            $A.test.assertTrue($A.util.hasClass(el, expected));
        }
    }
})
