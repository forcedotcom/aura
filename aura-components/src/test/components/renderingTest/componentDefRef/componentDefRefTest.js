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
    testRenderComponentDefRefs: {
        test: function(cmp) {
            var button = document.querySelector(".button");
            $A.test.assertNotUndefinedOrNull(button, "Expecting an ui:button gets rendered in DOM");
        }
    },

    testUnrenderComponentFromComponentDefRefArray: {
        test: function(cmp) {
            // remove component to trigger unrender
            cmp.set("v.cmpDefRefsOnFacet", []);

            $A.test.addWaitForWithFailureMessage(true, function() {
                    return document.querySelector(".button") === null;
                },
                "The button component should be unrendered.");
        }
    },

    testRerenderComponentDefRefArray: {
        test: [
            function(cmp) {
                var completed = false;
                $A.createComponent("markup://ui:button",
                    {
                        "label": "newButton",
                        "class": "newButton"
                    },
                    function(newCmp) {
                        var cmps = cmp.get("v.cmpDefRefsOnFacet");
                        cmps.push(newCmp);
                        // add new element to trigger rerender
                        cmp.set("v.cmpDefRefsOnFacet", cmps);
                        completed = true;
                    });

                $A.test.addWaitFor(true, function(){ return completed; } );
            }, function(cmp) {
                var button = document.querySelector(".button");
                $A.test.assertNotUndefinedOrNull(button, "The old element should get rerendered");

                var button = document.querySelector(".newButton");
                $A.test.assertNotUndefinedOrNull(button, "The new element doesn't get rendered");
            }
        ]
    },

    /**
     * Verify unrendering rerendered component from ComponentDefRef array
     */
    testUnrenderRerenderedComponentFromCmpDefRefArray: {
        test: [
            function(cmp) {
                var completed = false;
                $A.createComponent("markup://ui:button",
                    {
                        "label": "newButton",
                        "class": "newButton"
                    },
                    function(newCmp) {
                        var cmps = cmp.get("v.cmpDefRefsOnFacet");
                        cmps.push(newCmp);
                        cmp.set("v.cmpDefRefsOnFacet", cmps);
                        completed = true;
                    });

                $A.test.addWaitFor(true, function(){ return completed; });
            }, function(cmp) {
                var button = document.querySelector(".newButton");
                $A.test.assertNotUndefinedOrNull(button, "[Test Setup Failed] Expecting an ui:button in DOM");

                // remove component to trigger unrender
                cmp.set("v.cmpDefRefsOnFacet", []);

                $A.test.addWaitForWithFailureMessage(true, function() {
                        return document.querySelector(".newButton") === null;
                    },
                    "The added component should be unrendered.");
            }
        ]
    }
})
