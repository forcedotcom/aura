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

	var mockOnLoadUtil = Mocks.GetMocks(Object.Global(), {
		"$A" : {
			ns : {
				Util : {
					prototype : {
						on : function() {
						}
					}
				}
			}
		},
		"window" : {
			onbeforeunload : function() {
			}
		},
		"exp" : function() {
		}
	});

	[ Fixture ]
	function EnqueueAction() {
		[ Fact ]
		function ClientActionRunsImmediately() {
                    // FIXME!!!! this is going to change shortly!!!
			// Arrange
			var target;
			var actual = false;

			mockOnLoadUtil(function() {
				target = new AuraClientService();
			});
			var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
				assert : function() {
				},
				util : {
					isUndefined : function() {
					},
					isUndefinedOrNull : function() {
					}
				}
			});
			var action = {
				isAbortable : function() {
					return false;
				},
				getDef : function() {
					return {
						isClientAction : function() {
							return true;
						}
					};
				},
				runDeprecated : function() {
					actual = true;
				},
				auraType : "Action"
			};
			// Act
			mockAuraUtil(function() {
				target.enqueueAction(action, undefined, undefined);
			});
			// Assert
			Assert.True(actual);
		}

		[ Fact ]
		function ServerActionsAreQueued() {
			// Arrange
			var target;
			var ranImmediately = false;

			mockOnLoadUtil(function() {
				target = new AuraClientService();
			});
			var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
				assert : function() {
				},
				util : {
					isUndefined : function() {
					},
					isUndefinedOrNull : function() {
					}
				}
			});
			var action = {
				isAbortable : function() {
					return false;
				},
				getDef : function() {
					return {
						isClientAction : function() {
							return false;
						}
					};
				},
				run : function() {
					ranImmediately = true;
				},
				auraType : "Action"
			};
			// Act
			mockAuraUtil(function() {
				target.enqueueAction(action, undefined, undefined);
			});
			// Assert
			Assert.False(ranImmediately);
			Assert.Equal(1, target.actionQueue.actions.length);
			Assert.Equal(action, target.actionQueue.actions[0]);
		}

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

			mockOnLoadUtil(function() {
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
		function ThrowsIfActionParamIsUndefined() {
			// Arrange
			var expected = "EnqueueAction() cannot be called on an undefined or null action."
			var actual;
			mockOnLoadUtil(function() {
				target = new AuraClientService();
			});
			var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
				assert : function(condition, message) {
					if (!condition) {
						var error = new Error(message);
						throw error;
					}
				},
				util : {
					isUndefined : function() {
					},
					isUndefinedOrNull : function(obj) {
						return obj === undefined || obj === null;
					}
				}
			});
			// Act
			mockAuraUtil(function() {
				actual = Record.Exception(function() {
					target.enqueueAction(undefined, undefined, undefined);
				})
			});
			// Assert
			Assert.Equal(expected, actual);
		}

		[ Fact ]
		function ThrowsIfFirstParamsAuraTypeIsNotAction() {
			// Arrange
			var expected = "Cannot call EnqueueAction() with a non Action parameter."
			var actual;
			mockOnLoadUtil(function() {
				target = new AuraClientService();
			});
			var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
				assert : function(condition, message) {
					if (!condition) {
						var error = new Error(message);
						throw error;
					}
				},
				util : {
					isUndefined : function(obj) {
						return obj === undefined;
					},
					isUndefinedOrNull : function(obj) {
						return obj === undefined || obj === null;
					}
				}
			});
			var action = {
				auraType : "Component"
			};
			// Act
			mockAuraUtil(function() {
				actual = Record.Exception(function() {
					target.enqueueAction(action, undefined, undefined);
				})
			});
			// Assert
			Assert.Equal(expected, actual);
		}

		[ Fact ]
		function ThrowsIfFirstParamIsNotRecognizedAuraType() {
			// Arrange
			var expected = "Cannot call EnqueueAction() with a non Action parameter."
			var actual;
			mockOnLoadUtil(function() {
				target = new AuraClientService();
			});
			var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
				assert : function(condition, message) {
					if (!condition) {
						var error = new Error(message);
						throw error;
					}
				},
				util : {
					isUndefined : function(obj) {
						return obj === undefined;
					},
					isUndefinedOrNull : function(obj) {
						return obj === undefined || obj === null;
					}
				}
			});
			var action = "FooBared";
			// Act
			mockAuraUtil(function() {
				actual = Record.Exception(function() {
					target.enqueueAction(action, undefined, undefined);
				})
			});
			// Assert
			Assert.Equal(expected, actual);
		}

		[ Fact ]
		function ThrowsIfFirstParamsAuraTypeIsNotAction() {
			// Arrange
			var expected = "Cannot call EnqueueAction() with a non Action parameter."
			var actual;
			mockOnLoadUtil(function() {
				target = new AuraClientService();
			});
			var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
				assert : function(condition, message) {
					if (!condition) {
						var error = new Error(message);
						throw error;
					}
				},
				util : {
					isUndefined : function(obj) {
						return obj === undefined;
					},
					isUndefinedOrNull : function(obj) {
						return obj === undefined || obj === null;
					}
				}
			});
			var action = {
				auraType : "Component"
			};
			// Act
			mockAuraUtil(function() {
				actual = Record.Exception(function() {
					target.enqueueAction(action, undefined, undefined);
				})
			});
			// Assert
			Assert.Equal(expected, actual);
		}

		[ Fact ]
		function ThrowsIfFirstParamIsNotRecognizedAuraType() {
			// Arrange
			var expected = "Cannot call EnqueueAction() with a non Action parameter."
			var actual;
			mockOnLoadUtil(function() {
				target = new AuraClientService();
			});
			var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
				assert : function(condition, message) {
					if (!condition) {
						var error = new Error(message);
						throw error;
					}
				},
				util : {
					isUndefined : function(obj) {
						return obj === undefined;
					},
					isUndefinedOrNull : function(obj) {
						return obj === undefined || obj === null;
					}
				}
			});
			var action = "FooBared";
			// Act
			mockAuraUtil(function() {
				actual = Record.Exception(function() {
					target.enqueueAction(action, undefined, undefined);
				})
			});
			// Assert
			Assert.Equal(expected, actual);
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
			mockOnLoadUtil(function() {
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
