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
        $A.run(function() {
            $A.test.callServerAction($A.test.getAction(cmp, "c.execute", {
                "commands" : "RESET"
            }, function() {
                ready = true;
            }))
        });
        $A.test.addWaitFor(true, function() {
            return ready;
        });
    },

    log : function(cmp, msg) {
        var logValue = cmp.get("v.log");
        logValue.push(msg);
        cmp.set("v.log", logValue);
    },

    waitForLog : function(cmp, index, content) {
        var actual;
        $A.test.addWaitForWithFailureMessage(false,
                function() {
                    actual = cmp.get("v.log")?cmp.get("v.log")[index]:undefined;
                    return actual === undefined;
                },
                "Never received log message '" + content + "' at index " + index,
                function() {
                    $A.test.assertEquals(content, actual, "mismatch on log entry "+index);
                }
        );
    },

    /**
     * Wait for a log entry that will fall in a range due to race conditions.
     */
    waitForLogRace : function(cmp, index1, index2, content) {
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
                        'did not find '+content+' in:'+acc);
                }
        );
    },

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

    testEnqueueClientAction : {
        test : [ function(cmp) {
            //Action is enqueued but not executed
            $A.enqueueAction(cmp.get("c.client"));
            //Value change
            this.log(cmp, "log1");
            // client action will get called after the value change is processed above
            this.log(cmp, "log2");

            this.waitForLog(cmp, 0, "log1");
            this.waitForLog(cmp, 1, "client");
            this.waitForLog(cmp, 2, "log2");
        } ]
    },

    testMultipleCabooseActions : {
        test : [
            function(cmp) {
                var that = this;
                $A.run(function() {
                    $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back1;READ;", function(a) {
                        that.log(cmp, "back1:" + a.getReturnValue());
                    }));

                    // caboose action should not be run until another non-caboose foreground action runs
                    $A.enqueueAction(that.getAction(cmp, "c.executeCaboose", "APPEND caboose1;READ;", function(a) {
                        that.log(cmp, "caboose1:" + a.getReturnValue());
                    }));
                });
                // verify only background action ran
                this.waitForLog(cmp, 0, "back1:back1");
            },
            function(cmp) {
                var that = this;
                $A.run(function() {
                    $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back2;READ;", function(a) {
                        that.log(cmp, "back2:" + a.getReturnValue());
                    }));

                    // queue up a couple more caboose actions
                    $A.enqueueAction(that.getAction(cmp, "c.executeCaboose", "APPEND caboose2;READ;", function(a) {
                        that.log(cmp, "caboose2:" + a.getReturnValue());
                    }));
                    $A.enqueueAction(that.getAction(cmp, "c.executeCaboose", "APPEND caboose3;READ;", function(a) {
                        that.log(cmp, "caboose3:" + a.getReturnValue());
                    }));
                });
                // verify only background action ran (still)
                this.waitForLog(cmp, 1, "back2:back2");
            },
            function(cmp) {
                var that = this;
                $A.run(function() {
                    $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;READ;", function(a) {
                        that.log(cmp, "fore1:" + a.getReturnValue());
                    }));
                });
                // new foreground action should flush out all pending caboose actions
                this.waitForLog(cmp, 2, "caboose1:caboose1");
                this.waitForLog(cmp, 3, "caboose2:caboose2");
                this.waitForLog(cmp, 4, "caboose3:caboose3");
                this.waitForLog(cmp, 5, "fore1:fore1");
            }
        ]
    },

    /**
     * Verify a pending caboose action is not ran when a client action is ran. Caboose actions should wait until
     * another foreground action is sent to the server.
     */
    testCabooseWithClientAction : {
        test : [
            function(cmp) {
                var that = this;
                $A.run(function() {
                    $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back1;READ;", function(a) {
                        that.log(cmp, "back1:" + a.getReturnValue());
                    }));

                    // queue up caboose action
                    $A.enqueueAction(that.getAction(cmp, "c.executeCaboose", "APPEND caboose1;READ;", function(a) {
                        that.log(cmp, "caboose1:" + a.getReturnValue());
                    }));
                });
                // verify only background action ran
                this.waitForLog(cmp, 0, "back1:back1");
            },
            function(cmp) {
                var that = this;
                $A.enqueueAction(cmp.get("c.client"));
                this.log(cmp, "log1");

                // verify client actions ran but did not cause caboose action to run
                this.waitForLog(cmp, 1, "log1");
                this.waitForLog(cmp, 2, "client");
            }
        ]
    },

    testBackgroundCabooseAction : {
        test : [
            function(cmp) {
                var that = this;
                $A.run(function() {
                    $A.enqueueAction(that.getAction(cmp, "c.executeCaboose", "APPEND cabooseAndBack1;READ;", function(a) {
                        that.log(cmp, "cabooseAndBack1:" + a.getReturnValue());
                    }, true));
                });
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back1;READ;", function(a) {
                        that.log(cmp, "back1:" + a.getReturnValue());
                    }));
                // verify background action ran, even though it is marked as caboose
                this.waitForLogRace(cmp, 0, 1, "cabooseAndBack1:cabooseAndBack1");
                this.waitForLogRace(cmp, 0, 1, "back1:back1");
            }
        ]
    },

    /**
     * The "allAboardCallback" should be called before the XHR containing the associated action is sent to the server.
     * Note that since the caboose actions will be sent in the same XHR request as the regular foreground action, all
     * 3 allAboard callbacks will be called prior to any of the completed action callbacks.
     */
    testMultipleAllAboardCallbacks : {
        test : [
            function(cmp) {
                var that = this;
                $A.run(function() {
                    $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back1;READ;", function(a) {
                        that.log(cmp, "back1:" + a.getReturnValue());
                    }));

                    $A.enqueueAction(that.getAction(cmp, "c.executeCaboose", "APPEND caboose1;READ;", function(a) {
                        that.log(cmp, "caboose1:" + a.getReturnValue());
                    }, false, false, function() {
                        this.log(cmp, "allAboardCaboose1");
                    }));
                    $A.enqueueAction(that.getAction(cmp, "c.executeCaboose", "APPEND caboose2;READ;", function(a) {
                        that.log(cmp, "caboose2:" + a.getReturnValue());
                    }, false, false, function() {
                        this.log(cmp, "allAboardCaboose2");
                    }));
                });
                // only background action should have run
                this.waitForLog(cmp, 0, "back1:back1");
            },
            function(cmp){
                var that = this;
                $A.run(function(){
                    $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;READ;", function(a){
                        that.log(cmp, "fore1:" + a.getReturnValue());
                    }, false, false, function(){
                        this.log(cmp, "allAboardFore");
                    }));
                });
                // verify allAboardCallback's are called before their associated actions complete
                this.waitForLog(cmp, 1, "allAboardCaboose1");
                this.waitForLog(cmp, 2, "allAboardCaboose2");
                this.waitForLog(cmp, 3, "allAboardFore");
                this.waitForLog(cmp, 4, "caboose1:caboose1");
                this.waitForLog(cmp, 5, "caboose2:caboose2");
                this.waitForLog(cmp, 6, "fore1:fore1");
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
                $A.run(function() {
                    var a;
                    a = that.getAction(cmp, "c.executeCaboose", "APPEND caboose1;READ;", function(a) {
                        that.log(cmp, "caboose1:" + a.getReturnValue());
                    }, false, false, function() {
                        this.log(cmp, "allAboardCallback");
                        a.setParam("commands", "APPEND " + document.__testLogger + ";READ;");
                    });
                    $A.enqueueAction(a);
                });
            },
            function(cmp) {
                var that = this;
                document.__testLogger = document.__testLogger + ",updatedString";
                $A.run(function() {
                    $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;READ;", function(a){
                        that.log(cmp, "fore1:" + a.getReturnValue());
                    }));
                });
                this.waitForLog(cmp, 0, "allAboardCallback");
                this.waitForLog(cmp, 1, "caboose1:initialString,updatedString");
                this.waitForLog(cmp, 2, "fore1:fore1");
            }
        ]
    },

    /**
     * currently 3 background actions can be in-flight.
     *
     * The methodology:
     *  - queue up N+1 background processes. when the last one does not wait.
     *  - Use a foreground process to kick off one of the backgrounds, causing the last one to fire as well.
     */
    testMaxNumBackgroundServerAction : {
        test : [
            function(cmp) {
                var that = this;
                $A.run(function() {
                    // 
                    // Fire off N=3 background processes that wait, force an ordering via RESUMES.
                    // WAIT/RESUME naming: back<n>.{w=write, e=execute}
                    $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                            "APPEND back1; RESUME back2.w; WAIT back1.e;",
                            function(a) {
                                that.log(cmp, "back1:" + a.getReturnValue());
                            }));
                    $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                            "WAIT back2.w; APPEND back2; RESUME back3.w; WAIT back2.e; APPEND back2.e;", function(a) {
                        that.log(cmp, "back2:" + a.getReturnValue());
                    }));
                    $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                            "WAIT back3.w; APPEND back3; READ; RESUME fore1.w; WAIT back3.e;",
                            function(a) {
                                that.log(cmp, "back3:" + a.getReturnValue());
                            }));

                    // queue up the non-waiting background action.
                    $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                            "READ; APPEND back4; RESUME fore1.e",
                            function(a) {
                                that.log(cmp, "back4:" + a.getReturnValue());
                            }));
                });

                //
                // This is in a separate block so that we ensure that all the background actions
                // fire first. In this case, allowing too many background actions will fail the test
                // rather than running a race.
                //
                $A.run(function() {
                    // fire foreground action that completes independently, and starts off back1.
                    $A.enqueueAction(that.getAction(cmp,
                            "c.execute", "WAIT fore1.w; APPEND fore1; READ; RESUME back1.e; WAIT fore1.e",
                            function(a) {
                                that.log(cmp, "fore1:" + a.getReturnValue());
                            }));
                });
                // back1 must finish before back4 starts!
                this.waitForLog(cmp, 0, "back1:");
                
                // back4 & fore1 are in a race 
                this.waitForLogRace(cmp, 1, 2, "fore1:fore1");
                this.waitForLogRace(cmp, 1, 2, "back4:");

                // back 2 & 3 are waiting.

            }, function(cmp) {
                var that = this;
                // fire foreground action that should complete, and read out pending text.
                $A.run(function() {
                    $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2; READ;",
                            function(a) {
                                that.log(cmp, "fore2:" + a.getReturnValue());
                            }));
                });
                this.waitForLog(cmp, 3, "fore2:back4,fore2");
            }, function(cmp) {
                var that = this;
                // now release back2
                $A.run(function() {
                    $A.enqueueAction(that.getAction(cmp, "c.execute", "RESUME back2.e"));
                })
                this.waitForLog(cmp, 4, "back2:");
            }, function(cmp) {
                var that = this;
                // now release back3, reading out the text
                $A.run(function() {
                    $A.enqueueAction(that.getAction(cmp, "c.execute", "READ; RESUME back3.e",
                            function(a) {
                                that.log(cmp, "fore3:" + a.getReturnValue());
                            }));
                });
                this.waitForLogRace(cmp, 5, 6, "fore3:back2.e");
                this.waitForLogRace(cmp, 5, 6, "back3:back1,back2,back3");
            } ]
    },

    testBackgroundClientActionNotQueued : {
        test : [
                function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // fill up background action queue
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                                "WAIT back1", function(a) {
                                    that.log(cmp, "back1:" + a.getReturnValue());
                                }));
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                                "WAIT back2", function(a) {
                                    that.log(cmp, "back2:" + a.getReturnValue());
                                }));
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                                "WAIT back3;READ", function(a) {
                                    that.log(cmp, "back3:" + a.getReturnValue());
                                }));
                    });
                    $A.run(function() {
                        // queue up a background client action
                        var a = cmp.get("c.client");
                        a.setBackground();
                        $A.enqueueAction(a);
                    });
                    // client action executed immediately even if "background"
                    this.waitForLog(cmp, 0, "client");
                }, function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // flush out background actions
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "RESUME back1;SLEEP 200;RESUME back2;SLEEP 200;RESUME back3;", function(a) {
                            that.log(cmp, "fore1:" + a.getReturnValue());
                        }));
                    });
                    // The foreground and all 3 background actions are in a race to finish
                    this.waitForLogRace(cmp, 1, 4, "fore1:");
                    this.waitForLogRace(cmp, 1, 4, "back1:");
                    this.waitForLogRace(cmp, 1, 4, "back2:");
                    this.waitForLogRace(cmp, 1, 4, "back3:");
                } ]
    },

    /* currently only 1 foreground action can be in-flight */
    testMaxNumForegroundServerAction : {
        test : [
                function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // fire first foreground action that waits for trigger
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;RESUME back1;WAIT fore1;READ;",
                                function(a) {
                                    that.log(cmp, "fore1:" + a.getReturnValue());
                                }));
                        // queue up another foreground action
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
                            that.log(cmp, "fore2:" + a.getReturnValue());
                        }));

                        // fire background action that completes independently
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back1;APPEND back1;READ;",
                                function(a) {
                                    that.log(cmp, "back1:" + a.getReturnValue());
                                }));
                    }); // check that only the first foreground action was received by the server
                    this.waitForLog(cmp, 0, "back1:fore1,back1");
                }, function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // fire background action that releases pending actions
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back2;RESUME fore1;"));
                    });
                    this.waitForLog(cmp, 1, "fore1:back2");
                    this.waitForLog(cmp, 2, "fore2:fore2");
                } ]
    },

    testPollSingleBackgroundAction : {
        test : [
                function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // fire first background action that waits for trigger
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                                "APPEND back1;RESUME fore1;WAIT back1;READ;", function(a) {
                                    that.log(cmp, "back1:" + a.getReturnValue());
                                }));
                        // fire foreground action that completes independently
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "WAIT fore1;APPEND fore1;READ;", function(a) {
                            that.log(cmp, "fore1:" + a.getReturnValue());
                        }));
                    });
                    // check that only the first background action was received by the server at first
                    this.waitForLog(cmp, 0, "fore1:back1,fore1");
                },
                function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // queue up 2 background actions, making the second one wait.
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                                "APPEND back2;RESUME fore2;WAIT back2; READ; RESUME back3;",
                                function(a) {
                                    that.log(cmp, "back2:" + a.getReturnValue());
                                }));
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                                "WAIT back3; SLEEP 1000;APPEND back3; READ;", function(a) {
                            that.log(cmp, "back3:" + a.getReturnValue());
                        }));

                        // fire foreground action that completes independently, then release background
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "WAIT fore2;APPEND fore2;READ;", function(a) {
                            that.log(cmp, "fore2:" + a.getReturnValue());
                            $A.enqueueAction(that.getAction(cmp, "c.execute", "RESUME back1;"));
                        }));
                    });
                    // check that only the first background action was received by the server at first
                    this.waitForLog(cmp, 1, "fore2:back2,fore2");
                    this.waitForLog(cmp, 2, "back1:");
                }, function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // fire foreground action that completes independently, then release background
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore3;READ;", function(a) {
                            that.log(cmp, "fore3:" + a.getReturnValue());
                            $A.enqueueAction(that.getAction(cmp, "c.execute", "RESUME back2;"));
                        }));
                    });
                    // check that only the second background action was received by the server next
                    this.waitForLog(cmp, 3, "fore3:fore3");
                    this.waitForLog(cmp, 4, "back2:");
                    // check that final background action was received by the server
                    this.waitForLog(cmp, 5, "back3:back3");
                } ]
    },

    testPollBatchedForegroundAction : {
        test : [
                function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // max out in-flight foreground actions
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;RESUME back1;WAIT fore1;READ;",
                                function(a) {
                                    that.log(cmp, "fore1:" + a.getReturnValue());
                                }));
                        // fire background action that completes independently
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back1;APPEND back1;READ;",
                                function(a) {
                                    that.log(cmp, "back1:" + a.getReturnValue());
                                }));
                    });
                    // check that only the first foreground action was received by the server at first
                    this.waitForLog(cmp, 0, "back1:fore1,back1");
                },
                function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // queue up 3 foreground actions
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
                            that.log(cmp, "fore2:" + a.getReturnValue());
                        }));
                    });
                    $A.run(function() {
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore3;WAIT fore3;READ;", function(a) {
                            that.log(cmp, "fore3:" + a.getReturnValue());
                        }));
                    });
                    $A.run(function() {
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore4;READ;", function(a) {
                            that.log(cmp, "fore4:" + a.getReturnValue());
                        }));

                    });
                    $A.run(function() {
                        // fire background action, then release first foreground action
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back2;READ;", function(a) {
                            that.log(cmp, "back2:" + a.getReturnValue());
                            $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME fore1;"));
                        }));
                    });
                    // check that only the first foreground action was received by the server at first
                    this.waitForLog(cmp, 1, "back2:back2");
                    this.waitForLog(cmp, 2, "fore1:");
                },
                function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // queue up another batch, not added to prior batch that was already sent
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore5;READ;", function(a) {
                            that.log(cmp, "fore5:" + a.getReturnValue());
                        }));
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore6;RESUME back4;WAIT fore6;READ;",
                                function(a) {
                                    that.log(cmp, "fore6:" + a.getReturnValue());
                                }));
                        // fire background action, then release pending foreground batch
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back3;READ;", function(a) {
                            that.log(cmp, "back3:" + a.getReturnValue());
                            $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME fore3;"));
                        }));
                    });
                    // check that only the foreground batch was received by the server
                    this.waitForLog(cmp, 3, "back3:fore3,back3");
                    this.waitForLog(cmp, 4, "fore2:fore2");
                    this.waitForLog(cmp, 5, "fore3:");
                    this.waitForLog(cmp, 6, "fore4:fore4");
                },
                function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // fire background action, then release remaining foreground batch
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back4;APPEND back4;READ;",
                                function(a) {
                                    that.log(cmp, "back4:" + a.getReturnValue());
                                    $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME fore6;"));
                                }));
                    });
                    // check that the foreground batch was received by the server
                    this.waitForLog(cmp, 7, "back4:fore6,back4");
                    this.waitForLog(cmp, 8, "fore5:fore5");
                    this.waitForLog(cmp, 9, "fore6:");
                } ]
    },

    testAbortQueuedAbortable : {
        test : [ function(cmp) {
            var that = this;
            // max out in-flight, to start queueing
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.execute", "WAIT fore1;APPEND fore1;READ;", function(a) {
                    that.log(cmp, "fore1:" + a.getReturnValue());
                }, false, false));
            });
            // abort abortable action followed by batch with abortables
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
                    that.log(cmp, "fore2:" + a.getReturnValue());
                }, false, true));
            });
            // abort abortable actions in batch followed by batch with abortables
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore3;READ;", function(a) {
                    that.log(cmp, "fore3:" + a.getReturnValue());
                }, false, true));
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore4;READ;", function(a) {
                    that.log(cmp, "fore4:" + a.getReturnValue());
                }, false, false));
            });
            // don't abort abortable actions in batch followed by batch without abortables
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore5;READ;", function(a) {
                    that.log(cmp, "fore5:" + a.getReturnValue());
                }, false, true));
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore6;READ;", function(a) {
                    that.log(cmp, "fore6:" + a.getReturnValue());
                }, false, true));
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore7;READ;", function(a) {
                    that.log(cmp, "fore7:" + a.getReturnValue());
                }, false, false));
            });
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore8;READ;", function(a) {
                    that.log(cmp, "fore8:" + a.getReturnValue());
                }, false, false));
            });
            // release queue
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME fore1;"));
            });

            this.waitForLog(cmp, 0, "fore1:fore1");
            this.waitForLog(cmp, 1, "fore4:fore4");
            this.waitForLog(cmp, 2, "fore5:fore5");
            this.waitForLog(cmp, 3, "fore6:fore6");
            this.waitForLog(cmp, 4, "fore7:fore7");
            this.waitForLog(cmp, 5, "fore8:fore8");
        } ]
    },

    testAbortInFlightAbortable : {
        test : function(cmp) {
            var that = this;
            // hold abortable at server
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;RESUME back1;WAIT fore1;READ;",
                        function(a) {
                            that.log(cmp, "fore1:" + a.getReturnValue());
                        }, false, true));
            });
            // queue another abortable action
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
                    that.log(cmp, "fore2:" + a.getReturnValue());
                }, false, true));
            });
            // check initial abortable received at server
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                        "WAIT back1;APPEND back1;READ;RESUME back2;",
                        function(a) {
                            that.log(cmp, "back1:" + a.getReturnValue());
                        }, true));
            });
            // release in-flight action
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                        "WAIT back2; SLEEP 1000; APPEND back2;READ;RESUME fore1;",
                        function(a) {
                            that.log(cmp, "back2:" + a.getReturnValue());
                        }, true));
            });
            // callback of initial abortable action is aborted
            this.waitForLog(cmp, 0, "back1:fore1,back1");
            this.waitForLog(cmp, 1, "back2:back2");
            this.waitForLog(cmp, 2, "fore2:fore2");
        }
    },

    testStorableRefresh : {
        test : [ function(cmp) {
            var that = this;
            $A.run(function() {
                // prime storage
                var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                    that.log(cmp, "prime:" + a.isFromStorage() + ":" + a.getReturnValue());
                });
                a.setStorable();
                $A.enqueueAction(a);
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME;", "bgAction1"));
            });
            this.waitForLog(cmp, 0, "prime:false:initial");
            // This test assumes actions from each test stage are complete before moving on to the next stage. So we
            // need to wait on actions that don't log to the screen. On slower browsers without the wait the actions
            // get backed up and begin aborting themselves, causing the test to fail.
            $A.test.addWaitForAction(true, "bgAction1");
        }, function(cmp) {
            var that = this;
            $A.run(function() {
                // foreground refresh matches
                var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                    that.log(cmp, "foreground match:" + a.isFromStorage() + ":" + a.getReturnValue());
                });
                a.setStorable();
                $A.enqueueAction(a);
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME;", "bgAction2"));
            });
            this.waitForLog(cmp, 1, "foreground match:true:initial");
            $A.test.addWaitForAction(true, "bgAction2");
        }, function(cmp) {
            var that = this;
            $A.run(function() {
                // background refresh matches
                var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                    that.log(cmp, "background match:" + a.isFromStorage() + ":" + a.getReturnValue());
                });
                a.setStorable();
                a.setBackground();
                $A.enqueueAction(a);
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND initial;RESUME;", "foreAction1"));
            });
            this.waitForLog(cmp, 2, "background match:true:initial");
            $A.test.addWaitForAction(true, "foreAction1");
        }, function(cmp) {
            var that = this;
            $A.run(function() {
                // foreground refresh differs
                var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                    that.log(cmp, "foreground differs:" + a.isFromStorage() + ":" + a.getReturnValue());
                });
                a.setStorable();
                $A.enqueueAction(a);
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND updated;RESUME;", "bgAction3"));
            });
            this.waitForLog(cmp, 3, "foreground differs:true:initial");
            this.waitForLog(cmp, 4, "foreground differs:false:updated"); // from differing refresh
            $A.test.addWaitForAction(true, "bgAction3");
        }, function(cmp) {
            var that = this;
            $A.run(function() {
                // background refresh differs
                var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                    that.log(cmp, "background differs:" + a.isFromStorage() + ":" + a.getReturnValue());
                });
                a.setStorable();
                a.setBackground();
                $A.enqueueAction(a);
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND revised;RESUME;"));
            });
            this.waitForLog(cmp, 5, "background differs:true:updated");
            this.waitForLog(cmp, 6, "background differs:false:revised"); // from differing refresh
        } ]
    },

    /*
     * Need identical params for storable actions so will rely on sleep to force overlap, since we only have 2 XHRs to
     * work with
     */
    testParallelStorable : {
        test : [ function(cmp) {
            var that = this;
            $A.run(function() {
                // prime storage
                var a = that.getAction(cmp, "c.execute", "STAMP;SLEEP 1000;READ;", function(a) {
                    that.log(cmp, "prime:" + a.isFromStorage() + ":" + a.getReturnValue());
                });
                a.setStorable();
                $A.enqueueAction(a);
            });
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

            // send off actions
            $A.run(function() {
            });

            // both callbacks with stored value executed
            this.waitForLog(cmp, 1, "foreground:true:" + cmp._initialValue);
            this.waitForLog(cmp, 2, "background:true:" + cmp._initialValue);

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
            $A.run(function() {
                // prime storage
                var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                    that.log(cmp, "prime:" + a.isFromStorage() + ":" + a.getReturnValue());
                });
                a.setStorable({"refresh":0});
                $A.enqueueAction(a);
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME;"));
            });
            this.waitForLog(cmp, 0, "prime:false:initial");
        }, function(cmp) {
            var that = this;
            // max out in-flight, to start queueing
            $A.run(function() {
                var a = that.getAction(cmp, "c.execute", "WAIT;");
                $A.enqueueAction(a);
            });
            // queue up storable
            $A.run(function() {
                var a;

                a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                    that.log(cmp, "store1:" + a.isFromStorage() + ":" + a.getReturnValue());
                });
                a.setStorable({"refresh":0});
                $A.enqueueAction(a);
                a = that.getAction(cmp, "c.execute", "RESUME back2;");
                $A.enqueueAction(a);
            });
            // queue up another storable
            $A.run(function() {
                var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
                    that.log(cmp, "store2:" + a.isFromStorage() + ":" + a.getReturnValue());
                });
                a.setStorable({"refresh":0});
                $A.enqueueAction(a);
            });
            // release
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME;"));
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back2;APPEND release;RESUME;"));
            });

            // only last queued storable was sent to server
            this.waitForLog(cmp, 1, "store2:true:initial");
            this.waitForLog(cmp, 2, "store2:false:release");
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
            var a;
            $A.run(function() {
                // prime storage
                a = that.getAction(cmp, "c.execute", "WAIT fore;READ;");
                a.setStorable({'refresh':0});
                $A.enqueueAction(a);
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME fore;"));
            });

            // First read comes from the server
            $A.test.addWaitFor(
                "false:initial",
                function() { return a.isFromStorage() + ":" + a.getReturnValue(); },
                function () { that.log(cmp, "SUCCESS - initial value read from server"); }
            );
        }, function(cmp) {
            var that = this;
            var a;
            var storage;
            var key;
            // max out in-flight, to start queueing, and hold storable at server
            $A.run(function () {
                a = that.getAction(cmp, "c.execute", "WAIT fore;READ;");
                a.setStorable({'refresh': 0});
                $A.enqueueAction(a);
                storage = a.getStorage();
                key = a.getStorageKey();
            });

            // Queue up second read
            // Make this action non-storable so that we can later check storage to see if the aborted action's value
            // was stored.
            var b;
            $A.run(function () {
                $A.enqueueAction(that.getAction(cmp, "c.execute", "READ; RESUME back2;"));
                b = that.getAction(cmp, "c.execute", "WAIT fore;READ;");
                $A.enqueueAction(b);
            });

            // Release
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND abortedValue;RESUME fore;"));
                $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back2;APPEND overwriteValue;RESUME fore;"));
            });

            // A value that has already been fetched is read from storage
            $A.test.addWaitFor(
                "true:initial",
                function () { return a.isFromStorage() + ":" + a.getReturnValue(); },
                function () { that.log(cmp, "SUCCESS - initial value read from storage"); }
            );
            
            // The new action shows a new value has been retrieved from the server.
            $A.test.addWaitFor(
                "false:overwriteValue",
                function() { return b.isFromStorage() + ":" + b.getReturnValue(); },
                function () { that.log(cmp, "SUCCESS - new value read from server"); }
            );

            // The aborted action's response was stored
            var readAbortedValue = false;
            $A.test.addWaitFor(
                true,
                function () {
                    if (!storage) {
                        return false;
                    }

                    storage.get(key)
                        .then(function(item) {
                            readAbortedValue = item.value.returnValue[0] === "abortedValue";
                        });

                    return readAbortedValue;
                },
                function () { that.log(cmp, "SUCCESS - aborted value read from storage"); }
            );
        } ]
    },

    testRunActionsForcesQueue : {
        test : [ function(cmp) {
            var that = this;
            // queue up foreground action
            $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;READ;", function(a) {
                that.log(cmp, "fore1:" + a.getReturnValue());
            }));

            $A.clientService.runActions([ that.getAction(cmp, "c.execute", "APPEND run1;READ;APPEND afterRun1;",
                    function(a) {
                        that.log(cmp, "run1:" + a.getReturnValue());
                    }) ], cmp, function(a) {
                that.log(this, "run1 callback");
            });

            // queue up foreground action
            $A.run(function() {
                $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
                    that.log(cmp, "fore2:" + a.getReturnValue());
                }));
            });

            this.waitForLog(cmp, 0, "fore1:fore1");
            this.waitForLog(cmp, 1, "run1:run1");
            this.waitForLog(cmp, 2, "run1 callback");
            this.waitForLog(cmp, 3, "fore2:afterRun1,fore2");
        } ]
    },

    testRunActionsWithoutBypass : {
        test : [
                function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // setup max in-flight foreground actions
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;RESUME back1;WAIT fore1;READ;",
                                function(a) {
                                    that.log(cmp, "fore1:" + a.getReturnValue());
                                }));

                        // queue up another action
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
                            that.log(cmp, "fore2:" + a.getReturnValue());
                        }));

                        // check pending actions
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back1;APPEND back1;READ;",
                                function(a) {
                                    that.log(cmp, "back1:" + a.getReturnValue());
                                }));
                    });
                    this.waitForLog(cmp, 0, "back1:fore1,back1");
                },
                function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // runActions will queue because already at max in-flight foreground actions
                        $A.clientService.runActions([
                                that.getAction(cmp, "c.execute", "APPEND run1;READ;", function(a) {
                                    that.log(cmp, "run1:" + a.getReturnValue());
                                }), that.getAction(cmp, "c.executeBackground", "APPEND run2;READ;", function(a) {
                                    that.log(cmp, "run2:" + a.getReturnValue());
                                }) ], cmp, function(a) {
                            that.log(this, "run1 callback");
                        });
                    });
                    // background action in set is processed because background is not blocked
                    // foreground action is queued
                    this.waitForLog(cmp, 1, "run2:run2");
                }, function(cmp) {
                    var that = this;
                    $A.run(function() {
                        // flush pending
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME fore1;"));
                    });
                    this.waitForLog(cmp, 2, "fore1:");
                    this.waitForLog(cmp, 3, "fore2:fore2");
                    this.waitForLog(cmp, 4, "run1:run1");
                    this.waitForLog(cmp, 5, "run1 callback");
                } ]
    },

    testRunActionsQueued : {
        test : [
                function(cmp) {
                    var that = this;
                    var cmp = cmp;
                    // setup max in-flight foreground actions
                    $A.clientService.runActions([ that.getAction(cmp, "c.execute",
                            "RESUME back1;APPEND run1;WAIT run1;READ;", function(a) {
                                that.log(cmp, "run1:" + a.getReturnValue());
                            }) ], cmp, function(a) {
                        that.log(this, "run1 callback");
                    });

                    // following runActions are now queued after max in-flight actions reached
                    $A.clientService.runActions([ that.getAction(cmp, "c.execute", "APPEND run2;WAIT run2;READ;",
                            function(a) {
                                that.log(cmp, "run2:" + a.getReturnValue());
                            }) ], cmp, function(a) {
                        that.log(this, "run2 callback");
                    });
                    $A.clientService.runActions([ that.getAction(cmp, "c.execute", "APPEND run3;WAIT run3;READ;",
                            function(a) {
                                that.log(cmp, "run3:" + a.getReturnValue());
                            }) ], cmp, function(a) {
                        that.log(this, "run3 callback");
                    });

                    $A.run(function() {
                        // queue up another action
                        $A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;WAIT fore1;READ;", function(a) {
                            that.log(cmp, "fore1:" + a.getReturnValue());
                        }));

                        // check pending action(s)
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back1;APPEND back1;READ;",
                                function(a) {
                                    that.log(cmp, "back1:" + a.getReturnValue());
                                }));
                    });
                    this.waitForLog(cmp, 0, "back1:run1,back1");
                },
                function(cmp) {
                    var that = this;
                    var cmp = cmp;
                    $A.run(function() {
                        // release in-flight actions
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                                "RESUME run1;SLEEP 1000;APPEND back2;READ;", function(a) {
                                    that.log(cmp, "back2:" + a.getReturnValue());
                                }));
                    });
                    this.waitForLog(cmp, 1, "run1:");
                    this.waitForLog(cmp, 2, "run1 callback");
                    this.waitForLog(cmp, 3, "back2:run2,back2");
                },
                function(cmp) {
                    var that = this;
                    var cmp = cmp;
                    $A.run(function() {
                        // release next action, but pending ones were batched
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                                "APPEND back3;RESUME run2;SLEEP 1000;READ;", function(a) {
                                    that.log(cmp, "back3:" + a.getReturnValue());
                                }));
                    });
                    this.waitForLog(cmp, 4, "back3:run3");
                },
                function(cmp) {
                    var that = this;
                    var cmp = cmp;
                    $A.run(function() {
                        // release next action, batch still not complete
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                                "APPEND back4;RESUME run3;SLEEP 1000;READ;", function(a) {
                                    that.log(cmp, "back4:" + a.getReturnValue());
                                }));
                    });
                    this.waitForLog(cmp, 5, "back4:fore1");
                },
                function(cmp) {
                    var that = this;
                    var cmp = cmp;
                    $A.run(function() {
                        // release last in batch
                        $A.enqueueAction(that.getAction(cmp, "c.executeBackground",
                                "APPEND back5;RESUME fore1;SLEEP 1000;READ;", function(a) {
                                    that.log(cmp, "back5:" + a.getReturnValue());
                                }));
                    });
                    this.waitForLog(cmp, 6, "run2:back3");
                    this.waitForLog(cmp, 7, "run2 callback");
                    this.waitForLog(cmp, 8, "run3:back4");
                    this.waitForLog(cmp, 9, "run3 callback");
                    this.waitForLog(cmp, 10, "fore1:back5");
                    this.waitForLog(cmp, 11, "back5:");
                } ]
    }
})
