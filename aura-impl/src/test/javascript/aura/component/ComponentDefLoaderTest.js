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
            "componentDefLoaderError": {},
            "System": {
                "DefDescriptor": function(desc){
                    this.prefix = "markup";
                    if (desc.indexOf("://") != -1) {
                        var pieces = desc.split("://");
                        this.prefix = pieces[0];
                        desc = pieces[1];
                    }
                    var parts = desc.split(":");
                    this.getName = function() {
                        return parts[1];
                    };
                    this.getNamespace = function() {
                        return parts[0];
                    };
                }
            }
        },
        "$A": {
            util: {
                "getHashCode": function() {
                    return 555555;
                },
                "isArray": typeof Array.isArray === "function" ? Array.isArray : function(arg) {
                  return Object.prototype.toString.call(arg) === '[object Array]';
                },
                "isString": function(obj){
                    return typeof obj === 'string';
                },
                "isUndefinedOrNull": function(obj) {
                    return obj === undefined || obj === null;
                }
            },
            clientService: {
                isInternalNamespace: function(){return false},
                isPrivilegedNamespace: function(){return false},
                _host: ""
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
                return {
                    "cdnHost": "cdnHost",
                    "styleContext":{},
                    "getContextPath": function(){return "";},
                    "getURIDefsState": function() {
                        return { "hydration": "test_hydration_val" };
                    }
               };
            },
            "get": function(thing) {
                return null;
            },
            "componentService": {
                "hasCacheableDefinitionOfAnyType": function() { return false; }
            }
        },
        //Need to add a ref to itself to handle global defaults
        "ComponentDefLoader": _componentDefLoader,
        "document": {
            "cookie": "sample cookie values"
        },
        "window": {
            "navigator": {"userAgent": "sample user agent string"}
        }
    };

    var mockAura = Mocks.GetMocks(Object.Global(), defaultMock);

    [Fixture]
    function defaults() {

        [Fact]
        function defaultVariablesDefined() {
            var actual;
            var expect = "_uid,_def,aura.app,_hydration,_l,LATEST,/auraCmpDef?,markup://";
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
                    defLoader.MARKUP_param
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
            var expect = "cdnHost/auraCmpDef?aura.app=markup://test_type&_hydration=test_hydration_val&_l=true&_def=test_descriptor&_uid=some_URI";
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                actual = defLoader.buildComponentUri("test_descriptor", "some_URI");
            });
            Assert.Equal(expect, actual);
        }

        [Fact]
        function shouldUseDefaultURIValueIfOneIsNotPassed() {
            var actual;
            var expect = "cdnHost/auraCmpDef?aura.app=markup://test_type&_hydration=test_hydration_val&_l=true&_def=test_descriptor&_uid=LATEST";
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
                        "getContext": function() {
                            return {"getURIDefsState": function() { return null; }}
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
                        "getContext": function() {
                            return {"getURIDefsState": function() { return null; }}
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

        [Fact]
        function shouldReturnEmptyArrayWithNoDescriptors() {
            var actual;
            var expect = [];
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                var descriptorMap = {};
                actual = defLoader.buildBundleComponentUri(descriptorMap);
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function shouldBuildOneBundleURI() {
            var actual;
            var expect = 1;
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                var descriptorMap = {"test:thing": "someUid"};
                actual = defLoader.buildBundleComponentUri(descriptorMap).length;
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function shouldBuildBundleURI() {
            var actual;
            var expect = '/auraCmpDef?aura.app=markup://test_type&_hydration=test_hydration_val&_l=true&test=thing&_uid=someUid';
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                var descriptorMap = {"test:thing": "someUid"};
                actual = defLoader.buildBundleComponentUri(descriptorMap)[0];
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function shouldSplitTooLongRequestIntoTwoURIs(){
            var actual;
            var expect = 2;
            mockAura(function () {
                var defLoader = new Aura.Component.ComponentDefLoader();
                var descriptorMap = {};
                // generate enough descriptors to exceed 16k limit
                for (var namespace=0; namespace < 5; namespace++) {
                    for (var name=0; name < 500; name++) {
                        descriptorMap["namespace" + namespace + ":name" + name] = namespace + "uid" + name;
                    }
                }
                actual = defLoader.buildBundleComponentUri(descriptorMap).length;
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function shouldSplitTooLongRequestIntoTwoValidURIs(){
            var actual;
            var expect = [
                "/auraCmpDef?aura.app=markup://test_type&_hydration=test_hydration_val&_l=true&namespace0=name0,name1,name10,name11,name12,name13,name14,name15,name16,name17,name18,name19,name2,name20,name21,name22,name23,name24,name25,name26,name27,name28,name29,name3,name30,name31,name32,name33,name34,name35,name36,name37,name38,name39,name4,name40,name41,name42,name43,name44,name45,name46,name47,name48,name49,name5,name50,name51,name52,name53,name54,name55,name56,name57,name58,name59,name6,name60,name61,name62,name63,name64,name65,name66,name67,name68,name69,name7,name70,name71,name72,name73,name74,name75,name76,name77,name78,name79,name8,name80,name81,name82,name83,name84,name85,name86,name87,name88,name89,name9,name90,name91,name92,name93,name94,name95,name96,name97,name98,name99&namespace1=name0,name1,name10,name11,name12,name13,name14,name15,name16,name17,name18,name19,name2,name20,name21,name22,name23,name24,name25,name26,name27,name28,name29,name3,name30,name31,name32,name33,name34,name35,name36,name37,name38,name39,name4,name40,name41,name42,name43,name44,name45,name46,name47,name48,name49,name5,name50,name51,name52,name53,name54,name55,name56,name57,name58,name59,name6,name60,name61,name62,name63,name64,name65,name66,name67,name68,name69,name7,name70,name71,name72,name73,name74,name75,name76,name77,name78,name79,name8,name80,name81,name82,name83,name84,name85,name86,name87,name88,name89,name9,name90,name91,name92,name93,name94,name95,name96,name97,name98,name99&_uid=555555",
                "/auraCmpDef?aura.app=markup://test_type&_hydration=test_hydration_val&_l=true&namespace2=name0,name1,name10,name11,name12,name13,name14,name15,name16,name17,name18,name19,name2,name20,name21,name22,name23,name24,name25,name26,name27,name28,name29,name3,name30,name31,name32,name33,name34,name35,name36,name37,name38,name39,name4,name40,name41,name42,name43,name44,name45,name46,name47,name48,name49,name5,name50,name51,name52,name53,name54,name55,name56,name57,name58,name59,name6,name60,name61,name62,name63,name64,name65,name66,name67,name68,name69,name7,name70,name71,name72,name73,name74,name75,name76,name77,name78,name79,name8,name80,name81,name82,name83,name84,name85,name86,name87,name88,name89,name9,name90,name91,name92,name93,name94,name95,name96,name97,name98,name99&_uid=555555"
            ];
            mockAura(function () {
                $A.util.isIE = true;
                var defLoader = new Aura.Component.ComponentDefLoader();
                var descriptorMap = {};
                // generate enough descriptors to exceed 16k limit
                for (var namespace=0; namespace < 3; namespace++) {
                    for (var name=0; name < 100; name++) {
                        descriptorMap["namespace" + namespace + ":name" + name] = namespace + "uid" + name;
                    }
                }
                try {
                    actual = defLoader.buildBundleComponentUri(descriptorMap);
                } finally {
                    $A.util.isIE = false;
                }
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function shouldSplitTooLongRequestInOneNamespaceIntoTwoValidURIs(){
            var actual;
            var expect = [
                "/auraCmpDef?aura.app=markup://test_type&_hydration=test_hydration_val&_l=true&namespace0=name0,name1,name10,name100,name101,name102,name103,name104,name105,name106,name107,name108,name109,name11,name110,name111,name112,name113,name114,name115,name116,name117,name118,name119,name12,name120,name121,name122,name123,name124,name125,name126,name127,name128,name129,name13,name130,name131,name132,name133,name134,name135,name136,name137,name138,name139,name14,name140,name141,name142,name143,name144,name145,name146,name147,name148,name149,name15,name150,name151,name152,name153,name154,name155,name156,name157,name158,name159,name16,name160,name161,name162,name163,name164,name165,name166,name167,name168,name169,name17,name170,name171,name172,name173,name174,name175,name176,name177,name178,name179,name18,name180,name181,name182,name183,name184,name185,name186,name187,name188,name189,name19,name190,name191,name192,name193,name194,name195,name196,name197,name198,name199,name2,name20,name200,name201,name202,name203,name204,name205,name206,name207,name208,name209,name21,name210,name211,name212,name213,name214,name215,name216,name217,name218,name219,name22,name220,name221,name222,name223,name224,name225,name226,name227,name228,name229,name23,name230,name231,name232,name233,name234,name235,name236,name237,name238,name239,name24,name240,name241,name242,name243,name244,name245,name246,name247,name248,name249,name25,name250,name251,name252,name253,name254,name255,name256,name257,name258,name259,name26,name260,name261,name262,name263,name264,name265,name266,name267,name268,name269,name27,name270,name271,name272,name273,name274,name275,name276,name277,name278,name279,name28,name280,name281,name282,name283,name284,name285,name286,name287,name288,name289,name29,name290,name291,name292,name293,name294,name295,name296,name297,name298,name299,name3,name30,name31,name32&_uid=555555",
                "/auraCmpDef?aura.app=markup://test_type&_hydration=test_hydration_val&_l=true&namespace0=name33,name34,name35,name36,name37,name38,name39,name4,name40,name41,name42,name43,name44,name45,name46,name47,name48,name49,name5,name50,name51,name52,name53,name54,name55,name56,name57,name58,name59,name6,name60,name61,name62,name63,name64,name65,name66,name67,name68,name69,name7,name70,name71,name72,name73,name74,name75,name76,name77,name78,name79,name8,name80,name81,name82,name83,name84,name85,name86,name87,name88,name89,name9,name90,name91,name92,name93,name94,name95,name96,name97,name98,name99&_uid=555555"
            ];
            mockAura(function () {
                $A.util.isIE = true;
                var defLoader = new Aura.Component.ComponentDefLoader();
                var descriptorMap = {};
                // generate enough descriptors to exceed 16k limit
                for (var namespace=0; namespace < 1; namespace++) {
                    for (var name=0; name < 300; name++) {
                        descriptorMap["namespace" + namespace + ":name" + name] = namespace + "uid" + name;
                    }
                }
                try {
                    actual = defLoader.buildBundleComponentUri(descriptorMap);
                } finally {
                    $A.util.isIE = false;
                }
            });

            Assert.Equal(expect, actual);
        }

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
