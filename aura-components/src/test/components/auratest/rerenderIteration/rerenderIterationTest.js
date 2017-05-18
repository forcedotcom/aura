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
    testAddRemoveIteration: {
        "attributes": {
            items: [1, 2]
        },
        "test": function(cmp) {
            var ul = cmp.find("list").getElement();
            var iteration = cmp.find("iteration");
            var addButton = cmp.find("add");
            var removeButton = cmp.find("remove");

            var doneRenderingCount = 0;
            iteration.addEventHandler("aura:doneRendering", function(event) {
                doneRenderingCount++;
            });

            cmp.removeItem();

            $A.test.addWaitFor(1, function() {
                return doneRenderingCount;
            }, function() {
                cmp.addItem();
            });

            // Wait for the previously added item to redraw.
            $A.test.addWaitFor(4, function() {
                return ul.getElementsByTagName("li").length;
            });
        }
    }
})

