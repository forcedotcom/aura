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
Function.RegisterNamespace("Test.Aura.Controller");

[ Fixture ]
Test.Aura.Controller.ActionDefTest = function() {
	var Aura = {
		"Controller": {}
	}
	Mocks.GetMocks(Object.Global(), {
		"Aura": Aura,
		"ActionDef": function(){},
		"Action": function(){}
	})(function() {
        [Import("aura-impl/src/main/resources/aura/controller/ActionDef.js")]
        [Import("aura-impl/src/main/resources/aura/controller/Action.js")]
	});

	[ Fixture ]
	function Constructor() {
		[Fact]
		function SetsName() {
			// Arrange
			var expected = "expected";
			var config = {
				name : expected
			};
			var actual;

			// Act
			var actual = new Aura.Controller.ActionDef(config).name;

			// Assert
			Assert.Equal(expected, actual);
		}

		[Fact]
		function SetsDescriptor() {
			// Arrange
			var expected = "expected";
			var config = {
				descriptor : expected
			};
			var actual;

			// Act
			var actual = new Aura.Controller.ActionDef(config).descriptor;

			// Assert
			Assert.Equal(expected, actual);
		}

		[Fact]
		function SetsActionType() {
			// Arrange
			var expected = "expected";
			var config = {
				actionType : expected
			};
			var actual;

			// Act
			var actual = new Aura.Controller.ActionDef(config).actionType;

			// Assert
			Assert.Equal(expected, actual);
		}

		[ Fixture ]
		function ServerActionType() {
			[Fact]
			function SetsReturnType() {
				// Arrange
				var expected = "expected";
				var config = {
					actionType : "SERVER",
					returnType : {"name":expected}
				};

				// Act
				var actual = new Aura.Controller.ActionDef(config).returnType;

				// Assert
				Assert.Equal(expected, actual);
			}

			[Fact]
			function SetsEmptyParamDefsWhenParamsNotArray() {
				// Arrange
				var config = {
					actionType : "SERVER",
					params : [ "ignored" ]
				};
				var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
					util : {
						isArray : function(obj) {
							return false;
						}
					}
				});

				var actual;

				// Act
				mockAuraUtil(function() {
					actual = new Aura.Controller.ActionDef(config).paramDefs;
				});

				// Assert
				Assert.Empty(actual);
			}

			[ Fixture ]
			function WithParams() {
				var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
					util : {
						isArray : function(obj) {
							return true;
						}
					}
				});

				[Fact]
				function SetsEmptyParamDefsWhenParamsEmpty() {
					// Arrange
					var config = {
						actionType : "SERVER",
						params : []
					};
					var actual;

					// Act
					mockAuraUtil(function() {
						actual = new Aura.Controller.ActionDef(config).paramDefs;
					});

					// Assert
					Assert.Empty(actual);
				}

				[Fact]
				function SetsParamDefsWhenParamsHasOne() {
					// Arrange
					var expected={expected:{"name":"expected"}};
					var config = {
						actionType : "SERVER",
						params : [expected.expected]
					};
					var actual;

					// Act
					mockAuraUtil(function() {
						actual = new Aura.Controller.ActionDef(config).paramDefs;
					});

					// Assert
					Assert.Equal(expected, actual);
				}

				[Fact]
				function SetsParamDefsWhenParamsHasTwo() {
					// Arrange
					var expected={
						expected1 : {"name":"expected1"},
						expected2 : {"name":"expected2"}
					};
					var config = {
						actionType : "SERVER",
						params : [ expected.expected1, expected.expected2 ]
					};
					var actual;

					// Act
					mockAuraUtil(function() {
						actual = new Aura.Controller.ActionDef(config).paramDefs;
					});

					// Assert
					Assert.Equal(expected, actual);
				}
			}
			[Fact]
			function DefaultBackground() {
				// Arrange
				var config = {
					actionType : "SERVER",
				};

				// Act
				var actual = new Aura.Controller.ActionDef(config).background;

				// Assert
				Assert.False(actual);
			}
			[Fact]
			function SetsBackground() {
				// Arrange
				var expected = "expected";
				var config = {
					actionType : "SERVER",
					background : expected
				};

				// Act
				var actual = new Aura.Controller.ActionDef(config).background;

				// Assert
				Assert.True(actual);
			}
			[Fact]
			function DefaultCaboose() {
				// Arrange
				var config = {
					actionType : "SERVER",
				};

				// Act
				var actual = new Aura.Controller.ActionDef(config).caboose;

				// Assert
				Assert.False(actual);
			}

			[Fact]
			function SetsCaboose() {
				// Arrange
				var expected = "expected";
				var config = {
					actionType : "SERVER",
					caboose : expected
				};

				// Act
				var actual = new Aura.Controller.ActionDef(config).caboose;

				// Assert
				Assert.True(actual);
			}

			[Fact]
			function SetsMethNull() {
				// Arrange
				var config = {
					actionType : "SERVER",
					code : "ignored"
				};

				// Act
				var actual = new Aura.Controller.ActionDef(config).meth;

				// Assert
				Assert.Null(actual);
			}
		}

		[ Fixture ]
		function ClientActionType() {
			var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
				util : {
					json : {
						decodeString : function() {
							return "decoded";
						}
					}
				}
			});

			[Fact]
			function SetsMeth() {
				// Arrange
				var config = {
					actionType : "CLIENT",
					code : "expected"
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					actual = new Aura.Controller.ActionDef(config).meth;
				});

				// Assert
				Assert.Equal("decoded", actual);
			}

			[Fact]
			function DecodesCodeProperty() {
				// Arrange
				var config = {
					actionType : "CLIENT",
					code : "decode me"
				};
				var stubbedDecoder = Stubs.GetMethod("toDecode", null);

				// Act
				mockAuraUtil(function() {
					$A.util.json.decodeString = stubbedDecoder;
					new Aura.Controller.ActionDef(config);
				});
				var actual = stubbedDecoder.Calls[0].Arguments.toDecode;

				// Assert
				Assert.Equal("decode me", actual);
			}

			[Fact]
			function DoesNotSetReturnType() {
				// Arrange
				var config = {
					actionType : "CLIENT",
					returnType : "ignored"
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					actual = new Aura.Controller.ActionDef(config).returnType;
				});

				// Assert
				Assert.Undefined(actual);
			}

			[Fact]
			function SetsEmptyParamDefs() {
				// Arrange
				var config = {
					actionType : "CLIENT"
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					actual = new Aura.Controller.ActionDef(config).paramDefs;
				});

				// Assert
				Assert.Empty(actual);
			}

			[Fact]
			function DoesNotSetBackground() {
				// Arrange
				var config = {
					actionType : "CLIENT",
					background : true
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					actual = new Aura.Controller.ActionDef(config).background;
				});

				// Assert
				Assert.Equal(false, actual);
			}

			[Fixture]
			function LogsDecodeError() {

				[Fact]
				function LogsDecodeAndSpecifySourceFunction() {
					// Arrange
					var expected = "function logic(){}";
					var config = {
						actionType : "CLIENT",
						code : expected
					};
					var error = new Error(expected);
					var actual;
					var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
						util : {
							json : {
								decodeString : function() {
									throw error;
								}
							}
						},
						auraError : function(message, err) {
							actual = message;
						}
					});

					try {
						// Act
						mockAuraUtil(function() {
							Record.Exception(function() {
								new Aura.Controller.ActionDef(config);
							});
						});
					} catch (e) {
						// do nothing, this is just for not exposing the thrown exception.
					}

					// Assert
					Assert.Equal(expected, actual);
				}

				[Fact]
				function LogsDecodeAndSpecifyErrorMessage() {
					// Arrange
					var config = {
						actionType : "CLIENT",
						code : "decodable"
					};
					var expected = new Error("expected");
					var actual
					var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
						util : {
							json : {
								decodeString : function() {
									throw expected;
								}
							}
						},
						auraError : function(message, err) {
							actual = err;
						}
					});

					// Act
					try {
						mockAuraUtil(function() {
							Record.Exception(function() {
								new Aura.Controller.ActionDef(config);
							});
						});
					} catch (e) {
						// do nothing, this is just for not exposing the thrown exception.
					}

					// Assert
					Assert.Equal(expected, actual);
				}

			}
		}
	}
	[ Fixture ]
	function GetName() {
		[Fact]
		function ReturnsName() {
			// Arrange
			var expected = "expected";
			var target = new Aura.Controller.ActionDef({});
			target.name = expected;

			// Act
			var actual = target.getName();

			// Assert
			Assert.Equal(expected, actual);
		}
	}

	[ Fixture ]
	function GetDescriptor() {
		[Fact]
		function ReturnsDescriptor() {
			// Arrange
			var expected = "expected";
			var target = new Aura.Controller.ActionDef({});
			target.descriptor = expected;

			// Act
			var actual = target.getDescriptor();

			// Assert
			Assert.Equal(expected, actual);
		}
	}

	[ Fixture ]
	function GetActionType() {
		[Fact]
		function ReturnsActionType() {
			// Arrange
			var expected = "expected";
			var target = new Aura.Controller.ActionDef({});
			target.actionType = expected;

			// Act
			var actual = target.getActionType();

			// Assert
			Assert.Equal(expected, actual);
		}
	}

	[ Fixture ]
	function IsBackground() {
		[Fact]
		function ReturnsTrueIfBackgroundTrue() {
			var target = new Aura.Controller.ActionDef({});
			target.background = true;

			var actual = target.isBackground();

			Assert.True(actual);
		}

		[Fact]
		function ReturnsFalseIfBackgroundNotTrue() {
			var target = new Aura.Controller.ActionDef({});
			target.background = "true";

			var actual = target.isBackground();

			Assert.False(actual);
		}
	}

	[ Fixture ]
	function IsClientAction() {
		[Fact]
		function ReturnsTrueIfActionTypeEqualsCLIENT() {
			// Arrange
			var target = new Aura.Controller.ActionDef({});
			target.actionType = "CLIENT";

			// Act
			var actual = target.isClientAction();

			// Assert
			Assert.True(actual);
		}

		[Fact]
		function ReturnsFalseIfActionTypeNotEqualsCLIENT() {
			// Arrange
			var target = new Aura.Controller.ActionDef({});
			target.actionType = "client";

			// Act
			var actual = target.isClientAction();

			// Assert
			Assert.False(actual);
		}
	}

	[ Fixture ]
	function IsServerAction() {
		[Fact]
		function ReturnsTrueIfActionTypeEqualsSERVER() {
			// Arrange
			var target = new Aura.Controller.ActionDef({});
			target.actionType = "SERVER";

			// Act
			var actual = target.isServerAction();

			// Assert
			Assert.True(actual);
		}

		[Fact]
		function ReturnsFalseIfActionTypeNotEqualsSERVER() {
			// Arrange
			var target = new Aura.Controller.ActionDef({});
			target.actionType = "server";

			// Act
			var actual = target.isServerAction();

			// Assert
			Assert.False(actual);
		}
	}

	[ Fixture ]
	function NewInstance() {
        var mockAuraContext = Mocks.GetMocks(Object.Global(),  {
        	"$A": { 
        		getContext : function() {return null;} 
        	},
        	"Action": Aura.Controller.Action
        });

		[Fact]
		function ReturnsActionWithDef() {
			// Arrange
			var target = new Aura.Controller.ActionDef({});

			// Act
			var actual;
			mockAuraContext(function() {
			    actual = target.newInstance().def;
			});

			// Assert
			Assert.Equal(target, actual);
		}

		[Fact]
		function ReturnsActionWithMeth() {
			// Arrange
			var expected = "expected";
			var target = new Aura.Controller.ActionDef({});
			target.meth = expected;

			// Act
			var actual;
			mockAuraContext(function() {
			    actual = target.newInstance().meth;
			});

			// Assert
			Assert.Equal(expected, actual);
		}

		[Fact]
		function ReturnsActionWithParamDefs() {
			// Arrange
			var expected = "expected";
			var target = new Aura.Controller.ActionDef({});
			target.paramDefs = expected;

			// Act
			var actual;
			mockAuraContext(function() {
			    actual = target.newInstance().paramDefs;
			});

			// Assert
			Assert.Equal(expected, actual);
		}

		[Fact]
		function ReturnsActionWithBackgroundFromIsBackground() {
                        // Note, this used to use 'expected', but that breaks with the new
                        // more strict values.
			var expected = true;
			var target = new Aura.Controller.ActionDef({});
                        target.background = expected;

			var actual;
			mockAuraContext(function() {
			    actual = target.newInstance().background;
			});

			Assert.Equal(expected, actual);
		}

		[Fact]
		function ReturnsActionWithCmp() {
			// Arrange
			var expected = "expected";
			var target = new Aura.Controller.ActionDef({});

			// Act
			var actual;
			mockAuraContext(function() {
			    actual = target.newInstance(expected).cmp;
			});

			// Assert
			Assert.Equal(expected, actual);
		}
	}
}
