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
    setUp : function(cmp) {
        document.__testLogger = "initialString";
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
     * put a line in our component for verification.
     */
    log : function(cmp, msg) {
        var logValue = cmp.get("v.log");
        logValue.push(msg);
        cmp.set("v.log", logValue);
    },

    /**
     * Wait for a line to appear at a specific location.
     */
    addWaitForLog : function(cmp, index, content, cb) {
        var actual;
        $A.test.addWaitForWithFailureMessage(false,
            function() {
                actual = cmp.get("v.log")?cmp.get("v.log")[index]:undefined;
                return actual === undefined;
            },
            "Never received log message '" + content + "' at index " + index,
            function() {
                $A.test.assertEquals(content, actual, "mismatch on log entry "+index);
                if (cb) {
                    cb();
                }
            }
        );
    },

    /**
     * Wait for a log entry that will fall in a range due to race conditions.
     */
    addWaitForLogRace : function(cmp, index1, index2, content) {
        var actual;
        $A.test.addWaitForWithFailureMessage(false,
                function() {
                    actual = cmp.get("v.log")?cmp.get("v.log")[index2]:undefined;
                    return actual === undefined;
                },
                "Never received log message '" + content + "' between index " + index1 + " and " + index2,
                function() {
                    var i;
                    var logs = cmp.get("v.log");
                    var acc = '';

                    for (i = index1; i <= index2; i++) {
                        if (logs[i] === content) {
                            return;
                        }
                        acc = acc + '\n' + logs[i];
                    }
                    $A.test.fail("mismatch in log range "+index1+','+index2+
                        ': did not find '+content+' in:'+acc);
                }
        );
    },

    /**
     * get an action with parameters.
     */
    getAction : function(cmp, actionName, commands, callback, background, abortable, allAboardCallback) {
        var a = $A.test.getAction(cmp, actionName, {
            "commands" : commands
        }, callback);
        if (background) {
            a.setBackground();
        }
        if (abortable) {
            a.setAbortable();
        }
        if (allAboardCallback) {
            a.setAllAboardCallback(this, allAboardCallback);
        }
        return a;
    },

    /**
     * get an action that will auto-log.
     */
    getActionAndLog : function(cmp, actionName, commands, label, background, abortable, allAboard) {
        var that = this;
        var log = function(a) {
            that.log(cmp, label+": "+a.getState()+" "+a.getReturnValue());
        };
        var allAboardCallback = undefined;
        if (allAboard === true) {
            allAboardCallback = function (a) {
                that.log(cmp, label+": All Aboard!");
            };
        }
        var action = this.getAction(cmp, actionName, commands, log, background, abortable, allAboardCallback);
        action.setCallback(this, log, "ABORTED");
        return action;
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
            this.log(cmp, "log1");
            this.addWaitForLog(cmp, 0, "log1");
            // the only guarantee is that the client actions should
            // execute before the render occurs In this case, we should get exactly one rerender.
            // FIXME: goliver actions-rewrite
            // Don't know how to check for this.
            this.addWaitForLog(cmp, 1, "client");
        } ]
    },

    /**
     * Test that we can have more than one action on the server in parallel.
     *
     * Guarantees:
     *  * At least two foreground actions can be run in parallel.
     */
    testMultipleForegroundInFlight : {
        test : [
            function(cmp) {
                // fire first foreground action that waits for trigger
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "APPEND fore1;WAIT fore1;READ;", "fore1"));
            },
            function(cmp) {
                // send a second action that should release the first one.
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute",
                        "APPEND fore2;READ;APPEND fore2.2;RESUME fore1", "fore2"));
                this.addWaitForLogRace(cmp, 0, 1, "fore1: SUCCESS fore2.2");
                this.addWaitForLogRace(cmp, 0, 1, "fore2: SUCCESS fore1,fore2");
            } ]
    },


    /**
     * Test to ensure that caboose actions are not executed until another foreground action is sent.
     *
     * Guarantees:
     *  * Caboose action will not be sent until a server side foreground action is enqueued.
     *  * allAboardCallback will be called before the action is sent, but in the same execution unit as send.
     */
    testCabooseActions : {
        test : [
            function(cmp) {
                var that = this;
                $A.enqueueAction(this.getActionAndLog(cmp, "c.executeBackground", "APPEND back1;READ;", "back1"));

                // caboose action should not be run until another non-caboose foreground action runs
                $A.enqueueAction(this.getActionAndLog(cmp, "c.executeCaboose", "APPEND caboose1;READ;", "caboose1", 
                        false, false, true));

                // verify only background action ran
                this.addWaitForLog(cmp, 0, "back1: SUCCESS back1");
            },
            function(cmp) {
                $A.enqueueAction(this.getActionAndLog(cmp, "c.executeBackground", "APPEND back2;READ;", "back2"));

                // queue up a couple more caboose actions
                $A.enqueueAction(this.getActionAndLog(cmp, "c.executeCaboose", "APPEND caboose2;READ;", "caboose2",
                        false, false, true));
                $A.enqueueAction(this.getActionAndLog(cmp, "c.executeCaboose", "APPEND caboose3;READ;", "caboose3",
                        false, false, true));
                // verify only background action ran (still)
                this.addWaitForLog(cmp, 1, "back2: SUCCESS back2");
            },
            function(cmp) {
                $A.enqueueAction(cmp.get("c.client"));
                this.addWaitForLog(cmp, 2, "client");
            },
            function(cmp) {
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "APPEND fore1;READ;", "fore1"));
                // new foreground action should flush out all pending caboose actions
                this.addWaitForLogRace(cmp, 3, 5, "caboose1: All Aboard!");
                this.addWaitForLogRace(cmp, 3, 5, "caboose2: All Aboard!");
                this.addWaitForLogRace(cmp, 3, 5, "caboose3: All Aboard!");
                this.addWaitForLogRace(cmp, 6, 9, "caboose1: SUCCESS caboose1");
                this.addWaitForLogRace(cmp, 6, 9, "caboose2: SUCCESS caboose2");
                this.addWaitForLogRace(cmp, 6, 9, "caboose3: SUCCESS caboose3");
                this.addWaitForLogRace(cmp, 6, 9, "fore1: SUCCESS fore1");
            }
        ]
    },

    /**
     * This test emulates the log+flush pattern that can be used with a combination of caboose actions and allAboard
     * callbacks. This pattern lets the user queue a caboose action and use allAboardCallback to set a param (in this
     * case fake log data) to be attached to the action right before the XHR is sent to the server.
     */
    testCabooseAllAboardCallbackSetsParam : {
        test : [
            function(cmp) {
                var that = this;
                var a;
                a = this.getAction(cmp, "c.executeCaboose", "APPEND caboose1;READ;", function(a) {
                    that.log(cmp, "caboose1:" + a.getReturnValue());
                }, false, false, function() {
                    this.log(cmp, "allAboardCallback");
                    a.setParam("commands", "APPEND " + document.__testLogger + ";READ;");
                });
                $A.enqueueAction(a);
            },
            function(cmp) {
                var that = this;
                document.__testLogger = document.__testLogger + ",updatedString";
                $A.enqueueAction(this.getAction(cmp, "c.execute", "APPEND fore1;READ;", function(a){
                    that.log(cmp, "fore1:" + a.getReturnValue());
                }));
                this.addWaitForLog(cmp, 0, "allAboardCallback");
                this.addWaitForLog(cmp, 1, "caboose1:initialString,updatedString");
                this.addWaitForLog(cmp, 2, "fore1:fore1");
            }
        ]
    },

    /*
     * when enqueuing actions from a callback, they should never abort the abortable group of the
     * source actions.
     */
    testStoredActionCallbackDoesntAbortOthers : {
        test : [
            function(cmp) {
                var that = this;
                // Set up a stored action
                var a = this.getAction(cmp, "c.execute", "APPEND first; READ;",
                                 function(a) {
                                     that.log(cmp, "first:" + a.getReturnValue());
                                 });
                a.setStorable();
                $A.enqueueAction(a);
                this.addWaitForLog(cmp, 0, "first:first");
            },
            function(cmp) {
                var that = this;
                //
                // Run the stored action followed by a new one. and make sure that
                // our stored action callback queues up the 'breaking' action.
                // In bug W-2550458, the 'confirm' action was aborted by the 'break'
                // action, because the callback for the stored action did not have the
                // correct transaction id.
                //
                var a = this.getAction(cmp, "c.execute", "APPEND first; READ;",
                                 function(a) {
                                     that.log(cmp, "first:" + a.getReturnValue());
                                     var b = that.getAction(cmp, "c.execute", "APPEND break; READ;",
                                         function(a) {
                                             that.log(cmp, "break:" + a.getReturnValue());
                                         });
                                     b.setStorable();
                                     $A.enqueueAction(b);
                                 });
                a.setStorable();
                $A.enqueueAction(a);
                var c = this.getAction(cmp, "c.execute", "APPEND confirm; READ;",
                                 function(a) {
                                     that.log(cmp, "confirm:" + a.getReturnValue());
                                 });
                c.setStorable();
                $A.enqueueAction(c);
                this.addWaitForLog(cmp, 1, "first:first");
                this.addWaitForLog(cmp, 2, "confirm:confirm");
                this.addWaitForLog(cmp, 3, "break:break");
            }
        ]
    },

    /**
     * Test that we abort actions in the queue before sending to the server.
     */
    testAbortQueuedAbortable : {
        test : [
            function(cmp) {
                var that = this;

                $A.test.blockForegroundRequests();

                // abort abortable action followed by batch with abortables
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "APPEND fore2;READ;", "fore2", false, true));
            }, function(cmp) {
                var that = this;

                // abort abortable actions in batch followed by batch with abortables
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "APPEND fore3;READ;", "fore3", false, true));
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "APPEND fore4;READ;", "fore4", false, false));
            }, function(cmp) {
                var that = this;
                // don't abort abortable actions in batch followed by batch without abortables
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "APPEND fore5;READ;", "fore5", false, true));
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "APPEND fore6;READ;", "fore6", false, true));
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "APPEND fore7;READ;", "fore7", false, false));
            }, function(cmp) {
                var that = this;
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "APPEND fore8;READ;", "fore8", false, false));
                $A.test.releaseForegroundRequests();
                this.addWaitForLog(cmp, 0, "fore2: ABORTED undefined");
                this.addWaitForLog(cmp, 1, "fore3: ABORTED undefined");
                this.addWaitForLog(cmp, 2, "fore4: SUCCESS fore4");
                this.addWaitForLog(cmp, 3, "fore5: SUCCESS fore5");
                this.addWaitForLog(cmp, 4, "fore6: SUCCESS fore6");
                this.addWaitForLog(cmp, 5, "fore7: SUCCESS fore7");
                this.addWaitForLog(cmp, 6, "fore8: SUCCESS fore8");
            } ]
    },

    testAbortInFlightAbortable : {
        test : [function(cmp) {
                // hold abortable at server
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "APPEND fore1;RESUME back1;WAIT fore1;READ;", "fore1", false, true));
            }, function(cmp) {
                // fire another abortable action
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "APPEND fore2;READ;", "fore2", false, true));
                this.addWaitForLog(cmp, 0, "fore2: SUCCESS fore1,fore2");
            }, function(cmp) {
                $A.enqueueAction(this.getActionAndLog(cmp, "c.execute", "RESUME fore1;APPEND fore3;READ;", "fore3", false, false));
                this.addWaitForLogRace(cmp, 1, 2, "fore1: ABORTED ");
                this.addWaitForLogRace(cmp, 1, 2, "fore3: SUCCESS fore3");
        }]
    },

    testStorableRefresh : {
        test : [ function(cmp) {
            var that = this;
            // prime storage
            var a = this.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                that.log(cmp, "prime:" + a.isFromStorage() + ":" + a.getReturnValue());
            });
            a.setStorable();
            $A.enqueueAction(a);
            var bgAction1 = this.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME;");
            $A.enqueueAction(bgAction1);
            this.addWaitForLog(cmp, 0, "prime:false:initial");
            // This test assumes actions from each test stage are complete before moving on to the next stage. So we
            // need to wait on actions that don't log to the screen. On slower browsers without the wait the actions
            // get backed up and begin aborting themselves, causing the test to fail.
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([bgAction1]); });
        }, function(cmp) {
            var that = this;
            // foreground refresh matches
            var a = this.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                that.log(cmp, "foreground match:" + a.isFromStorage() + ":" + a.getReturnValue());
            });
            a.setStorable();
            $A.enqueueAction(a);
            var bgAction2 = this.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME;");
            $A.enqueueAction(bgAction2);
            this.addWaitForLog(cmp, 1, "foreground match:true:initial");
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([bgAction2]); });
            $A.test.addWaitFor(false, $A.test.isActionPending);
        }, function(cmp) {
            var that = this;
            // background refresh matches
            var a = this.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                that.log(cmp, "background match:" + a.isFromStorage() + ":" + a.getReturnValue());
            });
            a.setStorable();
            a.setBackground();
            $A.enqueueAction(a);
            var foreAction1 = this.getAction(cmp, "c.execute", "APPEND initial;RESUME;");
            $A.enqueueAction(foreAction1);
            this.addWaitForLog(cmp, 2, "background match:true:initial");
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([foreAction1]); });
        }, function(cmp) {
            var that = this;
            // foreground refresh differs
            var a = this.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                that.log(cmp, "foreground differs:" + a.isFromStorage() + ":" + a.getReturnValue());
            });
            a.setStorable();
            $A.enqueueAction(a);
            var bgAction3 = this.getAction(cmp, "c.executeBackground", "APPEND updated;RESUME;");
            $A.enqueueAction(bgAction3);
            this.addWaitForLog(cmp, 3, "foreground differs:true:initial");
            this.addWaitForLog(cmp, 4, "foreground differs:false:updated"); // from differing refresh
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([bgAction3]); });
        }, function(cmp) {
            var that = this;
            // background refresh differs
            var a = this.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                that.log(cmp, "background differs:" + a.isFromStorage() + ":" + a.getReturnValue());
            });
            a.setStorable();
            a.setBackground();
            $A.enqueueAction(a);
            $A.enqueueAction(this.getAction(cmp, "c.execute", "APPEND revised;RESUME;"));
            this.addWaitForLog(cmp, 5, "background differs:true:updated");
            this.addWaitForLog(cmp, 6, "background differs:false:revised"); // from differing refresh
        } ]
    },

    /*
     * Need identical params for storable actions so will rely on sleep to force overlap, since we only have 2 XHRs to
     * work with
     */
    testParallelStorable : {
        test : [ function(cmp) {
            var that = this;
            // prime storage
            var a = that.getAction(cmp, "c.execute", "STAMP;SLEEP 1000;READ;", function(a) {
                that.log(cmp, "prime:" + a.isFromStorage() + ":" + a.getReturnValue());
            });
            a.setStorable();
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() {
                var val = cmp.get("v.log")[0];
                if (val && val.indexOf("prime:false:") == 0) {
                    cmp._initialValue = val.substring("prime:false:".length);
                    return true;
                }
            });
        }, function(cmp) {
            var that = this;
            // queue up parallel storable actions
            var a = that.getAction(cmp, "c.execute", "STAMP;SLEEP 1000;READ;", function(a) {
                that.log(cmp, "foreground:" + a.isFromStorage() + ":" + a.getReturnValue());
            });
            a.setStorable();
            $A.enqueueAction(a);
            a = that.getAction(cmp, "c.execute", "STAMP;SLEEP 1000;READ;", function(a) {
                // can't guarantee ordering of response handling without a little help
                setTimeout(function() {
                    that.log(cmp, "background:" + a.isFromStorage() + ":" + a.getReturnValue());
                }, 500);
            });
            a.setStorable();
            a.setBackground();
            $A.enqueueAction(a);

            // both callbacks with stored value executed
            this.addWaitForLog(cmp, 1, "foreground:true:" + cmp._initialValue);
            this.addWaitForLog(cmp, 2, "background:true:" + cmp._initialValue);

            // both callbacks with refreshed value executed
            // ordering is not guaranteed
            $A.test.addWaitFor(true, function() {
                var logs = cmp.get("v.log");
                var val1 = logs[3];
                var val2 = logs[4];
                if (!val1 || !val2) {
                    return false;
                }

                var expected1 = "foreground:false:";
                var expected2 = "background:false:";
                var len = expected1.length; // ensure same length for both

                val1 = val1.substring(0, len);
                val2 = val2.substring(0, len);

                return ((val1 == expected1 && val2 == expected2) || (val1 == expected2 && val2 == expected1));
            });
        } ]
    },

    testAbortStorable : {
        test : [ function(cmp) {
            var that = this;

            // prime storage
            var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                that.log(cmp, "prime:" + a.isFromStorage() + ":" + a.getReturnValue());
            });
            a.setStorable({"refresh":0});
            $A.enqueueAction(a);
            $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME;"));
            this.addWaitForLog(cmp, 0, "prime:false:initial");
        }, function(cmp) {
            var that = this;
            $A.test.blockForegroundRequests();
            // queue up storable
            var a;

            a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                that.log(cmp, "store1:" + a.isFromStorage() + ":" + a.getReturnValue());
            });
            a.setStorable({"refresh":0});
            $A.enqueueAction(a);
            a = that.getAction(cmp, "c.execute", "RESUME back2;");
            $A.enqueueAction(a);
        }, function(cmp) {
            var that = this;
            // queue up another storable
            var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                that.log(cmp, "store2:" + a.isFromStorage() + ":" + a.getReturnValue());
            });
            a.setStorable({"refresh":0});
            $A.enqueueAction(a);
        }, function(cmp) {
            var that = this;
            // release
            $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back2;APPEND release;RESUME;"));
            $A.test.releaseForegroundRequests();
        }, function(cmp) {
            // only last queued storable was sent to server
            // however, we can possibly have a stored result execution, currently, it always occurs, but
            // that may change in the future.
            this.addWaitForLogRace(cmp, 1, 2, "store2:true:initial");
            this.addWaitForLogRace(cmp, 2, 3, "store2:false:release");
        } ]
    },


    /**
     * This test checks four things, all around abortion of an in-flight storable:
     * 1. The first time you get a storable, it does not come from storage
     * 2. The next time you get a storable, it comes from storage
     * 3. Writing while a storable is being processed aborts that storable. The aborted storable still returns and
     *    the returned value is stored, but callbacks are not called.
     * 4. Getting a storable after the write has completed returns a new value and that value does not come from
     *    storage.
     *
     *
     * Factors that made this test hard for me to understand:
     *
     *   The action returned by getAction is not the same as the actions passed to getAction's callback. This
     *   means, for example, that the action returned by getAction and the action passed to getAction's callback
     *   may have different returnValues.
     *
     *   When looking at what happens to an aborted action... Breaking in Action.prototype.updateFromResponse shows that
     *   one action does have its returnValue set to the value of the aborted actions response. However, this action is
     *   not the action returned by getAction nor is it one of the actions passed to getAction's callback.
     *
     *   Storing the returnValue of a completed action is asynchronous; therefore, getAction's callback cannot
     *   be used to make assertions about values in storage.
     */
    testAbortInFlightStorable : {
        test : [ function(cmp) {
            var that = this;
                // prime storage
                cmp._a = that.getAction(cmp, "c.execute", "WAIT fore;READ;");
                cmp._a.setStorable({'refresh':0});
                $A.enqueueAction(cmp._a);
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME fore;"));
        }, function(cmp) {
            var that = this;
            // First read comes from the server
            $A.test.addWaitFor(
                "false:initial",
                function() { return cmp._a.isFromStorage() + ":" +  cmp._a.getReturnValue(); },
                function () { that.log(cmp, "SUCCESS - initial value read from server"); }
            );
        }, function(cmp) {
                var that = this;
                // max out in-flight, to start queueing, and hold storable at server
                cmp._a = that.getAction(cmp, "c.execute", "WAIT fore;READ;");
                cmp._a.setStorable({'refresh': 0});
                $A.enqueueAction( cmp._a);
                cmp._storage = cmp._a.getStorage();
                cmp._key = cmp._a.getStorageKey();
        }, function(cmp) {
                var that = this;
                // Queue up second read
                // Make this action non-storable so that we can later check storage to see if the aborted action's value
                // was stored.
                $A.enqueueAction(that.getAction(cmp, "c.execute", "READ; RESUME back2;"));
                cmp._b = that.getAction(cmp, "c.execute", "WAIT fore;READ;");
                $A.enqueueAction( cmp._b);
        }, function(cmp) {
                var that = this;
                // Release
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND abortedValue;RESUME fore;"));
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back2;APPEND overwriteValue;RESUME fore;"));
        }, function(cmp) {
            var that = this;
            // A value that has already been fetched is read from storage
            $A.test.addWaitFor(
                "true:initial",
                function () { return  cmp._a.isFromStorage() + ":" + cmp._a.getReturnValue(); },
                function () { that.log(cmp, "SUCCESS - initial value read from storage"); }
            );

            // The new action shows a new value has been retrieved from the server.
            $A.test.addWaitFor(
                "false:overwriteValue",
                function() { return  cmp._b.isFromStorage() + ":" +  cmp._b.getReturnValue(); },
                function () { that.log(cmp, "SUCCESS - new value read from server"); }
            );
             var that = this;
            // The aborted action's response was stored
            var readAbortedValue = false;
            $A.test.addWaitFor(
                true,
                function () {
                    if (!cmp._storage) {
                        return false;
                    }

                    cmp._storage.get(cmp._key)
                        .then(function(item) {
                            readAbortedValue = item.value.returnValue[0] === "abortedValue";
                        });

                    return readAbortedValue;
                },
                function () { that.log(cmp, "SUCCESS - aborted value read from storage"); }
            );
        } ]
    },

    /**
     * Check the case where we abort an in-flight that is not the current action's parent
     */
    testAbortIfNotParentOf : {
        test : [ function(cmp) {
            // keep abortable in-flight
            cmp._aborted1 = false;
            var a = this.getAction(cmp, "c.execute", "WAIT testAbortIfNotParent;")
            a.setAbortable();
            a.setCallback(this, function (a) { cmp._aborted1 = true; }, "ABORTED");
            $A.enqueueAction(a);
        }, function(cmp) {
            // queue new unparented abortable
            var that = this;
            var a = this.getActionAndLog(cmp, "c.execute", "APPEND done; READ;", "bah");
            cmp._aborted2 = false;
            a.setCallback(this, function (a) { cmp._aborted2 = true; }, "ABORTED");
            a.setAbortable();
            $A.enqueueAction(a);

            // release held action
            var b = this.getAction(cmp, "c.executeBackground", "RESUME testAbortIfNotParent");
            $A.enqueueAction(b);
            this.addWaitForLog(cmp, 0, "bah: SUCCESS done");
        }, function(cmp) {
            $A.test.assertTrue(cmp._aborted1, "parent should have aborted");
            $A.test.assertFalse(cmp._aborted2, "new unparented action shouldn't abort");
        } ]
    },

    /**
     * Check the case where we do not abort the parent of a parented action.
     */
    testNoAbortIfParentOf : {
        test : [ function(cmp) {
            // keep abortable in-flight
            var a = this.getAction(cmp, "c.execute", "WAIT testNoAbortIfParent;")
            cmp._first_a = a;
            a.setAbortable();
            cmp._aborted1 = false;
            a.setCallback(this, function (a) { cmp._aborted1 = true; }, "ABORTED");
            $A.enqueueAction(a);
        }, function(cmp) {
            // queue new abortable whose parent is in-flight
            var that = this;
            var a = this.getActionAndLog(cmp, "c.execute", "APPEND done; READ;", "bah");
            cmp._aborted2 = false;
            a.setCallback(this, function (a) { cmp._aborted2 = true; }, "ABORTED");
            a.setAbortable();
            a.setParentAction(cmp._first_a);
            $A.enqueueAction(a);

            // queue new abortable whose parent is the new child
            var b = this.getActionAndLog(cmp, "c.execute", "APPEND finally; READ;", "really");
            cmp._aborted3 = false;
            b.setCallback(this, function (a) { cmp._aborted3 = true; }, "ABORTED");
            b.setAbortable();
            b.setParentAction(a);
            $A.enqueueAction(b);

            // release held action
            var b = this.getAction(cmp, "c.executeBackground", "RESUME testNoAbortIfParent;");
            $A.enqueueAction(b);
            $A.test.assertFalse(cmp._aborted1, "parent should not have been aborted");
            $A.test.assertFalse(cmp._aborted2, "parented action should not have been aborted");
            $A.test.assertFalse(cmp._aborted3, "granchild action should not have been aborted");
            this.addWaitForLog(cmp, 0, "bah: SUCCESS done");
            this.addWaitForLog(cmp, 1, "really: SUCCESS finally");
        }, function(cmp) {
            // last abortable should not have been aborted
            $A.test.assertFalse(cmp._aborted1, "parent should not have been aborted");
            $A.test.assertFalse(cmp._aborted2, "parented action should not have been aborted");
            $A.test.assertFalse(cmp._aborted3, "another parented action should not have been aborted");
        } ]
    },

    testAbortCallbackFromInflightAbort : {
        test : [ function(cmp) {
            // keep abortable in-flight
            var a = this.getAction(cmp, "c.execute", "WAIT testAbortOnEnqueueIfParentAborted;")
            cmp._first_a = a;
            a.setAbortable();
            cmp._aborted1 = false;
            a.setCallback(this, function (a) { cmp._aborted1 = true; }, "ABORTED");
            $A.enqueueAction(a);
        }, function(cmp) {
            // queue new unparented abortable
            var that = this;
            var a = this.getActionAndLog(cmp, "c.execute", "APPEND done; READ;", "bah");
            cmp._aborted2 = false;
            a.setCallback(this, function (a) { cmp._aborted2 = true; }, "ABORTED");
            a.setAbortable();
            $A.enqueueAction(a);

            // release held action
            var b = this.getAction(cmp, "c.executeBackground", "RESUME testAbortOnEnqueueIfParentAborted;");
            $A.enqueueAction(b);
            this.addWaitForLog(cmp, 0, "bah: SUCCESS done");
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([cmp._first_a, a, b]); },
                function() {
                    $A.test.assertEquals("ABORTED", cmp._first_a.getState());
                    $A.test.assertEquals(true, cmp._aborted1, "First action should have called aborted callback");
                    $A.test.assertEquals("SUCCESS", a.getState());
                    $A.test.assertEquals(false, cmp._aborted2, "Second action should not have called aborted callback");
                    $A.test.assertEquals("SUCCESS", b.getState());
                });
        }]
    },

    /**
     * If enqueing a parented action of an already "aborted" parent, it should be aborted.
     */
    testAbortOnEnqueueIfParentAborted : {
        test : [ function(cmp) {
            // keep abortable in-flight
            var a = this.getAction(cmp, "c.execute", "APPEND first; READ");
            cmp._tid = $A.getCurrentTransactionId();
            a.setAbortable();
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]) }, function() {
                    $A.test.assertEquals("SUCCESS", a.getState());
                });
        }, function(cmp) {
            // queue new unparented abortable
            var that = this;
            var a = this.getActionAndLog(cmp, "c.execute", "APPEND done; READ;", "second");
            a.setAbortable();
            $A.enqueueAction(a);
            this.addWaitForLog(cmp, 0, "second: SUCCESS done");
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]) }, function() {
                    $A.test.assertEquals("SUCCESS", a.getState());
                });
        }, function(cmp) {
            // queue up abortable parented to aborted action
            var a = this.getAction(cmp, "c.execute", "APPEND never; READ;");
            cmp._aborted = false;
            a.setCallback(this, function (a) { cmp._aborted = true; }, "ABORTED");
            a.setAbortable();
            $A.setCurrentTransactionId(cmp._tid);
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]) }, function() {
                    $A.test.assertEquals("ABORTED", a.getState());
                    $A.test.assertTrue(cmp._aborted, "parented action should have been aborted");
                });
        } ]
    },

    /**
     * If parented action is enqueued, but parent is aborted by a subsequent action, the parented action should be
     * aborted.
     */
    testAbortAfterEnqueueIfParentAborted : {
        test : [ function(cmp) {
            // Parent abortable stops on server.
            var a = this.getAction(cmp, "c.execute", "WAIT testAbortAfterEnqueueIfParentAborted;");
            cmp._first_a = a;
            a.setAbortable();
            cmp._aborted1 = false;
            a.setCallback(this, function (a) { cmp._aborted1 = true; }, "ABORTED");
            $A.enqueueAction(a);
        }, function(cmp) {
            $A.test.blockForegroundRequests();
            // queue up parented abortable
            var a = this.getActionAndLog(cmp, "c.execute", "APPEND next;READ;", "second");
            cmp._second_a = a;
            a.setAbortable();
            a.setParentAction(cmp._first_a);
            cmp._aborted2 = false;
            a.setCallback(this, function (a) { cmp._aborted2 = true; }, "ABORTED");
            $A.enqueueAction(a);
            // good so far
            $A.test.assertFalse(cmp._aborted1, "parent should not have been aborted");
            $A.test.assertFalse(cmp._aborted2, "parented action should not have been aborted");
        }, function(cmp) {
            // queue up new unparented abortable
            var b = this.getActionAndLog(cmp, "c.execute", "APPEND again;READ;", "third");
            cmp._second_a = b;
            b.setAbortable();
            cmp._aborted3 = false;
            b.setCallback(this, function (a) { cmp._aborted3 = true; }, "ABORTED");
            $A.enqueueAction(b);
            // parent and previous parented abortables are aborted (although parent abortable callback hasn't been called yet)
            $A.test.assertFalse(cmp._aborted1, "parent callback should not have been executed yet");
            $A.test.assertTrue(cmp._aborted2, "parented action should now have been aborted");
            $A.test.assertFalse(cmp._aborted3, "unparented action should not have been aborted");

            // queue up another parented abortable
            var a = this.getActionAndLog(cmp, "c.execute", "APPEND repeat;READ;", "fourth: ");
            cmp._second_a = a;
            a.setAbortable();
            a.setParentAction(cmp._first_a);
            cmp._aborted4 = false;
            a.setCallback(this, function (a) { cmp._aborted4 = true; }, "ABORTED");
            $A.enqueueAction(a);
            // this is aborted on enqueue
            $A.test.assertFalse(cmp._aborted1, "parent callback should still not have been executed yet");
            $A.test.assertTrue(cmp._aborted2, "parented action should have already been aborted");
            $A.test.assertFalse(cmp._aborted3, "unparented action should have remained not aborted");
            $A.test.assertTrue(cmp._aborted4, "new parented action should have been aborted");

            // release held action
            var b = this.getAction(cmp, "c.executeBackground", "RESUME testAbortAfterEnqueueIfParentAborted;");
            $A.enqueueAction(b);
            $A.test.releaseForegroundRequests();
            this.addWaitForLog(cmp, 0, "third: SUCCESS again");
        }, function(cmp) {
            // now parent's abortable callback has executed
            $A.test.assertTrue(cmp._aborted1, "parent should now be aborted");
            $A.test.assertTrue(cmp._aborted2, "parented action should have remained aborted");
            $A.test.assertFalse(cmp._aborted3, "unparented action should have remained not aborted");
            $A.test.assertTrue(cmp._aborted4, "new parented action should have remained aborted");
        } ]
    },

    /**
     * Test for an action that is parented to a storable action that gets refreshed.
     */
    testNoAbortIfParentIsRefresh : {
        test : [
            function(cmp) {
                // Put initial value into storage
                var initial = this.getAction(cmp, "c.execute", "APPEND parent; READ; RESUME testNoAbortIfParentIsRefreshRelease; WAIT testNoAbortIfParentIsRefresh;", function() {}, false, true);
                initial.setStorable({"refresh":0});
                $A.enqueueAction(initial);

                // Trick our next action into returning a different value so that we get a refresh.
                var done = false;
                var release = this.getAction(cmp, "c.execute", "WAIT testNoAbortIfParentIsRefreshRelease; RESUME testNoAbortIfParentIsRefresh; APPEND blah;", function() {
                    done = true;
                }, true);
                $A.enqueueAction(release);
                $A.test.addWaitFor(true, function() {
                    return done;
                });
            }, function(cmp) {
                var counter = 0;
                var that = this;
                // This action will load from storage first.
                var isChildQueued = false;
                var parent = this.getAction(cmp, "c.execute", "APPEND parent; READ; RESUME testNoAbortIfParentIsRefreshRelease; WAIT testNoAbortIfParentIsRefresh;", function(response) {
                        that.log(cmp, "parent" + counter++ + ": "+response.getReturnValue());
                        if (response.isFromStorage()) {
                            var child = that.getAction(cmp, "c.execute", "APPEND child; READ", function(childResponse) {
                                that.log(cmp, "child: " + childResponse.getReturnValue());
                            }, false, true);
                            child.setParentAction(response);
                            $A.enqueueAction(child);
                            isChildQueued = true;
                        }
                    }, false, true);
                parent.setCallback(cmp, function() {
                    that.log(cmp, "parent" + counter++ + ": ABORTED");
                }, "ABORTED");
                parent.setStorable({"refresh":0});
                $A.enqueueAction(parent);
                $A.test.addWaitFor(true, function() {
                    return isChildQueued;
                });
            }, function(cmp) {
                // Release refresh action
                var release = this.getAction(cmp, "c.execute", "RESUME testNoAbortIfParentIsRefresh; RESUME testNoAbortIfParentIsRefreshChild;", function() {}, true);
                $A.enqueueAction(release);

                // From the stored action
                this.addWaitForLog(cmp, 0, "parent0: parent");
                // From the refresh
                this.addWaitForLog(cmp, 1, "parent1: blah,parent");
                // and the second action
                this.addWaitForLog(cmp, 2, "child: child");
            }
        ]
    },
    /**
     * Test to ensure that if we enqueue an action from a rerender, we have current transaction set correctly.
     *
     * If this test fails because 'second' is aborted, we have lost the transaction id.
     */
    testNoAbortIfDoubleChained : {
        test : [
            function(cmp) {
                var that = this;
                var initial, second, third;
                second = that.getActionAndLog(cmp, "c.execute", "APPEND second; READ;", "second: ", false, true);
                third = that.getActionAndLog(cmp, "c.execute", "APPEND third; READ;", "third: ", false, true);
                initial = this.getAction(cmp, "c.execute", "APPEND initial; READ;",
                    function(a) {
                        that.log(cmp, "initial: "+a.getReturnValue());
                        $A.enqueueAction(second);
                        cmp._afterRenderCalls = [function() { $A.enqueueAction(third); }];
                        $A.enqueueAction(cmp.get("c.client"));
                    },
                    false, true);
                $A.enqueueAction(initial);
                $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([initial, second, third]); },
                    function () {
                        $A.test.assertEquals("SUCCESS", initial.getState());
                        $A.test.assertEquals("SUCCESS", second.getState());
                        $A.test.assertEquals("SUCCESS", third.getState());
                    });
            }
        ]
    }
})
