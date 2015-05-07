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
    testFlavorAppOverrideFromDefault: {
        test: function(cmp) {
            var c, el, expected;
            c = cmp.find("c1");
            el = c.getElement();
            expected = $A.util.buildFlavorClass(c, "testAlt");
            $A.test.assertTrue($A.util.hasClass(el, expected));

            // it doesn't have a matching flavor with testAlt so it should keep the original
            c = cmp.find("c2");
            el = c.getElement();
            expected = $A.util.buildFlavorClass(c, "default");
            $A.test.assertTrue($A.util.hasClass(el, expected));


            c = cmp.find("c3");
            el = c.getElement().firstChild;
            expected = $A.util.buildFlavorClass(c, "neutral");
            $A.test.assertTrue($A.util.hasClass(el, expected));
        }
    }
})
