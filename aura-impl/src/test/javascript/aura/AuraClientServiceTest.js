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
Function.RegisterNamespace("Test.Aura");

[ Fixture ]
Test.Aura.AuraClientServiceTest = function() {
	// Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
	Mocks.GetMock(Object.Global(), "exp", function() {
	})(function() {
		// #import aura.AuraClientService
	});

	var mockGlobal = Mocks.GetMocks(Object.Global(), {
		"$A" : {
			ns : {
				Util : {
					prototype : {
						on : function() {
						}
					}
				}
			},
			assert : function() {
			},
			util : {
				isUndefinedOrNull : function() {
				},
				isUndefined : function() {
				},
				isArray : function() {
				}
			},
			mark : function() {
			}
		},
		"window" : {},
		"exp" : function() {
		}
	});

	var MockAction = function(type) {
        this.auraType = "Action";
        this.setBackground = Stubs.GetMethod();
        if (type === undefined) {
            type = "server";
        }
        this.isAbortable = Stubs.GetMethod(false);
        this.isCaboose = Stubs.GetMethod(false);
        this.isBackground = Stubs.GetMethod(false);
        this.runDeprecated = Stubs.GetMethod();
        this.addCallbackGroup = Stubs.GetMethod();
        this.abort = Stubs.GetMethod();
        this.getDef = Stubs.GetMethod({
            isClientAction : Stubs.GetMethod(true),
            isServerAction : Stubs.GetMethod(false)
        });
        var sdef = Stubs.GetMethod({
            isClientAction : Stubs.GetMethod(false),
            isServerAction : Stubs.GetMethod(true)
        });
        if (type === "clientbackground") {
            this.isBackground = Stubs.GetMethod(true);
        } else if (type === "server") {
            this.getDef = sdef;
        } else if (type === "serverbackground") {
            this.getDef = sdef;
            this.isBackground = Stubs.GetMethod(true);
        } else if (type === "serverabortable") {
            this.getDef = sdef;
            this.isAbortable = Stubs.GetMethod(true);
        } else if (type === "serverforceboxcar") {
            this.getDef = sdef;
            this.isCaboose = Stubs.GetMethod(true);
        }
    };

    var MockActionQueue = function() {
        this.clientActions = [];
        this.serverActions = [];
        this.nextBackgroundAction = null;
        this.xhr = false;
        this.getClientActions = function() { return this.clientActions; };
        this.getServerActions = function() { return this.serverActions; };
        this.getNextBackgroundAction = function() { return this.nextBackgroundAction; };
        this.needXHR = function() { return this.xhr; };
    };

	//
	// FIXME: most of the enqueue action stuff should be removed, and
	// we should just ensure that they call ActionQueue.enqueue.
	//
	[Fixture]
	function EnqueueAction() {

		[ Fact ]
		function DoesNotRunServerAction() {
			var action = new MockAction();

			mockGlobal(function() {
				new AuraClientService().enqueueAction(action);
			});

			Assert.Equal(0, action.runDeprecated.Calls.length);
		}

		[ Fact ]
		function QueuesServerAction() {
			var action = new MockAction();
            var target;
			mockGlobal(function() {
				target = new AuraClientService();
				target.priv.actionQueue.enqueue = Stubs.GetMethod("action", undefined);

				target.enqueueAction(action);
			});

			Assert.Equal([ {
				Arguments : {
					action : action
				},
				ReturnValue : undefined
			} ], target.priv.actionQueue.enqueue.Calls);
		}

		[ Fact ]
		function QueuesClientAction() {
			var action = new MockAction("client");
            var target;
			mockGlobal(function() {
				target = new AuraClientService();
				target.priv.actionQueue.enqueue = Stubs.GetMethod("action", undefined);

				target.enqueueAction(action);
			});

			Assert.Equal([ {
				Arguments : {
					action : action
				},
				ReturnValue : undefined
			} ], target.priv.actionQueue.enqueue.Calls);
		}

		[ Fact ]
		function AbortableActionsAreCleared() {
			// Arrange
			var target;
            var abortable = new MockAction("serverabortable");
            var action = new MockAction("server");

			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.processActions = function() {
			};
			// Act
			mockGlobal(function() {
				target.pushStack("AbortableActionsAreCleared.1");
				target.enqueueAction(action, undefined, undefined);
				target.enqueueAction(abortable, undefined, undefined); // will be pruned
				target.enqueueAction(abortable, undefined, undefined); // will be pruned
				target.enqueueAction(action, undefined, undefined);
				target.popStack("AbortableActionsAreCleared.1");
				target.pushStack("AbortableActionsAreCleared.2");
				target.enqueueAction(action, undefined, undefined);
				target.enqueueAction(abortable, undefined, undefined); // will be kept
				target.enqueueAction(abortable, undefined, undefined); // will be kept
				target.enqueueAction(action, undefined, undefined);
				target.popStack("AbortableActionsAreCleared.2");
			});
			// Assert
			Assert.Equal(6, target.priv.actionQueue.actions.length);
			Assert.Equal(2, abortable.abort.Calls.length);
			Assert.Equal(0, action.abort.Calls.length);
			Assert.False(target.priv.actionQueue.actions[0].isAbortable(), "First action should not be abortable");
			Assert.False(target.priv.actionQueue.actions[1].isAbortable(), "Second action should not be abortable");
			Assert.False(target.priv.actionQueue.actions[2].isAbortable(), "Third action should not be abortable");
			Assert.True(target.priv.actionQueue.actions[3].isAbortable(), "Fourth action should be abortable");
			Assert.True(target.priv.actionQueue.actions[4].isAbortable(), "Fifth action should be abortable");
			Assert.False(target.priv.actionQueue.actions[5].isAbortable(), "Sixth action should not be abortable");
		}

		[ Fact ]
		function AssertsActionNotUndefinedOrNull() {
			var assertStub = Stubs.GetMethod("check", "message", undefined);
			var validateStub = Stubs.GetMethod(true);
			mockGlobal(function() {
				$A.assert = assertStub;
				$A.util.isUndefinedOrNull = validateStub;

				new AuraClientService().enqueueAction(new MockAction());
			});

			Assert.Equal(1, validateStub.Calls.length);
			Assert.Equal({
				Arguments : {
					check : false,
					message : "EnqueueAction() cannot be called on an undefined or null action."
				},
				ReturnValue : undefined
			}, assertStub.Calls[0]);
		}

		[ Fact ]
		function AssertsActionAuraTypeDefined() {
			var assertStub = Stubs.GetMethod("check", "message", undefined);
			var validateStub = Stubs.GetMethod(true);
			mockGlobal(function() {
				$A.assert = assertStub;
				$A.util.isUndefined = validateStub;

				new AuraClientService().enqueueAction(new MockAction());
			});

			Assert.Equal(1, validateStub.Calls.length);
			Assert.Equal({
				Arguments : {
					check : false,
					message : "Cannot call EnqueueAction() with a non Action parameter."
				},
				ReturnValue : undefined
			}, assertStub.Calls[1]);
		}

		[ Fact ]
		function AssertsActionAuraTypeIsAction() {
			var assertStub = Stubs.GetMethod("check", "message", undefined);
			var action = new MockAction();
			action.auraType = "unexpected";
			mockGlobal(function() {
				$A.assert = assertStub;

				new AuraClientService().enqueueAction(action);
			});

			Assert.Equal({
				Arguments : {
					check : false,
					message : "Cannot call EnqueueAction() with a non Action parameter."
				},
				ReturnValue : undefined
			}, assertStub.Calls[1]);
		}

		[ Fact ]
		function SetBackgroundActionIfTruthy() {
			var action = new MockAction();

			mockGlobal(function() {
				new AuraClientService().enqueueAction(action, true);
			});

			Assert.Equal(1, action.setBackground.Calls.length);
		}

		[ Fact ]
		function DoesNotSetBackgroundActionIfUndefined() {
			var action = new MockAction();

			mockGlobal(function() {
				new AuraClientService().enqueueAction(action);
			});

			Assert.Equal(0, action.setBackground.Calls.length);
		}

		[ Fact ]
		function DoesNotSetBackgroundActionIfNull() {
			var action = new MockAction();

			mockGlobal(function() {
				new AuraClientService().enqueueAction(action, null);
			});

			Assert.Equal(0, action.setBackground.Calls.length);
		}

		[ Fact ]
		function DoesNotSetBackgroundActionIfFalsy() {
			var action = new MockAction();

			mockGlobal(function() {
				new AuraClientService().enqueueAction(action, false);
			});

			Assert.Equal(0, action.setBackground.Calls.length);
		}
	}

	[ Fixture ]
	function ProcessActions() {
		[ Fact ]
		function ReturnsFalseIfForegroundMax() {
            var target;
			mockGlobal(function() {
				target = new AuraClientService();
			});
            target.priv.actionQueue = new MockActionQueue();
            target.priv.actionQueue.serverActions = [ "action" ];
            target.priv.actionQueue.xhr = true;
			target.priv.foreground.started = target.priv.foreground.max;

			var actual;
			mockGlobal(function() {
				actual = target.processActions();
			});

			Assert.False(actual);
		}

		[ Fact ]
		function ReturnsFalseIfBackgroundMax() {
            var target;
			mockGlobal(function() {
				target = new AuraClientService();
			});
            target.priv.actionQueue = new MockActionQueue();
            target.priv.actionQueue.nextBackgroundAction = "action";
			target.priv.background.started = target.priv.background.max;

			var actual;
			mockGlobal(function() {
				actual = target.processActions();
			});

			Assert.False(actual);
		}

		[ Fact ]
		function ReturnsFalseIfQueueEmpty() {
            var target;
			mockGlobal(function() {
				target = new AuraClientService();
			});
            target.priv.actionQueue = new MockActionQueue();

			var actual;
			mockGlobal(function() {
				actual = target.processActions();
			});

			Assert.False(actual);
		}

		[ Fact ]
		function CallsRequestIfServerActionsAvailable() {
			var action = "server";
            var target;
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.request = Stubs.GetMethod("actions", "flightCounter", undefined);
            target.priv.actionQueue = new MockActionQueue();
			target.priv.actionQueue.serverActions = [ action ];
            target.priv.actionQueue.xhr = true;

			mockGlobal(function() {
				target.processActions();
			});

			Assert.Equal([ {
				Arguments : {
					actions : [ action ],
					flightCounter : target.priv.foreground
				},
				ReturnValue : undefined
			} ], target.priv.request.Calls);
		}

        [ Fact ]
        function DoesNotCallRequestIfXhrSetToFalse() {
            var action = "server";
            var target;
            mockGlobal(function() {
                target = new AuraClientService();
            });
            target.priv.actionQueue = new MockActionQueue();
            target.priv.actionQueue.serverActions = [ action ];
            target.priv.actionQueue.xhr = false;

            var actual;
            mockGlobal(function() {
                actual = target.processActions();
            });

            Assert.False(actual);
        }

		[ Fact ]
		function ReturnsTrueIfServerActionsSent() {
			var action = "server";
            var target;
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.request = function() {
			};
            target.priv.actionQueue = new MockActionQueue();
			target.priv.actionQueue.serverActions = [ action ];
            target.priv.actionQueue.xhr = true;

			var actual;
			mockGlobal(function() {
				actual = target.processActions();
			});

			Assert.True(actual);
		}

		[ Fact ]
		function CallsRequestIfBackgroundActionAvailable() {
			var action = "background";
            var target;
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.request = Stubs.GetMethod("actions", "flightCounter", undefined);
            target.priv.actionQueue = new MockActionQueue();
			target.priv.actionQueue.nextBackgroundAction = action;

			var actual;
			mockGlobal(function() {
				actual = target.processActions();
			});

			Assert.Equal([ {
				Arguments : {
					actions : [ action ],
					flightCounter : target.priv.background
				},
				ReturnValue : undefined
			} ], target.priv.request.Calls);
		}

		[ Fact ]
		function ReturnsTrueIfBackgroundActionSent() {
			var action = "background";
            var target;
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.request = function() {
			};
            target.priv.actionQueue = new MockActionQueue();
			target.priv.actionQueue.nextBackgroundAction = action;

			var actual;
			mockGlobal(function() {
				actual = target.processActions();
			});

			Assert.True(actual);
		}

		[ Fact ]
		function CallsRequestForBothServerAndBackgroundActions() {
			var actionServer = "server";
			var actionBackground = "background";
            var target;
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.request = Stubs.GetMethod("actions", "flightCounter", undefined);
            target.priv.actionQueue = new MockActionQueue();
			target.priv.actionQueue.serverActions = [ actionServer ];
            target.priv.actionQueue.xhr = true;
            target.priv.actionQueue.nextBackgroundAction = actionBackground;

			var actual;
			mockGlobal(function() {
				actual = target.processActions();
			});

			Assert.Equal([ {
				Arguments : {
					actions : [ actionServer ],
					flightCounter : target.priv.foreground
				},
				ReturnValue : undefined
			}, {
				Arguments : {
					actions : [ actionBackground ],
					flightCounter : target.priv.background
				},
				ReturnValue : undefined
			} ], target.priv.request.Calls);
		}
	}

    [ Fixture ]
    function MakeActionGroup() {
        [ Fact ]
        function AssertsActionsIsArray() {
            var expectedArrayCheck = "checked";
            var stubbedAssert = Stubs.GetMethod("condition", "msg", null);
            var stubbedIsArray = Stubs.GetMethod("param", expectedArrayCheck);
            var expected = "expected";
            mockGlobal(function() {
                $A.assert = stubbedAssert;
                $A.util.isArray = stubbedIsArray;
                var target = new AuraClientService();

                try {
                    target.makeActionGroup(expected);
                } catch (e) {
                    // We expect an exception because our version of assert
                    // doesn't do the right thing.
                }
            });

            Assert.Equal([ {
                Arguments : {
                    param : expected
                },
                ReturnValue : expectedArrayCheck
            } ], stubbedIsArray.Calls);
            Assert.Equal([ {
                Arguments : {
                    condition : expectedArrayCheck,
                    msg : "makeActionGroup expects a list of actions, but instead got: expected"
                },
                ReturnValue : null
            } ], stubbedAssert.Calls);
        }

        [ Fact ]
        function AssertsCallbackIsFunction() {
            var expectedArrayCheck = "checked";
            var action = new MockAction();
            var stubbedAssert = Stubs.GetMethod("condition", "msg", null);
            var stubbedIsFunction = Stubs.GetMethod("param", expectedArrayCheck);
            var expected = function() {
                return "expected callback";
            };
            mockGlobal(function() {
                $A.util.isUndefined = function() {
                    return false;
                };
                $A.assert = stubbedAssert;
                $A.util.isFunction = stubbedIsFunction;
                var target = new AuraClientService();
                target.makeActionGroup([action], undefined, expected);
            });

            Assert.Equal([ {
                Arguments : {
                    param : expected
                },
                ReturnValue : expectedArrayCheck
            } ], stubbedIsFunction.Calls);
            Assert.Equal({
                Arguments : {
                    condition : expectedArrayCheck,
                    msg : "makeActionGroup expects the callback to be a function, but instead got: " + expected
                },
                ReturnValue : null
            }, stubbedAssert.Calls[1]);
        }

        [ Fact ]
        function DoesNotAssertCallbackIsFunctionIfCallbackUndefined() {
            var stubbedAssert = Stubs.GetMethod("condition", "msg", null);
            var action = new MockAction();
            mockGlobal(function() {
                $A.util.isUndefined = function() {
                    return true;
                };
                $A.assert = stubbedAssert;
                var target = new AuraClientService();
                target.makeActionGroup([action], undefined, undefined);
            });

            var i;
            for (i = 0; i < stubbedAssert.Calls.length; i++) {
                Assert.NotEqual("makeActionGroup expects the callback to be a function, but instead got: " + undefined,
                                stubbedAssert.Calls[i].Arguments.msg);
            }
        }
    }

    [ Fixture ]
    function RunActions() {
        [ Fact ]
        function CallsMakeActionGroup() {
            var expectedActions = ["action"];
            var expectedScope = "scope";
            var expectedCallback = "callback";
            var target;
            mockGlobal(function() {
                target = new AuraClientService();
                target.makeActionGroup = Stubs.GetMethod("actions", "scope", "callback", null);
                target.priv.actionQueue.enqueue = function(){};
                target.processActions = function(){};
                target.runActions(expectedActions, expectedScope, expectedCallback);
            });

            Assert.Equal([ {
                Arguments : {
                    actions: expectedActions,
                    scope: expectedScope,
                    callback: expectedCallback
                },
                ReturnValue : null
            } ], target.makeActionGroup.Calls);
        }

        [ Fact ]
        function CallsEnqueueOnEachAction() {
            var actions = ["action1", "action2"];
            var target;
            mockGlobal(function() {
                target = new AuraClientService();
                target.makeActionGroup = function(){};
                target.priv.actionQueue.enqueue = Stubs.GetMethod("param", null);
                target.processActions = function(){};
                target.runActions(actions);
            });

            Assert.Equal([{
                Arguments : {
                    param: actions[0]
                },
                ReturnValue : null
                },
                { Arguments : {
                    param: actions[1]
                },
                ReturnValue : null
                }
            ], target.priv.actionQueue.enqueue.Calls);
        }

        [ Fact ]
        function CallsProcessActions() {
            var expectedActions = ["action"];
            var expectedScope = "scope";
            var expectedCallback = "callback";
            var target;
            mockGlobal(function() {
                target = new AuraClientService();
                target.makeActionGroup = function(){};
                target.priv.actionQueue.enqueue = function(){};
                target.processActions = Stubs.GetMethod(null);
                target.runActions(expectedActions, expectedScope, expectedCallback);
            });

            Assert.Equal(1, target.processActions.Calls.length);
        }
    }
}
