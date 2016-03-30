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
    one: false,
    two: false,

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
                    console.log(loaded);
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
                this.one = false;
                var that = this;
                $A.createComponent(this.CMP_PROVIDER,
                    {
                        qualifiedName: this.CMP_UNTRACKED
                    },
                    function () {
                        that.one = true;
                    }
                );
            },
            function() {
                this.two = false;
                var that = this;
                $A.createComponent(this.CMP_PROVIDER,
                    {
                        qualifiedName: this.CMP_UNTRACKED
                    },
                    function () {
                        that.two = true;
                    }
                );
            },
            function() {
                var expected = 2;
                var that = this;
                $A.test.addWaitFor(true,
                    function() {
                        return that.one && that.two;
                    },
                    function() {
                        var actual = that.count;
                        $A.test.assertEquals(expected, actual, "Untracked components sould be retreived in every request.");
                    }
                );
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
                this.one = false;
                var that = this;
                $A.createComponent(this.CMP_PROVIDER,
                    {
                        qualifiedName: this.CMP_TRACKED
                    },
                    function () {
                        that.one = true;
                    }
                );
            },
            function() {
                this.two = false;
                var that = this;
                $A.createComponent(this.CMP_PROVIDER,
                    {
                        qualifiedName: this.CMP_TRACKED
                    },
                    function () {
                        that.two = true;
                    }
                );
            },
            function() {
                var expected = 1;
                var that = this;
                $A.test.addWaitFor(true,
                    function() {
                        return that.one && that.two;
                    },
                    function() {
                        var actual = that.count;
                        $A.test.assertEquals(expected, actual, "Tracked components sould be retreived only once.");
                    }
                );
            }
        ]
    }
})