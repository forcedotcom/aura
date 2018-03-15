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
Function.RegisterNamespace("Test.Aura.Component");

[Fixture]
Test.Aura.Component.ComponentDefLoaderTest = function() {
    var _componentDefLoader;
    var reportError = Stubs.GetMethod("message", true);

    Mocks.GetMocks(Object.Global(), {
        "Aura": { "Component": {} },
        "$A": {}
    })(function() {
        Import("aura-impl/src/main/resources/aura/component/ComponentDefLoader.js");
        _componentDefLoader = ComponentDefLoader;
        delete ComponentDefLoader;
    });

    var defaultMock = {
        "Aura": {
            "Component": {
                "ComponentDefLoader": _componentDefLoader
            },
            "componentDefLoaderError": {}
        },
        "$A": {
            util: {
                "getHashCode": function() {
                    return 555555;
                },
                "getURIDefsState": function() {
                    return {
                        "hydration": "test_hydration_val"
                    }
                },
                "isArray": typeof Array.isArray === "function" ? Array.isArray : function(arg) {
                  return Object.prototype.toString.call(arg) === '[object Array]';
                },
                "isString": function(obj){
                    return typeof obj === 'string';
                }
            },
            "reportError": reportError,
            "getRoot": function() {
                return {
                    "getType": function() {
                        return "test_type";
                    } 
                }
            },
            "lockerService": {
                "isEnabled": function() {
                    return true;
                }
            },
            "getContext": function(){
                return {"styleContext":{}};
            }
        },
        //Need to add a ref to itself to handle global defaults
        "ComponentDefLoader": _componentDefLoader
    };

    var mockAura = Mocks.GetMocks(Object.Global(), defaultMock);

    [Fixture]
    function defaults() {

        [Fact]
        function defaultVariablesDefined() {
            var actual;
            var expect = "_uid,_def,aura.app,_hydration,_l,LATEST,/auraCmpDef?,markup://,1800";
            mockAura(function () {
                var defLoader = Aura.Component.ComponentDefLoader;
                actual = [
                    defLoader.UID_param,
                    defLoader.DESCRIPTOR_param,
                    defLoader.APP_param,
                    defLoader.HYDRATION_param,
                    defLoader.LOCKER_param,
                    defLoader.UID_default,
                    defLoader.BASE_PATH,
                    defLoader.MARKUP_param,
                    defLoader.IE_URI_MAX_LENGTH
                ];
            });

            Assert.Equal(expect, actual.join(","));
        }
    }

    [Fixture]
    function constructor() {

        [Fact]
        function pendingShouldBeDefined() {
            var defLoader;
            var expect = null;
            mockAura(function () {
                defLoader = new Aura.Component.ComponentDefLoader();
            });
            Assert.Equal(expect, defLoader.pending);
        }
    }

    [Fixture]
    function buildComponentUri() {

        [Fact]
        function shouldReturnAValidURI() {
            var actual;
            var expect = "/auraCmpDef?_uid=some_URI&_def=test_descriptor&aura.app=markup://test_type&_hydration=test_hydration_val&_l=true";
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                actual = defLoader.buildComponentUri("test_descriptor", "some_URI");
            });
            Assert.Equal(expect, actual);
        }

        [Fact]
        function shouldUseDefaultURIValueIfOneIsNotPassed() {
            var actual;
            var expect = "/auraCmpDef?_uid=LATEST&_def=test_descriptor&aura.app=markup://test_type&_hydration=test_hydration_val&_l=true";
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                actual = defLoader.buildComponentUri("test_descriptor");
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function shouldFailIfNoDescriptorIsPassed() {
            var message = "Please provide a valid descriptor when building a component URI";
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                defLoader.buildComponentUri();
            });

            Assert.Equal({"message":message}, reportError.Calls[0].Arguments);
        }

        [Fact]
        function shouldFailIfNoDescriptorIsNotAString() {
            var message = "Please provide a valid descriptor when building a component URI";
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                defLoader.buildComponentUri(3);
            });

            Assert.Equal({"message":message}, reportError.Calls[0].Arguments);
        }
    }

    [Fixture]
    function buildURIAppParam() {

        [Fact]
        function shouldReturnAppQueryStringKeyAndValue() {
            var actual;
            var expect = "aura.app=markup://test_type";
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                actual = defLoader.buildURIAppParam();
            });

            Assert.Equal(expect, actual);
        }
    }

    [Fixture]
    function buildURILockerParam() {

        [Fact]
        function shouldReturnLockerQueryStringKeyAndValue() {
            var actual;
            var expect = "&_l=true";
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                actual = defLoader.buildURILockerParam();
            });

            Assert.Equal(expect, actual);
        }
    }

    [Fixture]
    function buildURIHydrationParam() {

        [Fact]
        function shouldReturnHydrationQueryStringKeyAndValue() {
            var actual;
            var expect = "&_hydration=hydrationVal";
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                actual = defLoader.buildURIHydrationParam("hydrationVal");
            });

            Assert.Equal(expect, actual);
        }

        [Fixture]
        function shouldReturnAnEmptyString() {
            [Fact]
            function shouldReturnAnEmptyStringIfHydrationIsNull() {
                var actual;
                var expect = "";
                mockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    actual = defLoader.buildURIHydrationParam();
                });

                Assert.Equal(expect, actual);
            }

            [Fact]
            function shouldReturnAnEmptyStringIfHydrationIsNotAString() {
                var actual;
                var expect = "";
                mockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    actual = defLoader.buildURIHydrationParam([1,2,3]);
                });

                Assert.Equal(expect, actual);
            }

            [Fact]
            function shouldReturnAnEmptyStringIfHydrationIsAnEmptyString() {
                var actual;
                var expect = "";
                mockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    actual = defLoader.buildURIHydrationParam("");
                });

                Assert.Equal(expect, actual);
            }
        }
    }

    [Fixture]
    function getHydrationState() {

        [Fact]
        function shouldReturnDefStateHydrationValue() {
            var actual;
            var expect = "test_hydration_val";
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                actual = defLoader.getHydrationState();
            });

            Assert.Equal(expect, actual);
        }

        [Fixture]
        function shouldReturnAnEmptyString() {

            [Fact]
            function ifDefStateIsNull() {
                var nullDefStateMock = {
                    "Aura": {
                        "Component": {
                            "ComponentDefLoader": _componentDefLoader
                        }
                    },
                    "$A": {
                        util: {
                            "getHashCode": function() {
                                return 555555;
                            },
                            "getURIDefsState": function() {
                                return null
                            }
                        },
                        "reportError": reportError,
                        "getRoot": function() {
                            return {
                                "getType": function() {
                                    return "test_type";
                                } 
                            }
                        }
                    },
                    //Need to add a ref to itself to handle global defaults
                    "ComponentDefLoader": _componentDefLoader
                };
                var nullDefStateMockAura = Mocks.GetMocks(Object.Global(), nullDefStateMock);

                var actual;
                var expect = "";
                nullDefStateMockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    actual = defLoader.getHydrationState();
                });

                Assert.Equal(expect, actual);
            }

            [Fact]
            function ifDefStateHydrationIsNull() {
                var nullHydrationStateMock = {
                    "Aura": {
                        "Component": {
                            "ComponentDefLoader": _componentDefLoader
                        }
                    },
                    "$A": {
                        util: {
                            "getHashCode": function() {
                                return 555555;
                            },
                            "getURIDefsState": function() {
                                return {
                                    "hydration": null
                                }
                            }
                        },
                        "reportError": reportError,
                        "getRoot": function() {
                            return {
                                "getType": function() {
                                    return "test_type";
                                } 
                            }
                        }
                    },
                    //Need to add a ref to itself to handle global defaults
                    "ComponentDefLoader": _componentDefLoader
                };
                var nullHydrationDefStateMockAura = Mocks.GetMocks(Object.Global(), nullHydrationStateMock);

                var actual;
                var expect = "";
                nullHydrationDefStateMockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    actual = defLoader.getHydrationState();
                });

                Assert.Equal(expect, actual);
            }
        }
    }

    [Fixture]
    function buildBundleComponentNamespace() {

        [Fixture]
        function passedDescriptorIsNotAnArray() {

            [Fact]
            function returnEmptyObject() {
                var actual;
                var expect = {};
                mockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    actual = defLoader.buildBundleComponentNamespace();
                });

                Assert.Equal(expect, actual);
            }
        }

        [Fixture]
        function passedDescriptorIsArray() {

        }
    }

    [Fixture]
    function buildBundleComponentUri() {
        
    }

    [Fixture]
    function buildURIString() {

        [Fact]
        function shouldReturnAURIString() {
            var actual;
            var expect = '{"uriString":"a&_uid=555555","uid":555555}';
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                actual = JSON.stringify(defLoader.buildURIString("a", "b", ["c", "d", "e"]));
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function setDefaultUIDIfEmpty() {
            var actual;
            var expect = '{"uriString":"a&_uid=LATEST-0","uid":"LATEST-0"}';
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                actual = JSON.stringify(defLoader.buildURIString("a", "", ["c", "d", "e"]));
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function shouldUseUIDHashIfDescriptorsExist() {
            var actual;
            var expect = '{"uriString":"a&_uid=555555","uid":555555}';
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                actual = JSON.stringify(defLoader.buildURIString("a", "b", ["c", "d", "e"]));
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function shouldUseUIDIfDescriptorsDoNotExist() {
            var actual;
            var expect = '{"uriString":"a&_uid=b","uid":"b"}';
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                actual = JSON.stringify(defLoader.buildURIString("a", "b", []));
            });

            Assert.Equal(expect, actual);
        }
    }

    [Fixture]
    function getScriptPromises() {

    }

    [Fixture]
    function retrievePending() {
        
    }

    [Fixture]
    function generateScriptTag() {
        
    }

    [Fixture]
    function schedulePending() {
        
    }

    [Fixture]
    function loadComponentDef() {

        [Fact]
        function schedulePendingIfPendingIsNull() {
            var actual;
            var expect = "schedulePending called!";
            mockAura(function () {
                var dummyCallback = function() {};
                var defLoader = new Aura.Component.ComponentDefLoader();
                defLoader.pending = null;
                defLoader.schedulePending = function() {
                    actual = "schedulePending called!";
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                }
                defLoader.loadComponentDef("descMap", 123, dummyCallback);
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function noSchedulePendingIfPendingIsNotNull() {
            var actual;
            var expect;
            mockAura(function () {
                var dummyCallback = function() {};
                var defLoader = new Aura.Component.ComponentDefLoader();
                defLoader.pending = { 
                    callbacks: [],
                    descriptorMap: {}
                };
                defLoader.schedulePending = function() {
                    actual = "schedulePending called!";
                }
                defLoader.loadComponentDef("descMap", 123, dummyCallback);
            });

            Assert.Equal(expect, actual);
        }

        [Fixture]
        function callbackIsPassedAndIsAFunction() {

            [Fact]
            function shouldUpdatePendingCallbacks() {
                var actual;
                var expect = 1;
                mockAura(function () {
                    var dummyCallback = function() {};
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDef("descMap", 123, dummyCallback);
                    actual = defLoader.pending.callbacks.length;
                });

                Assert.Equal(expect, actual);
            }

            [Fact]
            function shouldUpdateDescWithinPendingDescriptorMap() {
                var actual;
                var expect = {"descMap": 123};
                mockAura(function () {
                    var dummyCallback = function() {};
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDef("descMap", 123, dummyCallback);
                    actual = defLoader.pending.descriptorMap;
                });

                Assert.Equal(expect, actual);
            }
        }

        [Fixture]
        function callbackIsNotPassed() {

            [Fact]
            function shouldUpdatePendingCallbacks() {
                var actual;
                var expect = 1;
                mockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDef("descMap", 123);
                    actual = defLoader.pending.callbacks.length;
                });

                Assert.Equal(expect, actual);
            }

            [Fact]
            function shouldUpdatePendingDescriptorMap() {
                var actual;
                var expect = {"descMap": 123};
                mockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDef("descMap", 123, function(){});
                    actual = defLoader.pending.descriptorMap;
                });

                Assert.Equal(expect, actual);
            }
        }

        [Fixture]
        function callbackIsPassedAndIsNotAFunction() {

            [Fact]
            function shouldUpdatePendingCallbacks() {
                var actual;
                var expect = 1;
                mockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDef("descMap", 123, "callback");
                    actual = defLoader.pending.callbacks.length;
                });

                Assert.Equal(expect, actual);
            }

            [Fact]
            function shouldUpdatePendingDescriptorMap() {
                var actual;
                var expect = {"descMap": 123};
                mockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDef("descMap", 123, "callback");
                    actual = defLoader.pending.descriptorMap;
                });

                Assert.Equal(expect, actual);
            }
        }
    }

    [Fixture]
    function loadComponentDefs() {

        [Fact]
        function schedulePendingIfPendingIsNull() {
            var actual;
            var expect = "schedulePending called!";
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                defLoader.schedulePending = function() {
                    actual = "schedulePending called!";
                }
                defLoader.loadComponentDefs();
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function noSchedulePendingIfPendingIsNotNull() {
            var actual;
            var expect;
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                defLoader.pending = {};
                defLoader.schedulePending = function() {
                    actual = "schedulePending called!";
                }
                defLoader.loadComponentDefs();
            });

            Assert.Equal(expect, actual);
        }

        [Fixture]
        function callbackIsPassedAndIsAFunction() {

            [Fact]
            function shouldUpdatePendingCallbacks() {
                var actual;
                var expect = 1;
                mockAura(function () {
                    var dummyCallback = function() {};
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDefs({"descMap": 123}, dummyCallback);
                    actual = defLoader.pending.callbacks.length;
                });

                Assert.Equal(expect, actual);
            }

            [Fact]
            function shouldUpdatePendingDescriptorMap() {
                var actual;
                var expect = {"descMap": 123};
                mockAura(function () {
                    var dummyCallback = function() {};
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDefs({"descMap": 123}, dummyCallback);
                    actual = defLoader.pending.descriptorMap;
                });

                Assert.Equal(expect, actual);
            }
        }

        [Fixture]
        function callbackIsNotPassed() {

            [Fact]
            function shouldUpdatePendingCallbacks() {
                var actual;
                var expect = 1;
                mockAura(function () {
                    var dummyCallback = function() {};
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDefs({"descMap": 123}, dummyCallback);
                    actual = defLoader.pending.callbacks.length;
                });

                Assert.Equal(expect, actual);
            }

            [Fact]
            function shouldUpdatePendingDescriptorMap() {
                var actual;
                var expect = {"descMap": 123};
                mockAura(function () {
                    var dummyCallback = function() {};
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDefs({"descMap": 123}, dummyCallback);
                    actual = defLoader.pending.descriptorMap;
                });

                Assert.Equal(expect, actual);
            }
        }

        [Fixture]
        function callbackIsPassedAndIsNotAFunction() {

            [Fact]
            function shouldUpdatePendingCallbacks() {
                var actual;
                var expect = 0;
                mockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDefs({"descMap": 123}, "callback");
                    actual = defLoader.pending.callbacks.length;
                });

                Assert.Equal(expect, actual);
            }

            [Fact]
            function shouldUpdatePendingDescriptorMap() {
                var actual;
                var expect = {"descMap": undefined};
                mockAura(function () {
                    var defLoader = new Aura.Component.ComponentDefLoader();
                    defLoader.pending = { 
                        callbacks: [],
                        descriptorMap: {}
                    };
                    defLoader.loadComponentDefs({"descMap": 123}, "callback");
                    actual = defLoader.pending.descriptorMap;
                });

                Assert.Equal(expect, actual);
            }
        }
    }
}
