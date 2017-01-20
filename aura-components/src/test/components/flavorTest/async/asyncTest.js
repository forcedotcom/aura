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
    browsers: ["-IE7", "-IE8"],

    /** load a component that has a flavor, that isn't in dependencies (and thus not in app.css) */
    testAsyncLoaded: {
        test: function(cmp) {
            var loaded = false;
            var addedCmp;

            // dynamically load a cmp
            $A.createComponent(
                "flavorTest:x_sample", {},
                function(newCmp){
                    addedCmp = newCmp;
                    //Add the new cmp to the body array
                    var body = cmp.get("v.body");
                    body.push(newCmp);
                    cmp.set("v.body", body);
                    loaded = true;
                }
            );

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                var toTest = addedCmp.getElement();

                var expected = $A.util.buildFlavorClass(addedCmp, "default");
                $A.test.assertTrue($A.util.hasClass(toTest, expected));

                var color = $A.util.style.getCSSProperty(toTest, "color");
                expected = color.indexOf("rgb") > -1 ? "rgb(119, 119, 119)" :"#777";
                $A.test.assertEquals(expected, $A.util.style.getCSSProperty(toTest, "color"));
            });
        }
    },

    /** load a component async with a super component that has a flavor */
    testAsyncLoadedParent: {
        test: function(cmp) {
            var loaded = false;
            var addedCmp;

            // dynamically load a cmp
            $A.createComponent(
                "flavorTest:async_x_wrapper_child", {},
                function(newCmp){
                    addedCmp = newCmp;
                    //Add the new cmp to the body array
                    var body = cmp.get("v.body");
                    body.push(newCmp);
                    cmp.set("v.body", body);
                    loaded = true;
                }
            );

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                var superCmp = addedCmp.getSuper();
                var toTest = superCmp.getElement();

                var expected = $A.util.buildFlavorClass(superCmp, "default");
                $A.test.assertTrue($A.util.hasClass(toTest, expected));

                var color = $A.util.style.getCSSProperty(toTest, "color");
                expected = color.indexOf("rgb") > -1 ? "rgb(255, 0, 0)" :"red";
                $A.test.assertEquals(expected, $A.util.style.getCSSProperty(toTest, "color"));
            });
        }
    }
})
