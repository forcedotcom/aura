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

//Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
Mocks.GetMock(Object.Global(), "exp", function() {
})(function() {
	// #import aura.controller.ActionDef
});

Function.RegisterNamespace("Test.Aura.Controller");

[ Fixture ]
Test.Aura.Controller.ActionDefTest = function() {
	[ Fixture ]
	function Constructor() {
		[ Fact ]
		function SetsName() {
			// Arrange
			var expected = "expected";
			var config = {
				name : expected
			};
			var actual;

			// Act
			var actual = new ActionDef(config).name;

			// Assert
			Assert.Equal(expected, actual);
		}

		[ Fact ]
		function SetsDescriptor() {
			// Arrange
			var expected = "expected";
			var config = {
				descriptor : expected
			};
			var actual;

			// Act
			var actual = new ActionDef(config).descriptor;

			// Assert
			Assert.Equal(expected, actual);
		}

		[ Fact ]
		function SetsActionType() {
			// Arrange
			var expected = "expected";
			var config = {
				actionType : expected
			};
			var actual;

			// Act
			var actual = new ActionDef(config).actionType;

			// Assert
			Assert.Equal(expected, actual);
		}

		[ Fixture ]
		function ServerActionType() {
			var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
				util : {
					isArray : function(obj) {
						return Object.prototype.toString.call(obj) === "[object Array]";
					}
				}
			});

			var ValueDef = function(param) {
				return {
					name : param,
					getName : function() {
						return this.name;
					}
				};
			};
			var mockValueDef = Mocks.GetMock(Object.Global(), "ValueDef", ValueDef);

			[ Fact ]
			function SetsReturnType() {
				// Arrange
				var expected = "expected";
				var config = {
					actionType : "SERVER",
					returnType : expected
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					mockValueDef(function() {
						actual = new ActionDef(config).returnType;
					})
				});

				// Assert
				Assert.Equal(new ValueDef(expected), actual);
			}

			[ Fact ]
			function SetsEmptyParamDefsWhenParamsNotArray() {
				// Arrange
				var config = {
					actionType : "SERVER",
					params : {
						ignored : "ignored"
					}
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					mockValueDef(function() {
						actual = new ActionDef(config).paramDefs;
					})
				});

				// Assert
				Assert.Empty(actual);
			}

			[ Fact ]
			function SetsEmptyParamDefsWhenParamsEmpty() {
				// Arrange
				var config = {
					actionType : "SERVER",
					params : []
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					mockValueDef(function() {
						actual = new ActionDef(config).paramDefs;
					})
				});

				// Assert
				Assert.Empty(actual);
			}

			[ Fact ]
			function SetsParamDefsWhenParamsHasOne() {
				// Arrange
				var config = {
					actionType : "SERVER",
					params : [ "expected" ]
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					mockValueDef(function() {
						actual = new ActionDef(config).paramDefs;
					})
				});

				// Assert
				Assert.Equal({
					expected : new ValueDef("expected")
				}, actual);
			}

			[ Fact ]
			function SetsParamDefsWhenParamsHasTwo() {
				// Arrange
				var config = {
					actionType : "SERVER",
					params : [ "expected1", "expected2" ]
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					mockValueDef(function() {
						actual = new ActionDef(config).paramDefs;
					})
				});

				// Assert
				Assert.Equal({
					expected1 : new ValueDef("expected1"),
					expected2 : new ValueDef("expected2")
				}, actual);
			}

			[ Fact ]
			function SetsBackground() {
				// Arrange
				var expected = "expected";
				var config = {
					actionType : "SERVER",
					background : expected
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					mockValueDef(function() {
						actual = new ActionDef(config).background;
					})
				});

				// Assert
				Assert.Equal(expected, actual);
			}

			[ Fact ]
			function SetsMethNull() {
				// Arrange
				var config = {
					actionType : "SERVER",
					code : "ignored"
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					mockValueDef(function() {
						actual = new ActionDef(config).meth;
					})
				});

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

			[ Fact ]
			function SetsMeth() {
				// Arrange
				var config = {
					actionType : "CLIENT",
					code : "expected"
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					actual = new ActionDef(config).meth;
				});

				// Assert
				Assert.Equal("decoded", actual);
			}

			[ Fact ]
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
					new ActionDef(config);
				});
				var actual = stubbedDecoder.Calls[0].Arguments.toDecode;

				// Assert
				Assert.Equal("decode me", actual);
			}

			[ Fact ]
			function DoesNotSetReturnType() {
				// Arrange
				var config = {
					actionType : "CLIENT",
					returnType : "ignored"
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					actual = new ActionDef(config).returnType;
				});

				// Assert
				Assert.Undefined(actual);
			}

			[ Fact ]
			function SetsEmptyParamDefs() {
				// Arrange
				var config = {
					actionType : "CLIENT"
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					actual = new ActionDef(config).paramDefs;
				});

				// Assert
				Assert.Empty(actual);
			}

			[ Fact ]
			function DoesNotSetBackground() {
				// Arrange
				var config = {
					actionType : "CLIENT",
					background : true
				};
				var actual;

				// Act
				mockAuraUtil(function() {
					actual = new ActionDef(config).background;
				});

				// Assert
				Assert.Undefined(actual);
			}

			[ Fact ]
			function LogsDecodeError() {
				// Arrange
				var config = {
					actionType : "CLIENT",
					code : "decodable"
				};
				var expected = new Error("expected");
				var stubbedLogger = Stubs.GetMethod("msg", "error", null);
				var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
					util : {
						json : {
							decodeString : function() {
								throw expected;
							}
						}
					},
					log : stubbedLogger
				});

				// Act
				mockAuraUtil(function() {
					new ActionDef(config);
				});

				// Assert
				Assert.Equal("decodable", stubbedLogger.Calls[0].Arguments.msg);
				Assert.Equal(expected, stubbedLogger.Calls[0].Arguments.error);
			}
		}
	}
	[ Fixture ]
	function GetName() {
		[ Fact ]
		function ReturnsName() {
			// Arrange
			var expected = "expected";
			var target = new ActionDef({});
			target.name = expected;

			// Act
			var actual = target.getName();

			// Assert
			Assert.Equal(expected, actual);
		}
	}

	[ Fixture ]
	function GetDescriptor() {
		[ Fact ]
		function ReturnsDescriptor() {
			// Arrange
			var expected = "expected";
			var target = new ActionDef({});
			target.descriptor = expected;

			// Act
			var actual = target.getDescriptor();

			// Assert
			Assert.Equal(expected, actual);
		}
	}

	[ Fixture ]
	function GetActionType() {
		[ Fact ]
		function ReturnsActionType() {
			// Arrange
			var expected = "expected";
			var target = new ActionDef({});
			target.actionType = expected;

			// Act
			var actual = target.getActionType();

			// Assert
			Assert.Equal(expected, actual);
		}
	}

	[ Fixture ]
	function IsClientAction() {
		[ Fact ]
		function ReturnsTrueIfActionTypeEqualsCLIENT() {
			// Arrange
			var target = new ActionDef({});
			target.actionType = "CLIENT";

			// Act
			var actual = target.isClientAction();

			// Assert
			Assert.True(actual);
		}

		[ Fact ]
		function ReturnsFalseIfActionTypeNotEqualsCLIENT() {
			// Arrange
			var target = new ActionDef({});
			target.actionType = "client";

			// Act
			var actual = target.isClientAction();

			// Assert
			Assert.False(actual);
		}
	}

	[ Fixture ]
	function IsServerAction() {
		[ Fact ]
		function ReturnsTrueIfActionTypeEqualsSERVER() {
			// Arrange
			var target = new ActionDef({});
			target.actionType = "SERVER";

			// Act
			var actual = target.isServerAction();

			// Assert
			Assert.True(actual);
		}

		[ Fact ]
		function ReturnsFalseIfActionTypeNotEqualsSERVER() {
			// Arrange
			var target = new ActionDef({});
			target.actionType = "server";

			// Act
			var actual = target.isServerAction();

			// Assert
			Assert.False(actual);
		}
	}

	[ Fixture ]
	function NewInstance() {
		[ Fact ]
		function ReturnsActionWithDef() {
			// Arrange
			var target = new ActionDef({});

			// Act
			var actual = target.newInstance().def;

			// Assert
			Assert.Equal(target, actual);
		}

		[ Fact ]
		function ReturnsActionWithMeth() {
			// Arrange
			var expected = "expected";
			var target = new ActionDef({});
			target.meth = expected;

			// Act
			var actual = target.newInstance().meth;

			// Assert
			Assert.Equal(expected, actual);
		}

		[ Fact ]
		function ReturnsActionWithParamDefs() {
			// Arrange
			var expected = "expected";
			var target = new ActionDef({});
			target.paramDefs = expected;

			// Act
			var actual = target.newInstance().paramDefs;

			// Assert
			Assert.Equal(expected, actual);
		}

		[ Fact ]
		function ReturnsActionWithBackground() {
			// Arrange
			var expected = "expected";
			var target = new ActionDef({});
			target.background = expected;

			// Act
			var actual = target.newInstance().background;

			// Assert
			Assert.Equal(expected, actual);
		}

		[ Fact ]
		function ReturnsActionWithCmp() {
			// Arrange
			var expected = "expected";
			var target = new ActionDef({});

			// Act
			var actual = target.newInstance(expected).cmp;

			// Assert
			Assert.Equal(expected, actual);
		}
	}
}
