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
				}
			}
		},
		"window" : {},
		"exp" : function() {
		}
	});

	var MockAction = function() {
		this.auraType = "Action";
		this.setBackground = Stubs.GetMethod();
		this.isAbortable = Stubs.GetMethod(false);
		this.runDeprecated = Stubs.GetMethod();
		this.getDef = Stubs.GetMethod({
			isClientAction : Stubs.GetMethod(false)
		});
	}

	[Fixture]
	function EnqueueAction() {

		[ Fact ]
		function RunsClientAction() {
			var action = new MockAction();
			action.getDef = Stubs.GetMethod({
				isClientAction : Stubs.GetMethod(true)
			});

			mockGlobal(function() {
				new AuraClientService().enqueueAction(action);
			});

			Assert.Equal(1, action.runDeprecated.Calls.length);
		}

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
			var target
			mockGlobal(function() {
				target = new AuraClientService();
				target.actionQueue.enqueue = Stubs.GetMethod("action", undefined);

				target.enqueueAction(action);
			});

			Assert.Equal([ {
				Arguments : {
					action : action
				},
				ReturnValue : undefined
			} ], target.actionQueue.enqueue.Calls);
		}

		/* FIXME: W-1652118 we currently run client actions immediately rather than queueing them
		[ Fact ]
		function QueuesClientAction() {
			var action = new MockAction();
			action.getDef = Stubs.GetMethod({
				isClientAction : Stubs.GetMethod(true)
			});
			var target
			mockGlobal(function() {
				target = new AuraClientService();
				target.actionQueue.enqueue = Stubs.GetMethod("action", undefined);

				target.enqueueAction(action);
			});

			Assert.Equal([ {
				Arguments : {
					action : action
				},
				ReturnValue : undefined
			} ], target.actionQueue.enqueue.Calls);
		}
		*/
		
		[ Fact ]
		function AbortableActionsAreCleared() {
			// Arrange
			var target;
			var numAbortedCorrectly = 0;
			var numAbortedIncorrectly = 0;
			var abortable = {
				isAbortable : function() {
					return true;
				},
				getDef : function() {
					return {
						isClientAction : function() {
							return false;
						},
						isServerAction : function() {
							return true;
						}
					};
				},
				abort : function() {
					numAbortedCorrectly++;
				},
				run : function() {
				},
				auraType : "Action"
			};
			var action = {
				isAbortable : function() {
					return false;
				},
				getDef : function() {
					return {
						isClientAction : function() {
							return false;
						},
						isServerAction : function() {
							return true;
						}
					};
				},
				abort : function() {
					numAbortedIncorrectly++;
				},
				run : function() {
				},
				auraType : "Action"
			};

			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.processActions = function() {
			};
			var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
				assert : function() {
				},
				util : {
					isUndefined : function() {
					},
					isUndefinedOrNull : function() {
					}
				},
				mark : function() {
				}
			});
			// Act
			mockAuraUtil(function() {
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
			Assert.Equal(6, target.actionQueue.actions.length);
			Assert.Equal(0, numAbortedIncorrectly);
			Assert.Equal(2, numAbortedCorrectly);
			Assert.False(target.actionQueue.actions[0].isAbortable(), "First actions should not be abortable");
			Assert.False(target.actionQueue.actions[1].isAbortable(), "Second actions should not be abortable");
			Assert.False(target.actionQueue.actions[2].isAbortable(), "Third actions should not be abortable");
			Assert.True(target.actionQueue.actions[3].isAbortable(), "Fourth actions should be abortable");
			Assert.True(target.actionQueue.actions[4].isAbortable(), "Fifth actions should be abortable");
			Assert.False(target.actionQueue.actions[5].isAbortable(), "Sixth actions should not be abortable");
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
		function ReturnsFalseIfRequestPending() {
			var target
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.inRequest = true;

			var actual = target.processActions();

			Assert.False(actual);
		}

		[ Fact ]
		function ReturnsFalseIfQueueEmpty() {
			var target
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.actionQueue = {
				getServerActions : function() {
					return [];
				},
				getNextBackgroundAction : function() {
				}
			};

			var actual = target.processActions();

			Assert.False(actual);
		}

		[ Fact ]
		function CallsRequestIfServerActionsAvailable() {
			var action = "server";
			var target
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.request = Stubs.GetMethod("actions", undefined);
			target.actionQueue = {
				getServerActions : function() {
					return [ action ];
				},
				getNextBackgroundAction : function() {
				}
			};

			target.processActions();

			Assert.Equal([ {
				Arguments : {
					actions : [ action ]
				},
				ReturnValue : undefined
			} ], target.priv.request.Calls);
		}

		[ Fact ]
		function ReturnsTrueIfServerActionsSent() {
			var action = "server";
			var target
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.request = function() {
			};
			target.actionQueue = {
				getServerActions : function() {
					return [ action ];
				},
				getNextBackgroundAction : function() {
				}
			};

			var actual = target.processActions();

			Assert.True(actual);
		}

		[ Fact ]
		function CallsRequestIfBackgroundActionAvailable() {
			var action = "background";
			var target
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.request = Stubs.GetMethod("actions", undefined);
			target.actionQueue = {
				getServerActions : function() {
					return [];
				},
				getNextBackgroundAction : function() {
					return action;
				}
			};

			var actual = target.processActions();

			Assert.Equal([ {
				Arguments : {
					actions : action
				},
				ReturnValue : undefined
			} ], target.priv.request.Calls);
		}

		[ Fact ]
		function ReturnsTrueIfBackgroundActionSent() {
			var action = "background";
			var target
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.request = function() {
			};
			target.actionQueue = {
				getServerActions : function() {
					return [];
				},
				getNextBackgroundAction : function() {
					return action;
				}
			};

			var actual = target.processActions();

			Assert.True(actual);
		}

		[ Fact ]
		function CallsRequestForBothServerAndBackgroundActions() {
			var actionServer = "server";
			var actionBackground = "background";
			var target
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.request = Stubs.GetMethod("actions", undefined);
			target.actionQueue = {
				getServerActions : function() {
					return [ actionServer ];
				},
				getNextBackgroundAction : function() {
					return actionBackground;
				}
			};

			var actual = target.processActions();

			Assert.Equal([ {
				Arguments : {
					actions : [ actionServer ]
				},
				ReturnValue : undefined
			}, {
				Arguments : {
					actions : actionBackground
				},
				ReturnValue : undefined
			} ], target.priv.request.Calls);
		}
	}

	[ Fixture ]
	function RunActions() {
		[ Fact ]
		function CallsRequest() {
			var actions = [ "expected" ];
			var callback = function() {
			};
			var target;
			mockGlobal(function() {
				target = new AuraClientService();
			});
			target.priv.request = Stubs.GetMethod("param", null);

			target.runActions(actions, undefined, callback);

			Assert.Equal([ {
				Arguments : {
					param : actions
				},
				ReturnValue : null
			} ], target.priv.request.Calls);
		}
	}
}
