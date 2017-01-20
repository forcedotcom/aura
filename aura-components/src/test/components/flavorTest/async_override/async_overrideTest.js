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
    _testAsyncOverride: {
        test: function(cmp) {
            // test that the css is not included in app.css initially

            // flavor css should get added along with component
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


            });
        }
    }
})
