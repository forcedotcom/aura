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
    testRerender: {
        test: [function(cmp) {
            var parent = cmp.find("parent").getElement();
            var child = cmp.find("child").getElement();
            var flavorClass = $A.util.buildFlavorClass(cmp, "default");

            $A.test.assertTrue($A.util.hasClass(parent, "parent_0"), "expected parent to have counter class");
            $A.test.assertTrue($A.util.hasClass(parent, flavorClass), "expected parent to have flavor class");
            $A.test.assertFalse($A.util.hasClass(child, flavorClass), "didn't expect child to have flavor class");

            $A.test.clickOrTouch(parent);
        }, function(cmp) {
            var parent = cmp.find("parent").getElement();
            var child = cmp.find("child").getElement();
            var flavorClass = $A.util.buildFlavorClass(cmp, "default");

            $A.test.assertTrue($A.util.hasClass(parent, "parent_1"), "expected parent counter class to increase number when clicked");
            $A.test.assertTrue($A.util.hasClass(parent, flavorClass), "expected parent to still have flavor class");
            $A.test.assertFalse($A.util.hasClass(child, flavorClass), "didn't expect child to have flavor class after rerender");
            $A.test.clickOrTouch(parent);
        }, function(cmp) {
            var parent = cmp.find("parent").getElement();
            var child = cmp.find("child").getElement();
            var flavorClass = $A.util.buildFlavorClass(cmp, "default");

            $A.test.assertTrue($A.util.hasClass(parent, "parent_2"), "expected parent counter class to increase number when clicked");
            $A.test.assertTrue($A.util.hasClass(parent, flavorClass), "expected parent to still have flavor class");
            $A.test.assertFalse($A.util.hasClass(child, flavorClass), "didn't expect child to have flavor class after rerender");
        }]
    }
})