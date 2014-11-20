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
    // setup a buffer on the server and save it's ID for future actions
    initAndRun : function(component, test) {
        var a = component.get("c.getBuffer");
        a.setCallback(this, function(action) {
            component.testId = action.getReturnValue();
            test.call(this); // do the actual test now
        });
        $A.test.callServerAction(a);
    },

    // create an Action that uses the cmp's server ID, which will append to "results"
    getTestAction : function(component, echoString, abortable, delay) {
        var a = component.get("c.appendBuffer");
        a.setParams({
            "id" : component.testId,
            "delayMs" : delay || 0,
            "append" : echoString
        });
        a.setCallback(component, function(action) {
            $A.renderingService.render(action.getReturnValue(), component.find("results").getElement());
        });
        if (abortable) {
            a.setAbortable(abortable);
        }
        return a;
    },

    runOneSet : function(actions, component, callback) {
        $A.run(function() { $A.clientService.runActions(actions, component, callback); });
    },

    // run the given groups of actions and wait for all their responses before continuing
    waitForActions : function(component, actionGroups, callback) {
        var testCounter = actionGroups.length;
        var decrement = function() { testCounter -= 1; };
        var that = this;
        $A.test.runAfterIf(function() {
                return testCounter === 0;
            }, callback);

        setTimeout(function() {
            $A.test.blockRequests();
            for ( var i = 0; i < actionGroups.length; i++) {
                that.runOneSet(actionGroups[i], component, decrement);
            }
            $A.test.releaseRequests();
        }, 0);
    },

    // delete the server buffer (not yet used)
    cleanServer : function(component) {
        var a = component.get("c.deleteBuffer");
        a.setParams({
            "id" : component.testId
        });
        $A.test.callServerAction(a);
    },

    /**
     * Single and group of non-abortable actions are processed in order.
     */
    testNoAborts : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [
                        [ this.getTestAction(component, "a") ],
                        [ this.getTestAction(component, "b1"), this.getTestAction(component, "b2"),
                                this.getTestAction(component, "b3") ], [ this.getTestAction(component, "c") ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("a.ab1.ab1b2.ab1b2b3.ab1b2b3c.", $A.test.getText(results));
                });
            });
        }
    },

    /**
     * An abortable action followed by a non-abortable action should get sent to the server.
     */
    testAbortThenNot : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [ [ this.getTestAction(component, "a", true) ],
                        [ this.getTestAction(component, "b", true) ], [ this.getTestAction(component, "c", false) ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("b.bc.", $A.test.getText(results));
                });
            });
        }
    },

    /**
     * A series of abortable actions results in only the last action getting sent to the server.
     */
    testAbortThenAbort : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [ [ this.getTestAction(component, "a", true) ],
                        [ this.getTestAction(component, "b", true) ], [ this.getTestAction(component, "c", true) ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("c.", $A.test.getText(results));
                });
            });
        }
    },

    /**
     * An abortable action followed by a mixed group results in the abortable not getting run, but all of the mixed
     * group runs.
     */
    testAbortThenMixedGroup : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [ [ this.getTestAction(component, "a", true) ],
                        [ this.getTestAction(component, "b", true) ],
                        [ this.getTestAction(component, "c1", true), this.getTestAction(component, "c2", false) ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("c1.c1c2.", $A.test.getText(results));
                });
            });
        }
    },

    /**
     * A mixed group where the last action is abortable, followed by an abortable action, results in the abortable
     * action in the group not getting run.
     */
    testMixedGroupEndingWithAbortThenAbort : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [
                        [ this.getTestAction(component, "a", true) ],
                        [ this.getTestAction(component, "b1"), this.getTestAction(component, "b2"),
                                this.getTestAction(component, "b3", true) ],
                        [ this.getTestAction(component, "c", true) ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("b1.b1b2.b1b2c.", $A.test.getText(results));
                });
            });
        }
    },

    /**
     * A mixed group where the first action is abortable, followed by an abortable action, results in the abortable
     * action in the group not getting run.
     */
    testMixedGroupStartingWithAbortThenAbort : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [
                        [ this.getTestAction(component, "a", true) ],
                        [ this.getTestAction(component, "b1", true), this.getTestAction(component, "b2"),
                                this.getTestAction(component, "b3") ], [ this.getTestAction(component, "c", true) ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("b2.b2b3.b2b3c.", $A.test.getText(results));
                });
            });
        }
    },

    /**
     * A group of abortable actions followed by an abortable action results in the group not getting run.
     */
    testGroupedAbortsThenAbort : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [
                        [ this.getTestAction(component, "a", false) ],
                        [ this.getTestAction(component, "b1", true), this.getTestAction(component, "b2", true),
                                this.getTestAction(component, "b3", true) ],
                        [ this.getTestAction(component, "c", true) ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("a.ac.", $A.test.getText(results));
                });
            });
        }
    },

    /**
     * A group of abortable actions that is not followed by another action or group results in all of the group's
     * actions getting run.
     */
    testGroupedAbortsThenNothing : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [ [ this.getTestAction(component, "a", true) ],
                        [ this.getTestAction(component, "b1", true), this.getTestAction(component, "b2", true) ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("b1.b1b2.", $A.test.getText(results));
                });
            });
        }
    },

    /**
     * A group of abortable actions that is followed by a non-abortable action results in the abortable actions in the
     * group still getting run.
     */
    testGroupedAbortsThenNot : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [ [ this.getTestAction(component, "a", false) ],
                        [ this.getTestAction(component, "b1", true), this.getTestAction(component, "b2", true) ],
                        [ this.getTestAction(component, "c", false) ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("a.ab1.ab1b2.ab1b2c.", $A.test.getText(results));
                });
            });
        }
    },

    /**
     * A group of abortable actions that is followed by a mixed group results in the first group not getting run.
     */
    testGroupedAbortsThenMixedGroup : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [ [ this.getTestAction(component, "a", false) ],
                        [ this.getTestAction(component, "b1", true), this.getTestAction(component, "b2", true) ],
                        [ this.getTestAction(component, "c1", true), this.getTestAction(component, "c2", false) ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("a.ac1.ac1c2.", $A.test.getText(results));
                });
            });
        }
    },

    /**
     * A mixed group followed by a mixed group results in the first group's abortable actions not getting run.
     */
    testMixedGroupThenMixedGroup : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [ [ this.getTestAction(component, "a", false) ],
                        [ this.getTestAction(component, "b1", false), this.getTestAction(component, "b2", true) ],
                        [ this.getTestAction(component, "c1", true), this.getTestAction(component, "c2", false) ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("a.ab1.ab1c1.ab1c1c2.", $A.test.getText(results));
                });
            });
        }
    },

    /**
     * A group of abortable actions followed by a group of abortable action results in the first group not getting run.
     */
    testGroupedAbortsThenGroupedAborts : {
        test : function(component) {
            this.initAndRun(component, function() {
                var actions = [ [ this.getTestAction(component, "a", false) ],
                        [ this.getTestAction(component, "b1", true), this.getTestAction(component, "b2", true) ],
                        [ this.getTestAction(component, "c1", true), this.getTestAction(component, "c2", true) ] ];
                var results = component.find("results").getElement();
                this.waitForActions(component, actions, function() {
                    $A.test.assertEquals("a.ac1.ac1c2.", $A.test.getText(results));
                });
            });
        }
    }
})
