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
				},
				json : {
					encode :function(errorText) {
						return "mockedJson:"+errorText;
					}
				}
			},
			mark : function() {
			}
		},
		"window" : {},
		"exp" : function() {
		}
	});
	
	[Fixture]
    function testCreateIntegrationErrorConfig() {
        [Fact]
        function ReturnsErrorConfig() {
        	// Arrange
            var target;
            mockGlobal(function() {
                target = new AuraClientService();
            });
            var errorMsg = "Test Error Message";
            // Act
            var actual;
            mockGlobal(function() {
            	actual = target.createIntegrationErrorConfig(errorMsg);
			});
            // Assert
            var expected;
            expected = {
            		"componentDef" : {
                        "descriptor" : "markup://ui:message"
                    },

                    "attributes" : {
                        "values" : {
                            "title" : "Aura Integration Service Error",
                            "severity" : "error",
                            "body" : [
                                {
                                    "componentDef" : {
                                        "descriptor" : "markup://ui:outputText"
                                    },

                                    "attributes" : {
                                        "values" : {
                                            "value" : "mockedJson:"+errorMsg
                                        }
                                    }
                                }
                            ]
                        }
                    }
            };
            Assert.Equal(expected, actual);
        }

    }

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
        this.getAbortableKey = Stubs.GetMethod();
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

    [ Fixture ]
    function actionServices() {

        // Mock action storage returned by the mockAction service when getStorage("action") is invoked.
        // This object has a setup method which allows the test to assert what parameters should be passed into its
        // get, put and remove functions.
        var mockActionStorage = new (function MockActionStorage() {

            this.setup = function(stubs) {
                this._stubs = stubs;
            };

            this.clear = function() {
                var that = this;
                return $A.util.createPromise(function(success, error) {
                    delete that._stubs;
                    success();
                });
            };

            this.get = function(key) {
                var that = this;
                return $A.util.createPromise(function(success, error) {
                    if (that._stubs && that._stubs.get) {
                        var value = { value : that._stubs.get[key], isExpired : false };
                        success(value);
                    } else {
                        throw "actionsStorage.get(..) called before it was stubbed out.";
                    }
                });
            };

            this.put = function(key, value) {
                var that = this;
                return $A.util.createPromise(function(success, error) {
                    if (that._stubs && that._stubs.put) {
                        if (value === that._stubs.put[key]) {
                            success();
                        } else {
                            error("put stub not found for key: " + key);
                        }
                    } else {
                        throw "actionsStorage.put(..) called before it was stubbed out.";
                    }
                });
            };

            this.remove = function(key) {
                var that = this;
                return $A.util.createPromise(function(success, error) {
                    if (that._stubs && that._stubs.remove) {
                        if (key === that._stubs.remove){
                            success();
                        } else {
                            error("remove stub not found for key: " + key);
                        }
                    } else {
                        throw "actionsStorage.remove(..) called before it was stubbed out.";
                    }
                });
            };
        })();

        // Sets up the environment with a mock action storage:
        var mockActionService = function(delegate) {
            Mocks.GetMocks(Object.Global(), {
                "$A" : {
                    "storageService": {
                        "getStorage": function(name) {
                            Assert.Equal("actions", name, "action service should only access the 'actions' cache");
                            return mockActionStorage;
                        }
                    },
                    ns : {
                        Util : {
                            prototype : {
                                on : function() {
                                }
                            }
                        }
                    },
                    assert : function() {},
                    mark : function() {},
                    util : {
                        json : {
                            encode : function(toEncode) {
                                return "<<" + JSON.stringify(toEncode) + ">>";
                            }
                        },
                        isString : function(obj) {
                            return typeof obj === 'string';
                        },
                        isArray : function(obj) {
                            return obj instanceof Array;
                        },
                        isObject: function(obj) {
                            return typeof obj === "object" && obj !== null && !(obj instanceof Array);
                        },
                        map: function(array, transformer, that) {
                            return array.map(transformer, that);
                        },
                        keys: Object.keys,
                        createPromise : function(func) {
                            // #import aura.Promise
                            return new $A.ns.Promise(func);
                        }
                    },
                    run : function (cb) {
                        cb();
                    },
                    error : function (err) {
                        throw err;
                    },
                    log : function (msg) {}
                },
                setTimeout : function(cb, time) {
                    cb();
                },
                exp: function() {},
                window: Object.Global()
            })(function() {
                // #import aura.AuraClientService
        		// #import aura.controller.Action
                mockActionStorage.clear()
                    .then(function() { delegate(new AuraClientService(), mockActionStorage); });
            });
        };

        function assertBool(bool, message) {
            return function(result) {
                Assert[bool ? "True" : "False"](result, message);
            }
        }

        [ Fact ]
        function testIsInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var stored = "STORED";

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = stored;

                storage.setup({get: get});

                // don't worry about async, the mocks do everything synchronously.

                // With descriptor and params, the action is indeed found:
                service.isActionInStorage(descriptor, params, Assert.True);

                // With invalid descriptor/params the callback is invoked with false:
                service.isActionInStorage(descriptor, {}, assertBool(false, "Wrong params."));
                service.isActionInStorage("", params, assertBool(false, "Wrong descriptor."));
                service.isActionInStorage(undefined, params, assertBool(false, "Undefined descriptor."));
                service.isActionInStorage(null, params, assertBool(false, "Null descriptor."));
                service.isActionInStorage(true, params, assertBool(false, "Boolean descriptor."));
                service.isActionInStorage([], params, assertBool(false, "Array descriptor."));
                service.isActionInStorage(descriptor, undefined, assertBool(false, "Undefined params."));
                service.isActionInStorage(descriptor, null, assertBool(false, "Null params."));
                service.isActionInStorage(descriptor, true, assertBool(false, "Boolean params."));
                service.isActionInStorage(descriptor, [], assertBool(false, "Array params."));
            });
        }

        [ Fact ]
        function testRevalidateAction() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var stored = "STORED";

                var access = {};
                access[Action.getStorageKey(descriptor, params)] = stored;

                storage.setup({
                    get: access,
                    put: access
                });

                // don't worry about async, the mocks do everything synchronously.

                // With descriptor and params, the action is revalidated:
                service.revalidateAction(descriptor, params, Assert.True);

                // With invalid descriptor/params the callback is invoked with false:
                service.revalidateAction(descriptor, {}, assertBool(false, "Wrong params."));
                service.revalidateAction("", params, assertBool(false, "Wrong descriptor."));
                service.revalidateAction(undefined, params, assertBool(false, "Undefined descriptor."));
                service.revalidateAction(null, params, assertBool(false, "Null descriptor."));
                service.revalidateAction(true, params, assertBool(false, "Boolean descriptor."));
                service.revalidateAction([], params, assertBool(false, "Array descriptor."));
                service.revalidateAction(descriptor, undefined, assertBool(false, "Undefined params."));
                service.revalidateAction(descriptor, null, assertBool(false, "Null params."));
                service.revalidateAction(descriptor, true, assertBool(false, "Boolean params."));
                service.revalidateAction(descriptor, [], assertBool(false, "Array params."));
            });
        }

        [ Fact ]
        function testInvalidateAction() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var stored = "STORED";

                storage.setup({
                    remove: Action.getStorageKey(descriptor, params)
                });

                // don't worry about async, the mocks do everything synchronously.

                // With descriptor and params, the action is re-validated:
                service.invalidateAction(descriptor, params, Assert.True);

                // When the actions are non-existent, remove is still called on them regardless of whether or not
                // they are currently stored (test to ensure that the mockActionStorage is called with action keys it's
                // not rigged to except by ensuring it throws the appropriate exceptions):
                service.invalidateAction(
                    descriptor,
                    {},
                    assertBool(false, "Wrong params."),
                    function(err) { Assert.Equal("remove stub not found for key: DESCRIPTOR:<<{}>>", err); }
                );
                service.invalidateAction(
                    "",
                    params,
                    assertBool(false, "Wrong descriptor."),
                    function(err) { Assert.Equal("remove stub not found for key: :<<{\"params\":\"PARAMS\"}>>", err); }
                );

                // With invalid descriptor/params the callback is invoked with false:
                service.invalidateAction(undefined, params, assertBool(false, "Undefined descriptor."));
                service.invalidateAction(null, params, assertBool(false, "Null descriptor."));
                service.invalidateAction(true, params, assertBool(false, "Boolean descriptor."));
                service.invalidateAction([], params, assertBool(false, "Array descriptor."));
                service.invalidateAction(descriptor, undefined, assertBool(false, "Undefined params."));
                service.invalidateAction(descriptor, null, assertBool(false, "Null params."));
                service.invalidateAction(descriptor, true, assertBool(false, "Boolean params."));
                service.invalidateAction(descriptor, [], assertBool(false, "Array params."));
            });
        }
    }

    [Fixture]
    function isBB10() {
        [Fact]
        function ReturnsTrueForZ10() {
            var target;
            mockGlobal(function() {
                target = new AuraClientService();
            });
            var mockUserAgent = Mocks.GetMock(Object.Global(), "navigator", {
                userAgent: "Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+"
            });

            var actual;
            mockUserAgent(function(){
                actual = target.priv.isBB10();
            });

            Assert.Equal(true, actual);
        }

        [Fact]
        function ReturnsFalseForNonBB10Blackberry() {
            var target;
            mockGlobal(function() {
                target = new AuraClientService();
            });
            var mockUserAgent = Mocks.GetMock(Object.Global(), "navigator", {
                userAgent: "Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0 Mobile Safari/534.11+"
            });

            var actual;
            mockUserAgent(function(){
                actual = target.priv.isBB10();
            });

            Assert.Equal(false, actual);
        }
    }
    
    
    
}
