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
    CMP_PROVIDER: "dependencyTest:cmpProvider",
    CMP_TRACKED: "dependencyTest:cmpTracked",
    CMP_UNTRACKED: "dependencyTest:cmpUntracked",

    count: 0,

    testTrackedDependencyNotOnContext:{
        test: function() {
            var expected = "COMPONENT@markup://" + this.CMP_TRACKED;

            var loaded = $A.getContext().getLoaded();
            $A.test.assertUndefinedOrNull(loaded[expected], "Tracked component should not be on initial context.loaded.");
        }
    },
    testTrackedDependencyAddedToContext:{
        test: function() {
            var expected = "COMPONENT@markup://" + this.CMP_TRACKED;

            $A.createComponent(this.CMP_PROVIDER,
                {
                    qualifiedName: this.CMP_TRACKED
                },
                function () {
                    var loaded = $A.getContext().getLoaded();
                    $A.test.assertNotUndefinedOrNull(loaded[expected], "Tracked component should be added to context.loaded.");
                }
            );
        }
    },
    testUntrackedDependencyNotAddedToContext:{
        test: function() {
            var expected = "COMPONENT@markup://" + this.CMP_UNTRACKED;

            $A.createComponent(this.CMP_PROVIDER,
                {
                    qualifiedName: this.CMP_UNTRACKED
                },
                function () {
                    var loaded = $A.getContext().getLoaded();
                    $A.test.assertUndefinedOrNull(loaded[expected], "Untracked component should not be added to context.loaded.");
                }
            );
        }
    },
    testUntrackedDependencyAddedTwice:{
        test: [
            function() {
                this.count = 0;
                var that = this;
                var override = $A.test.addFunctionHandler($A.getContext(), "merge", function(context) {
                    var componentDefs = context["componentDefs"];
                    for (var i = 0; i < componentDefs.length; i++) {
                        var componentDef = componentDefs[i];
                        var descriptor = componentDef["descriptor"];
                        if (descriptor === "markup://" + that.CMP_UNTRACKED) {
                            that.count++;
                        }
                    }
                });
                $A.test.addCleanup(function() { override.restore(); });
            },
            function() {
                var that = this;
                var completed = false;
                $A.createComponent(this.CMP_PROVIDER,
                    {
                        qualifiedName: this.CMP_UNTRACKED
                    },
                    function () {
                        completed = true;
                    }
                );
                $A.test.addWaitFor(true, function() {
                    return completed;
                });
            },
            function() {
                var that = this;
                var completed = false;
                $A.createComponent(this.CMP_PROVIDER,
                    {
                        qualifiedName: this.CMP_UNTRACKED
                    },
                    function () {
                        completed = true;
                    }
                );
                $A.test.addWaitFor(true, function() {
                    return completed;
                });
            },
            function() {
                $A.test.assertEquals(2, this.count, "Untracked components sould be retreived in every request.");
            }
        ]
    },
    testTrackedDependencyAddedOnce:{
        test: [
            function() {
                this.count = 0;
                var that = this;
                var override = $A.test.addFunctionHandler($A.getContext(), "merge", function(context) {
                    var componentDefs = context["componentDefs"];
                    for (var i = 0; i < componentDefs.length; i++) {
                        var componentDef = componentDefs[i];
                        var descriptor = componentDef["descriptor"];
                        if (descriptor === "markup://" + that.CMP_TRACKED) {
                            that.count++;
                        }
                    }
                });
                $A.test.addCleanup(function() { override.restore(); });
            },
            function() {
                var that = this;
                var completed = false;
                $A.createComponent(this.CMP_PROVIDER,
                    {
                        qualifiedName: this.CMP_TRACKED
                    },
                    function () {
                        completed = true;
                    }
                );
                $A.test.addWaitFor(true, function() {
                    return completed;
                });
            },
            function() {
                var that = this;
                var completed = false;
                $A.createComponent(this.CMP_PROVIDER,
                    {
                        qualifiedName: this.CMP_TRACKED
                    },
                    function () {
                        completed = true;
                    }
                );
                $A.test.addWaitFor(true, function() {
                    return completed;
                });
            },
            function() {
                $A.test.assertEquals(1, this.count, "Tracked components sould be retreived only once.");
            }
        ]
    }
})
