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

[Fixture]
Test.Aura.Controller.ActionDefTest = function() {
    var _actionDef;
    var _action;

    Mocks.GetMocks(Object.Global(), {
        "Aura": { "Controller": {} },
    })(function() {
        Import("aura-impl/src/main/resources/aura/controller/ActionDef.js");
        Import("aura-impl/src/main/resources/aura/controller/Action.js");

        _action = Action;
        _actionDef = ActionDef;
        delete Action;
        delete ActionDef;
    });

    function getAuraMock(during) {
        return Mocks.GetMocks(Object.Global(), {
            "Aura": {
                "Controller": {
                    "ActionDef": _actionDef
                }
            },
            "Action": _action,
            "$A": {
                getContext : function() {return null;},
                clientService:{},
                lockerService: {
                    trust: function() {}
                }
            },
            "DefDescriptor": function() {
                return {
                    "getNamespace": function() {}
                };
            },
            "Json": {
                "ApplicationKey": {
                    "ACTIONTYPE": "actionType",
                    "BACKGROUND": "background",
                    "CABOOSE": "caboose",
                    "CODE": "code",
                    "DESCRIPTOR": "descriptor",
                    "NAME": "name",
                    "RETURNTYPE": "returnType",
                    "PARAMS": "params", 
                    "PUBLICCACHINGENABLED": "publicCachingEnabled", 
                    "PUBLICCACHINGEXPIRATION": "publicCachingExpiration"
                }
            }
        })(during);
    }

    [Fixture]
    function Constructor() {
        [Fact]
        function SetsName() {
            getAuraMock(function() {
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
            });
        }

        [Fact]
        function SetsDescriptor() {
            getAuraMock(function() {
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
            });
        }

        [Fact]
        function SetsActionType() {
            getAuraMock(function() {
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
            });
        }

        [Fixture]
        function ServerActionType() {
            [Fact]
            function SetsReturnType() {
                getAuraMock(function() {
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
                });
            }

            [Fact]
            function SetsEmptyParamDefsWhenParamsNotArray() {
                getAuraMock(function() {
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
                });
            }

            [Fixture]
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
                    getAuraMock(function() {
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
                    });
                }

                [Fact]
                function SetsParamDefsWhenParamsHasOne() {
                    getAuraMock(function() {
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
                    });
                }

                [Fact]
                function SetsParamDefsWhenParamsHasTwo() {
                    getAuraMock(function() {
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
                    });
                }
            }
            [Fact]
            function DefaultBackground() {
                getAuraMock(function() {
                    // Arrange
                    var config = {
                        actionType : "SERVER",
                    };

                    // Act
                    var actual = new Aura.Controller.ActionDef(config).background;

                    // Assert
                    Assert.False(actual);
                });
            }
            [Fact]
            function SetsBackground() {
                getAuraMock(function() {
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
                });
            }
            [Fact]
            function DefaultCaboose() {
                getAuraMock(function() {
                    // Arrange
                    var config = {
                        actionType : "SERVER",
                    };

                    // Act
                    var actual = new Aura.Controller.ActionDef(config).caboose;

                    // Assert
                    Assert.False(actual);
                });
            }

            [Fact]
            function SetsCaboose() {
                getAuraMock(function() {
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
                });
            }

            [Fact]
            function SetsMethNull() {
                getAuraMock(function() {
                    // Arrange
                    var config = {
                        actionType : "SERVER",
                        code : "ignored"
                    };

                    // Act
                    var actual = new Aura.Controller.ActionDef(config).meth;

                    // Assert
                    Assert.Null(actual);
                });
            }

            [Fact]
            function DefaultPublicCachingEnabled() {
                getAuraMock(function() {
                    // Arrange
                    var config = {
                        actionType : "SERVER",
                    };

                    // Act
                    var actualPublicCachingEnabled = new Aura.Controller.ActionDef(config).publicCachingEnabled;
                    var actualPublicCachingExpiration = new Aura.Controller.ActionDef(config).publicCachingExpiration;

                    // Assert
                    Assert.False(actualPublicCachingEnabled);
                });
            }

            [Fact]
            function SetsPublicCachingEnabled() {
                getAuraMock(function() {
                    // Arrange
                    var expected = "expected";
                    var config = {
                        actionType : "SERVER",
                        publicCachingEnabled: expected
                    };

                    // Act
                    var actualPublicCachingEnabled = new Aura.Controller.ActionDef(config).publicCachingEnabled;

                    // Assert
                    Assert.True(actualPublicCachingEnabled);
                });
            }

            [Fact]
            function SetsPublicCachingExpiration() {
                getAuraMock(function() {
                    // Arrange
                    var expectedPublicCachingExpiration = 100;
                    var config = {
                        actionType : "SERVER",
                        publicCachingEnabled : true,
                        publicCachingExpiration : expectedPublicCachingExpiration
                    };

                    // Act
                    var actualPublicCachingExpiration = new Aura.Controller.ActionDef(config).publicCachingExpiration;

                    // Assert
                    Assert.Equal(expectedPublicCachingExpiration, actualPublicCachingExpiration);
                });
            }
        }

        [Fixture]
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
                getAuraMock(function() {
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
                });
            }

            [Fact]
            function DecodesCodeProperty() {
                getAuraMock(function() {
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
                });
            }

            [Fact]
            function DoesNotSetReturnType() {
                getAuraMock(function() {
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
                });
            }

            [Fact]
            function SetsEmptyParamDefs() {
                getAuraMock(function() {
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
                });
            }

            [Fact]
            function DoesNotSetBackground() {
                getAuraMock(function() {
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
                });
            }

            [Fact]
            function DoesNotSetPublicCachingExpirationIfNotAllowed() {
                getAuraMock(function() {
                    // Arrange
                    var config = {
                        actionType : "SERVER",
                        publicCachingExpiration : 100
                    };
                    var actualPublicCachingExpiration;

                    // Act
                    mockAuraUtil(function() {
                        actualPublicCachingExpiration = new Aura.Controller.ActionDef(config).publicCachingExpiration;
                    });

                    // Assert
                    Assert.Equal(-1, actualPublicCachingExpiration);
                });
            }

            [Fact]
            function DoesNotSetPublicCachingEnabledForClientAction() {
                getAuraMock(function() {
                    // Arrange
                    var config = {
                        actionType : "CLIENT",
                        publicCachingEnabled : true,
                            publicCachingExpiration : 100
                    };
                    var actualPublicCachingEnabled;

                    // Act
                    mockAuraUtil(function() {
                        actualPublicCachingEnabled = new Aura.Controller.ActionDef(config).publicCachingEnabled;
                    });

                    // Assert
                    Assert.False(actualPublicCachingEnabled);
                });
            }

            [Fact]
            function DoesNotSetPublicCachingExpirationForClientAction() {
                getAuraMock(function() {
                    // Arrange
                    var config = {
                        actionType : "CLIENT",
                        publicCachingEnabled : true,
                            publicCachingExpiration : 100
                    };
                    var actualPublicCachingExpiration;

                    // Act
                    mockAuraUtil(function() {
                        actualPublicCachingExpiration = new Aura.Controller.ActionDef(config).publicCachingExpiration;
                    });

                    // Assert
                    Assert.Equal(-1, actualPublicCachingExpiration);
                });
            }

            [Fixture]
            function LogsDecodeError() {

                [Fact]
                function LogsDecodeAndSpecifySourceFunction() {
                    getAuraMock(function() {
                        // Arrange
                        var expected = "ActionDef ctor decode error: function logic(){}";
                        var code = "function logic(){}"
                        var config = {
                            actionType : "CLIENT",
                            code : code
                        };
                        var error = new Error(code);
                        var actual;
                        var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
                            util : {
                                json : {
                                    decodeString : function() {
                                        throw error;
                                    }
                                }
                            },
                            auraError : function(message, err, severity) {
                                actual = message;
                            },
                            severity : {
                                "QUIET" : "QUIET"
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
                    });
                }

                [Fact]
                function LogsDecodeAndSpecifyErrorMessage() {
                    getAuraMock(function() {
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
                            auraError : function(message, err, severity) {
                                actual = err;
                            },
                            severity : {
                                QUIET : "QUIET"
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
                    });
                }
            }
        }
    }

    [Fixture]
    function GetName() {
        [Fact]
        function ReturnsName() {
            getAuraMock(function() {
                // Arrange
                var expected = "expected";
                var target = new Aura.Controller.ActionDef({});
                target.name = expected;

                // Act
                var actual = target.getName();

                // Assert
                Assert.Equal(expected, actual);
            });
        }
    }

    [Fixture]
    function GetDescriptor() {
        [Fact]
        function ReturnsDescriptor() {
            getAuraMock(function() {
                // Arrange
                var expected = "expected";
                var target = new Aura.Controller.ActionDef({});
                target.descriptor = expected;

                // Act
                var actual = target.getDescriptor();

                // Assert
                Assert.Equal(expected, actual);
            });
        }
    }

    [Fixture]
    function GetActionType() {
        [Fact]
        function ReturnsActionType() {
            getAuraMock(function() {
                // Arrange
                var expected = "expected";
                var target = new Aura.Controller.ActionDef({});
                target.actionType = expected;

                // Act
                var actual = target.getActionType();

                // Assert
                Assert.Equal(expected, actual);
            });
        }
    }

    [Fixture]
    function IsBackground() {
        [Fact]
        function ReturnsTrueIfBackgroundTrue() {
            getAuraMock(function() {
                var target = new Aura.Controller.ActionDef({});
                target.background = true;

                var actual = target.isBackground();

                Assert.True(actual);
            });
        }

        [Fact]
        function ReturnsFalseIfBackgroundNotTrue() {
            getAuraMock(function() {
                var target = new Aura.Controller.ActionDef({});
                target.background = "true";

                var actual = target.isBackground();

                Assert.False(actual);
            });
        }
    }

    [Fixture]
    function IsClientAction() {
        [Fact]
        function ReturnsTrueIfActionTypeEqualsCLIENT() {
            getAuraMock(function() {
                // Arrange
                var target = new Aura.Controller.ActionDef({});
                target.actionType = "CLIENT";

                // Act
                var actual = target.isClientAction();

                // Assert
                Assert.True(actual);
            });
        }

        [Fact]
        function ReturnsFalseIfActionTypeNotEqualsCLIENT() {
            getAuraMock(function() {
                // Arrange
                var target = new Aura.Controller.ActionDef({});
                target.actionType = "client";

                // Act
                var actual = target.isClientAction();

                // Assert
                Assert.False(actual);
            });
        }
    }

    [Fixture]
    function IsServerAction() {
        [Fact]
        function ReturnsTrueIfActionTypeEqualsSERVER() {
            getAuraMock(function() {
                // Arrange
                var target = new Aura.Controller.ActionDef({});
                target.actionType = "SERVER";

                // Act
                var actual = target.isServerAction();

                // Assert
                Assert.True(actual);
            });
        }

        [Fact]
        function ReturnsFalseIfActionTypeNotEqualsSERVER() {
            getAuraMock(function() {
                // Arrange
                var target = new Aura.Controller.ActionDef({});
                target.actionType = "server";

                // Act
                var actual = target.isServerAction();

                // Assert
                Assert.False(actual);
            });
        }
    }

    [Fixture]
    function IsCaboose() {
        [Fact]
        function ReturnsTrueIfCabooseTrue() {
            getAuraMock(function() {
                var target = new Aura.Controller.ActionDef({});
                target.caboose = true;

                var actual = target.isCaboose();

                Assert.True(actual);
            });
        }

        [Fact]
        function ReturnsFalseIfCabooseNotTrue() {
            getAuraMock(function() {
                var target = new Aura.Controller.ActionDef({});
                target.caboose = "true";

                var actual = target.isCaboose();

                Assert.False(actual);
            });
        }
    }

    [Fixture]
    function IsPublicCachingEnabled() {
        [Fact]
        function ReturnsTrueIfPublicCachingTrue() {
            getAuraMock(function() {
                var target = new Aura.Controller.ActionDef({});
                target.publicCachingEnabled = true;

                var actual = target.isPublicCachingEnabled();

                Assert.True(actual);
            });
        }

        [Fact]
        function ReturnsFalseIfPublicCachingNotTrue() {
            getAuraMock(function() {
                var target = new Aura.Controller.ActionDef({});
                target.publicCachingEnabled = "true";

                var actual = target.isPublicCachingEnabled();

                Assert.False(actual);
            });
        }
    }

    [Fixture]
    function GetPublicCachingExpiration() {
        [Fact]
        function ReturnsPublicCachingExpiration() {
            getAuraMock(function() {
                // Arrange
                var expected = "expected";
                var target = new Aura.Controller.ActionDef({});
                target.publicCachingExpiration = expected;

                // Act
                var actual = target.getPublicCachingExpiration();

                // Assert
                Assert.Equal(expected, actual);
            });
        }
    }

    [Fixture]
    function NewInstance() {
        [Fact]
        function ReturnsActionWithDef() {
            getAuraMock(function() {
                // Arrange
                var target = new Aura.Controller.ActionDef({});

                // Act
                var actual;
                actual = target.newInstance().def;

                // Assert
                Assert.Equal(target, actual);
            });
        }

        [Fact]
        function ReturnsActionWithMeth() {
            getAuraMock(function() {
                // Arrange
                var expected = "expected";
                var target = new Aura.Controller.ActionDef({});
                target.meth = expected;

                // Act
                var actual;
                actual = target.newInstance().meth;

                // Assert
                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function ReturnsActionWithParamDefs() {
            getAuraMock(function() {
                // Arrange
                var expected = "expected";
                var target = new Aura.Controller.ActionDef({});
                target.paramDefs = expected;

                // Act
                var actual;
                actual = target.newInstance().paramDefs;

                // Assert
                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function ReturnsActionWithBackgroundFromIsBackground() {
            getAuraMock(function() {
                            // Note, this used to use 'expected', but that breaks with the new
                            // more strict values.
                var expected = true;
                var target = new Aura.Controller.ActionDef({});
                            target.background = expected;

                var actual;
                actual = target.newInstance().background;

                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function ReturnsActionWithCmp() {
            getAuraMock(function() {
                // Arrange
                var expected = "expected";
                var target = new Aura.Controller.ActionDef({});

                // Act
                var actual;
                actual = target.newInstance(expected).cmp;

                // Assert
                Assert.Equal(expected, actual);
            });
        }
    }
}
