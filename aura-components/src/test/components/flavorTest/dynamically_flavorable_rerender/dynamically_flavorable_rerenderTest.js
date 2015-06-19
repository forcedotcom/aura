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
    /** tests rerendering and expressions on class name */
    testRerender: {
        test: [function(cmp) {
            var target = cmp.find("target").getElement();
            var flavorClass = $A.util.buildFlavorClass(cmp.getSuper(), "default");

            $A.test.assertTrue($A.util.hasClass(target, "count_0"), "expected target to have counter class");
            $A.test.assertTrue($A.util.hasClass(target, flavorClass), "expected target to have flavor class");
            $A.test.assertFalse($A.util.hasClass(cmp.find("span").getElement(), flavorClass), "didn't expect span to have flavor class");
            $A.test.assertFalse($A.util.hasClass(cmp.find("btn").getElement(), flavorClass), "didn't expect btn to have flavor class");

            $A.test.clickOrTouch(cmp.find("btn").getElement());
        }, function(cmp) {
            var target = cmp.find("target").getElement();
            var flavorClass = $A.util.buildFlavorClass(cmp.getSuper(), "default");

            $A.test.assertTrue($A.util.hasClass(target, "count_1"), "expected target counter class to increase number when clicked");
            $A.test.assertTrue($A.util.hasClass(target, flavorClass), "expected target to still have flavor class");
            $A.test.assertFalse($A.util.hasClass(cmp.find("span").getElement(), flavorClass), "didn't expect span to have flavor class after rerender");
            $A.test.assertFalse($A.util.hasClass(cmp.find("btn").getElement(), flavorClass), "didn't expect span to have flavor class after rerender");
        }]
    }
})
