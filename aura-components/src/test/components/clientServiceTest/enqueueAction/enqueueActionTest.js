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
     * Set up the actions by creating a storage, building the hierarchy, and resetting the buffer for the test.
     */
    setUp: function(cmp) {
        //
        // Initialize storage here, in JS to avoid issues with instantiating the component multiple
        // times.
        //
        $A.storageService.initStorage({
            name: "actions",
            persistent: false,
            secure: false,
            maxSize: 100000,
            expiration: 50,
            autoRefreshInterval: 0,
            version: "1"
        });

        cmp.helper.buildHierarchy(cmp);
        var ready = false;
        $A.test.callServerAction($A.test.getAction(cmp, "c.execute", {
            "commands" : "RESET"
        }, function() {
            ready = true;
        }));
        $A.test.addWaitFor(true, function() {
            return ready;
        });
    },

    /**
     * Get a lock name that will not conflict.
     *
     * FIXME: there should be a $A.test.getUniqueId()
     */
    getSafeLock: function(cmp, name) {
        if (!cmp._lock_names) {
            cmp._lock_names = {};
            cmp._lock_base = ""+new Date().getTime();
        }
        if (!cmp._lock_names[name]) {
            cmp._lock_names[name] = $A.test.getTestName()+"."+cmp._lock_base+"."+name;
        }
        return cmp._lock_names[name];
    },

    /**
     * Convert an array of command arrays into a simple string.
     *
     * This allows us to ensure locks are unique, and check the command string.
     */
    buildCommands: function(cmp, commands) {
        var i;
        var commands_out = "";
        var name;
        var parent = cmp;

        for (i = 0; i < commands.length; i++) {
            var command_list = commands[i];
            var command = command_list[0];
            if (command === "WAIT") {
                name = this.getSafeLock(cmp, command_list[1]);
                commands_out += "WAIT "+name+";";
            } else if (command === "RESUME") {
                name = this.getSafeLock(cmp, command_list[1]);
                commands_out += "RESUME "+name+";";
            } else if (command === "APPEND") {
                commands_out += "APPEND "+command_list[1]+";";
            } else if (command === "COPY") {
                commands_out += "COPY;";
            } else if (command === "READ") {
                commands_out += "READ;";
            } else {
                throw new Error("Unknown command "+command+" in "+command_list);
            }
        }
        return commands_out;
    },

    sendAction: function(cmp, path, commands, label, options) {
        var i;
        var commands_out = "";
        var name;
        var parent = cmp;

        for (i = 0; i < commands.length; i++) {
            var command_list = commands[i];
            var command = command_list[0];
            if (command === "WAIT") {
                name = this.getSafeLock(cmp, command_list[1]);
                commands_out += "WAIT "+name+";";
            } else if (command === "RESUME") {
                name = this.getSafeLock(cmp, command_list[1]);
                commands_out += "RESUME "+name+";";
            } else if (command === "APPEND") {
                commands_out += "APPEND "+command_list[1]+";";
            } else if (command === "COPY") {
                commands_out += "COPY;";
            } else if (command === "READ") {
                commands_out += "READ;";
            }
        }
        cmp.runAction(path, parent, commands_out, label, options);
    },

    /**
     * Wait for a line to appear at a specific location.
     */
    addWaitForLog : function(cmp, index, content, cb, partialMatch) {
        var actual;
        $A.test.addWaitForWithFailureMessage(false,
            function() {
                actual = cmp.get("v.log")?cmp.get("v.log")[index]:undefined;
                return actual === undefined;
            },
            "Never received log message '" + content + "' at index " + index,
            function() {
                if(partialMatch === true) {
                    $A.test.assertTrue(actual.contains(content), "mismatch on log entry "+index);
                } else {
                    $A.test.assertEquals(content, actual, "mismatch on log entry "+index);
                }
                if (cb) {
                    cb();
                }
            }
        );
    },

    /**
     * Wait for a log entry that will fall in a range due to race conditions.
     */
    addWaitForLogRace : function(cmp, index1, index2, content, partialMatch) {
        var actual;
        $A.test.addWaitForWithFailureMessage(true,
                function() {
                    actual = cmp.get("v.log")?cmp.get("v.log")[index2]:undefined;
                    return actual !== undefined;
                },
                "Never received log message '" + content + "' between index " + index1 + " and " + index2,
                function() {
                    var i;
                    var logs = cmp.get("v.log");
                    var acc = '';
                    for (i = index1; i <= index2; i++) {
                        if(partialMatch === true) {
                            if(logs[i].indexOf(content) >= 0) {
                                return;
                            }
                        } else {
                            if (logs[i] === content) {
                                return;
                            }
                        }
                        acc = acc + '\n' + logs[i];
                    }
                    $A.test.fail("mismatch in log range "+index1+','+index2+
                        ': did not find '+content+' in:'+acc);
                }
        );
    },

    /**
     * Wait for a set of log entries that will fall (in order) in a range due to race conditions.
     *
     * Unlike wait for log race above, this requires a set of log lines to be in order, but allows then to have
     * races with other groups of lines. This is useful when you have several sets of actions in paralel, but
     * want to ensure that a given set is executed in order.
     */
    addWaitForLogRaceOrdered : function(cmp, index1, index2, contentSet, partialMatch) {
        var actual;
        $A.test.addWaitForWithFailureMessage(true,
                function() {
                    actual = cmp.get("v.log")?cmp.get("v.log")[index2]:undefined;
                    return actual !== undefined;
                },
                "Never received log message '" + contentSet + "' between index " + index1 + " and " + index2,
                function() {
                    var i, j;
                    var logs = cmp.get("v.log");
                    var acc = '';
                    for (i = index1, j=0; j < contentSet.length && i <= index2; i++) {
                        if(partialMatch === true) {
                            if(logs[i].indexOf(contentSet[j]) >= 0) {
                                j++;
                            }
                        } else {
                            if (logs[i] === contentSet[j]) {
                                j++;
                            }
                        }
                        acc = acc + '\n' + logs[i];
                    }
                    if (j === contentSet.length) {
                        return;
                    }
                    $A.test.fail("mismatch in log range "+index1+','+index2+
                        ': did not find '+contentSet+' in:'+acc);
                }
        );
    },

    /**
     * Test that we can enqueue and execute client actions.
     *
     * Guarantees:
     *  * client action MUST not run immediately.
     *  * client action MAY run after a timeout.
     *  * client action MUST run before render.
     */
    testEnqueueClientAction : {
        test : [ function(cmp) {
            //Action is enqueued but not executed
            var action = cmp.get("c.client");
            // FIXME: Ensure that the component is not rendered until after the client action runs.
            $A.enqueueAction(action);
            // logging here should always beat enqueueing.
            cmp.helper.log(cmp, cmp, "log1");
            this.addWaitForLog(cmp, 0, "log1");
            // the only guarantee is that the client actions should
            // execute before the render occurs In this case, we should get exactly one rerender.
            // FIXME: goliver actions-rewrite
            // Don't know how to check for this.
            this.addWaitForLog(cmp, 1, "client");
        } ]
    },

    /**
     * Test that we can have more than one foreground actions run in parallel on server.
     *
     * max 4 foreground actions can be run in parallel. here we enqueue 4 foreground actions. ask first 3 to wait on
     * server till 4th arrives, then release them all.
     *
     * if enqueue 4 foreground action without releasing any of them, we will run out of available XHR when we want to
     * enqueue another, no error/warning message on anywhere though, we just put actions in the deferred queue.
     *
     * This is dangerous, so we have to ensure that we don't create races. To avoid races, we explicitely chain
     * our actions using resume and wait. Be careful of deadlocks.
     */
    // FIXME: After multiple attemps at a fix this test still flaps. Needs to be re-thought.
    _testMultipleForegroundInFlight : {
        labels: ["flapper"],
        test : [
            function(cmp) {
                this.sendAction(cmp, [],
                    [ [ "APPEND", "fore1" ],
                      [ "RESUME", "fore1.chain" ],
                      [ "WAIT", "fore1" ],
                      [ "COPY" ] ],
                    "fore1");
            }, function(cmp) {
                this.sendAction(cmp, [],
                    [ [ "WAIT", "fore1.chain"],
                      [ "APPEND", "fore2" ],
                      [ "RESUME", "fore2.chain" ],
                      [ "WAIT", "fore2" ],
                      [ "COPY" ] ],
                    "fore2");
            }, function(cmp) {
                this.sendAction(cmp, [],
                    [ [ "WAIT", "fore2.chain"],
                      [ "APPEND", "fore3" ],
                      [ "RESUME", "fore3.chain" ],
                      [ "WAIT", "fore3" ],
                      [ "COPY" ] ],
                    "fore3");
            }, function(cmp) {
                this.sendAction(cmp, [],
                    [ [ "WAIT", "fore3.chain"],
                      [ "APPEND", "fore4" ],
                      [ "READ" ],
                      [ "APPEND", "fore4.after" ],
                      [ "RESUME", "fore1" ],
                      [ "RESUME", "fore2" ],
                      [ "RESUME", "fore3" ] ],
                    "fore4");
            }, function(cmp) {
                 this.addWaitForLogRace(cmp, 0, 3, "fore1: SUCCESS fore4.after");
                 this.addWaitForLogRace(cmp, 0, 3, "fore2: SUCCESS fore4.after");
                 this.addWaitForLogRace(cmp, 0, 3, "fore3: SUCCESS fore4.after");
                 this.addWaitForLogRace(cmp, 0, 3, "fore4: SUCCESS fore1,fore2,fore3,fore4");
            } ]
    },


    /**
     * Test to ensure that caboose actions are not executed until another foreground action is sent.
     *
     * Guarantees:
     *  * Caboose action will not be sent until a server side foreground action is enqueued.
     *  * allAboardCallback will be called before the action is sent, but after the foreground action is enqueued
     *
     * This test emulates the log+flush pattern that can be used with a combination of caboose actions and allAboard
     * callbacks. This pattern lets the user queue a caboose action and use allAboardCallback to set a param (in this
     * case fake log data) to be attached to the action right before the XHR is sent to the server.
     */
    testCabooseActionsWithAllAboardCallback : {
        test : [
            function(cmp) {
                var that = this;
                this.sendAction(cmp, [],
                    [ [ "APPEND", "back1" ],
                      [ "READ" ] ],
                    "back1",
                    [ "background" ]);

                this.sendAction(cmp, [],
                    [ [ "APPEND", "caboose1" ],
                      [ "READ" ] ],
                    "caboose1",
                    [ "caboose", "allaboard" ]);

                // verify only background action ran
                this.addWaitForLog(cmp, 0, "back1: SUCCESS back1");
            },
            function(cmp) {
                this.sendAction(cmp, [],
                    [ [ "APPEND", "back2" ],
                      [ "READ" ] ],
                    "back2",
                    [ "background" ]);
                this.addWaitForLog(cmp, 1, "back2: SUCCESS back2");
            },
            function(cmp) {
                // Client actions also should not trigger the caboose.
                $A.enqueueAction(cmp.get("c.client"));
                this.addWaitForLog(cmp, 2, "client");
            },
            function(cmp) {
                this.sendAction(cmp, [],
                    [ [ "APPEND", "fore1" ],
                      [ "READ" ] ],
                    "fore1");
                // new foreground action should flush out all pending caboose actions
                this.addWaitForLog(cmp, 3, "caboose1[AllAboard]: NEW");
                this.addWaitForLogRace(cmp, 4, 5, "caboose1: SUCCESS caboose1");
                this.addWaitForLogRace(cmp, 4, 5, "fore1: SUCCESS fore1");
            }
        ]
    },

    /**
     * run storable action ('c.execute', param:'WAIT;READ') couple times, make sure we read response from storage
     * also check storage is updated when new response come from server (we did it by bgAction1/2/etc).
     * NOTE: from storage point of view, only action def and parameter matters, foreground or background are the same
     */
    testStorableRefresh : {
        test : [ function(cmp) {
             //enqueue foreground action(a), ask it to wait on server, till another action (bgAction1) release it.
             //a is storable, its return 'initial' is stored
            var that = this;
            // prime storage
            this.sendAction(cmp, [],
                [ [ "WAIT", "prime" ],
                  [ "READ" ] ],
                "prime",
                [ "storable" ]);
            this.sendAction(cmp, [],
                [ [ "APPEND", "initial" ],
                  [ "RESUME", "prime" ] ],
              "back",
              [ "background" ]);
            this.addWaitForLogRace(cmp, 0, 1,  "prime: SUCCESS initial");
            this.addWaitForLogRace(cmp, 0, 1,  "back: SUCCESS ");
        }, function(cmp) {
            //fire foreground action(a), because we already have its response('initial') stored, it will just get that.
            //we also fire background action(bgAction2), it update a's return with a new value,
            //it will update stored response for a.
            this.sendAction(cmp, [],
                [ [ "WAIT", "prime" ],
                  [ "READ" ] ],
                "refresh",
                [ "storable" ]);
            this.addWaitForLog(cmp, 2, "refresh[stored]: SUCCESS initial");
        }, function(cmp) {
            this.sendAction(cmp, [],
                [ [ "APPEND", "round two" ],
                  [ "RESUME", "prime" ] ],
              "back",
              [ "background" ]);
            this.addWaitForLogRace(cmp, 3, 4, "back: SUCCESS ");
            this.addWaitForLogRace(cmp, 3, 4, "refresh: SUCCESS round two");
        }, function(cmp) {
            //fire background action(a), it will read response from storage, which is updated by bgAction2 above
            //fire foreground action, it update response in storage
        }, function(cmp) {
            //enqueue foreground action(a) again to double check update from foreAction1 is indeed in storage.
            //enqueue background action bgAction3 to release a from server,
            //also update the storage with new response 'theEnd'
        } ]
    },

    /**
     * Make sure that we send only one of two duplicate actions enqueued.
     *
     * Test this by putting a single value on the buffer, then reading and clearing in both actions. If they
     * both go to the server, they will have different values.
     */
    testDeDupeStorable : {
        test : [ function(cmp) {
            // The storable actions should be 'de-duped', and only one should go to the server.
            // This is shown by the fact that they will both get the 'initial' that is saved in a buffer.
            this.sendAction(cmp, [],
                [ [ "APPEND", "initial" ] ],
                "setup",
                [ "background" ]);
            this.sendAction(cmp, [],
                [ [ "WAIT", "prime" ],
                  [ "READ" ] ],
                "prime1",
                [ "storable" ]);
            this.sendAction(cmp, [],
                [ [ "WAIT", "prime" ],
                  [ "READ" ] ],
                "prime2",
                [ "storable" ]);
            this.addWaitForLog(cmp, 0, "setup: SUCCESS ");
        }, function(cmp) {
            this.sendAction(cmp, [],
                [ [ "RESUME", "prime" ] ],
                "release",
                [ "background" ]);
            this.addWaitForLogRace(cmp, 1, 3, "release: SUCCESS ");
            this.addWaitForLogRace(cmp, 1, 3, "prime1: SUCCESS initial");
            this.addWaitForLogRace(cmp, 1, 3, "prime2: SUCCESS initial");
        } ]
    },

    /**
     * enqueue two actions, a1(foreground), a2(background) with same action def and param, they run in parallel
     * make sure they read response from storage first, then update the storage with their responses.
     *
     * Note a1&a2 are not both foreground/background, a2 won't become a dupe of a1
     */
    testParallelStorable : {
        test : [ function(cmp) {
            this.sendAction(cmp, [],
                [ [ "APPEND", "initial" ] ],
                "setup");
            this.addWaitForLog(cmp, 0, "setup: SUCCESS ");
        }, function(cmp) {
            this.sendAction(cmp, [],
                [ [ "READ" ] ],
                "prime",
                [ "storable" ]);
            this.addWaitForLog(cmp, 1, "prime: SUCCESS initial");
        }, function(cmp) {
            this.sendAction(cmp, [],
                [ [ "APPEND", "second" ] ],
                "setup2");
            this.addWaitForLog(cmp, 2, "setup2: SUCCESS ");
        }, function(cmp) {
            this.sendAction(cmp, [],
                [ [ "READ" ] ],
                "retrieve-fore",
                [ "storable" ]);
            this.sendAction(cmp, [],
                [ [ "READ" ] ],
                "retrieve-back",
                [ "storable", "background" ]);
            // both callbacks with stored value executed. These should be executed _before_ any refreshes go out.
            this.addWaitForLogRace(cmp, 3, 4, "retrieve-fore[stored]: SUCCESS initial");
            this.addWaitForLogRace(cmp, 3, 4, "retrieve-back[stored]: SUCCESS initial");

            //last param=true:we only check partial match
            this.addWaitForLogRace(cmp, 5, 6, "retrieve-fore: SUCCESS ", true);
            this.addWaitForLogRace(cmp, 5, 6, "retrieve-back: SUCCESS ", true);
        } ]
    },

    /**
     * Check that an abortable action is aborted prior to send.
     */
    testAbortAbortablePriorToSend : {
        test : [ function(cmp) {
            $A.test.blockForegroundRequests();
            this.sendAction(cmp, [ "child1" ],
                [ [ "APPEND", "value" ],
                  [ "READ" ] ],
                "aborted",
                [ "abortable" ]);
            // return to top so that the action gets queued up.
        }, function(cmp) {
            cmp.helper.deleteChild(cmp, "child1");
        }, function(cmp) {
            $A.test.releaseForegroundRequests();
            this.addWaitForLog(cmp, 0, "aborted: ABORTED undefined");
        } ]
    },

    /**
     * Check that an abortable action is aborted after send.
     */
    testAbortAbortableAfterSend : {
        test : [ function(cmp) {
            this.sendAction(cmp, [ "child1" ],
                [ [ "WAIT", "release" ],
                  [ "APPEND", "value" ],
                  [ "READ" ] ],
                "aborted",
                [ "abortable" ]);
            // make sure we sent the action.
            $A.test.addWaitFor(false, function() { return $A.test.isActionQueued(); })
        }, function(cmp) {
            var old = cmp.find("child1");
            if($A.util.isArray(old)) {
              old = old[0];
            }
            cmp.helper.deleteChild(cmp, "child1");
            // Make sure that the component is gone before we release.
            $A.test.addWaitFor(false, function() { return old.isValid(); })
        }, function(cmp) {
            this.sendAction(cmp, [ ],
                [ [ "RESUME", "release" ] ],
                "release");
            this.addWaitForLogRace(cmp, 0, 1, "aborted: ABORTED value");
            this.addWaitForLogRace(cmp, 0, 1, "release: SUCCESS ");
        } ]
    },

    /**
     * Check that a non-abortable action is not aborted prior to send.
     */
    testAbortNonAbortableNotPriorToSend : {
        test : [ function(cmp) {
            $A.test.blockForegroundRequests();
            this.sendAction(cmp, [ "child1" ],
                [ [ "APPEND", "value" ],
                  [ "READ" ] ],
                "aborted");
            // return to top so that the action gets queued up.
        }, function(cmp) {
            cmp.helper.deleteChild(cmp, "child1");
        }, function(cmp) {
            $A.test.releaseForegroundRequests();
            this.addWaitForLog(cmp, 0, "aborted: ABORTED value");
        } ]
    },

    /**
     * Check that an abortable action is aborted prior to send.
     */
    testAbortNonAbortableAfterSend : {
        test : [ function(cmp) {
            this.sendAction(cmp, [ "child1" ],
                [ [ "WAIT", "release" ],
                  [ "APPEND", "value" ],
                  [ "READ" ] ],
                "aborted",
                [ "abortable" ]);
        }, function(cmp) {
            var old = cmp.find("child1");
            if($A.util.isArray(old)) {
              old = old[0];
            }
            cmp.helper.deleteChild(cmp, "child1");
            // Make sure that the component is gone before we release.
            $A.test.addWaitFor(false, function() { return old.isValid(); });
        }, function(cmp) {
            this.sendAction(cmp, [ ],
                [ [ "RESUME", "release" ] ],
                "release");
            this.addWaitForLogRace(cmp, 0, 1, "aborted: ABORTED value");
            this.addWaitForLogRace(cmp, 0, 1, "release: SUCCESS ");
        } ]
    },

    ///////////////////////////////////////////////////////////////////////
    // runActions
    ///////////////////////////////////////////////////////////////////////

    testSimpleRunActions : {
        test : [ function(cmp) {
            var helper = cmp.helper;
            $A.clientService.runActions([
                    helper.getAction(cmp, cmp, this.buildCommands(cmp, [ [ "APPEND", "a" ], ["READ"] ]), "first")
                ], this, function() {
                    cmp.helper.log(cmp, cmp, "group1");
                });
        }, function(cmp) {
            var helper = cmp.helper;
            $A.clientService.runActions([
                    helper.getAction(cmp, cmp, this.buildCommands(cmp, [ [ "APPEND", "b1" ], ["READ"] ]), "second"),
                    helper.getAction(cmp, cmp, this.buildCommands(cmp, [ [ "APPEND", "b2" ], ["READ"] ]), "second")
                ], this, function() {
                    cmp.helper.log(cmp, cmp, "group2");
                });
        }, function(cmp) {
            var helper = cmp.helper;
            $A.clientService.runActions([
                    helper.getAction(cmp, cmp, this.buildCommands(cmp, [ [ "APPEND", "c1" ], ["READ"] ]), "third"),
                    helper.getAction(cmp, cmp, this.buildCommands(cmp, [ [ "APPEND", "c2" ], ["READ"] ]), "third")
                ], this, function() {
                    cmp.helper.log(cmp, cmp, "group3");
                });
        }, function(cmp) {
            this.addWaitForLogRaceOrdered(cmp, 0, 7, [ "first: SUCCESS a", "group1" ] );

            this.addWaitForLogRaceOrdered(cmp, 0, 7, [ "second: SUCCESS b1", "group2" ]);
            this.addWaitForLogRaceOrdered(cmp, 0, 7, [ "second: SUCCESS b2", "group2" ]);

            this.addWaitForLogRaceOrdered(cmp, 0, 7, [ "third: SUCCESS c1", "group3" ]);
            this.addWaitForLogRaceOrdered(cmp, 0, 7, [ "third: SUCCESS c2", "group3" ]);
        }]
    }
})
