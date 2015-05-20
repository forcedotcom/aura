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
    /**
     * disable the test for W-2601852
     *
     * Basically the link element (hashLink) is registered with two handlers for
     * click event (click handler and hash handler), but firing order of the
     * handlers is inconsistent. This prevents defining location change (hash) handler
     * that has dependency with a variable which will be changed in click handler.
     *
     * The test fails when location change handler fires first. This test may be flapping.
     */
    _testOneEventWithMultipleHandlerFiringOrder : {
        test: [
            function(cmp){
                var results = [];
                $A.test.assertEquals("locationChange", cmp.get("v.order"));
                cmp.set("v.order", "");

                var urlElement = cmp.find('hashLink').getElement();

                // click multiple time to assure the order is consistent
                for (var i = 5; i >= 0; i--) {
                    $A.test.clickOrTouch(urlElement);
                    results.push(cmp.get("v.order"));
                    cmp.set("v.order", "");
                    // Use this assertion if we want to have click handler fire first
                    //$A.test.assertEquals("click;locationChange", handlerOrder);
                };

                cmp.set("v.results", results);
                // hide twice
                $A.test.assertEquals(5, cmp.get("v.locationChangeCount"));
                $A.test.assertEquals(6, cmp.get("v.clickCount"));
            }
        ]
    }

})
