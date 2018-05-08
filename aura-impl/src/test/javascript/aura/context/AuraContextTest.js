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
Function.RegisterNamespace("Test.Aura.Context");

[Fixture]
Test.Aura.Context.AuraContextTest = function() {

    var Aura = {
        Context: {}, 
        time: function() { return 0; }
    };

    Mocks.GetMocks(Object.Global(), {
        Aura: Aura, 
        window: {}
    })(function(){
        [Import("aura-impl/src/main/resources/aura/context/AuraContext.js")]
    });

    /**
     * Invoke all the mocks recursively before invoking the callback
     */
    var withMocks = function(mocks, callback) {
        if (mocks.length > 0) {
            mocks.pop()(function() {
                withMocks(mocks, callback);
            });
        } else {
            callback();
        }
    };

    var mock$A = function(events) {
        return Mocks.GetMock(Object.Global(), '$A', Stubs.GetObject({}, {
            util: {
                apply: function(baseObject, members) {
                    for (var key in members) {
                        if (members.hasOwnProperty(key)) {
                            baseObject[key] = members[key];
                        }
                    }
                    return baseObject;
                },
                applyNotFromPrototype: function() {},
                isArray: function(obj) { return obj instanceof Array; },
                json: {
                    encode: function(value) {
                        return value;
                    }
                },
                getURIDefsState: function(){},
                isUndefinedOrNull: function (val) {
                    return val === undefined || val === null;
                }
            }, 
            services: {
                component: {
                    getDynamicNamespaces: function() {
                        return 'dn';
                    }
                }
            }
        }));
    }; 

    var mockAura = function(events) {
        return Mocks.GetMock(Object.Global(), 'Aura', Stubs.GetObject({}, {
            Provider: {
                GlobalValueProviders: function() {
                    return {
                        getValueProvider: function(name) {
                            return {
                                serializeForServer: function() {
                                    return name;
                                }
                            }
                        }
                    };
                }
            },
            "Json": {
                "ApplicationKey": {
                    "URIADDRESSABLEDEFINITIONS": "uad"
                }
            }
        }));
    };

    var mockJson = function() {
        return Mocks.GetMock(Object.Global(), 'Json', Stubs.GetObject({}, {
            "ApplicationKey": {
                "URIADDRESSABLEDEFINITIONS": "uad",
                "CDN_HOST": "cdn"
            }
        }));
    };

    [Fixture]
    function EncodeForServer() {

        [Fact]
        function IncludesDefaultConfig() {
            var mocks = [mock$A(), mockAura(), mockJson()],
                config = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    uad: 1,
                    loaded: { loadedOriginal: 'loadedOriginal' }
                },
                expected = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    loaded: { loadedOriginal: 'loadedOriginal' },
                    uad: true
                }, 
                actual;

            withMocks(mocks, function() {
                actual = new Aura.Context.AuraContext(config).encodeForServer(false, false);
            });

            Assert.Equal(expected, actual);
        }        

        [Fact]
        function IncludesDynamic() {
            var mocks = [mock$A(), mockAura(), mockJson()],
                config = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    uad: 0,
                    loaded: { loadedOriginal: 'loadedOriginal' }
                },
                expected = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    loaded: { loadedOriginal: 'loadedOriginal', loaded: 'loaded' },
                    dn: 'dn',
                    globals: '$Global',
                    uad: false
                }, 
                actual;

            withMocks(mocks, function() {
                var context = new Aura.Context.AuraContext(config);
                context.addLoaded({ key: 'loaded', value: 'loaded' });
                actual = context.encodeForServer(true);
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function IncludeCacheKeyForCacheableXHR() {
            var mocks = [mock$A(), mockAura(), mockJson()],
                config = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    uad: 0,
                    loaded: { loadedOriginal: 'loadedOriginal' },
                    apce: true,
                    apck: 'actionPublicCacheKey'
                },
                expected = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    loaded: { loadedOriginal : 'loadedOriginal' },
                    apck: 'actionPublicCacheKey',
                    uad: false
                }, 
                actual;

            withMocks(mocks, function() {
                var context = new Aura.Context.AuraContext(config);
                context.addLoaded({ key: 'loaded', value: 'loaded' });
                actual = context.encodeForServer(false, true);
            });

            Assert.Equal(expected, actual);
        }
    }
    

    [Fixture]
    function getURIDefsState() {

        var uriDefsMock = function(delegate) {
        	    withMocks([mock$A(), mockAura(), mockJson(), 
              Mocks.GetMocks(Object.Global(), {
                window: {
                    location: {
                        search: '?uriDefsState=%7B"bundleRequests"%3Afalse%2C"hydration"%3A"none"%7D'
                    }
                },
                document:{createDocumentFragment:function() {}},
                Json:function() {},
                Aura: Aura,
                $A:{
                    getContext: function() {
                        return {
                            isURIAddressableDefsEnabled: function() {
                                return true;
                            }
                        };
                    }
                }
              })], delegate
            );
        };

        [Fact]
        function returnURIDefStateIfDefined() {
            var actual;
            var expected = "damodamodamo";

            uriDefsMock(function(){
                var targetContext = new Aura.Context.AuraContext({});
                targetContext.uriDefsState = "damodamodamo";
                actual = targetContext.getURIDefsState();
            });

            Assert.Equal(expected, actual);
        }

        [Fixture]
        function URIDefStateUndefined() {

            [Fact]
            function uriDefsStateDefinedInURL() {
                var actual;
                var expected = {"bundleRequests":false, "hydration":"none", "createCmp":true};

                uriDefsMock(function(){
                    var targetContext = new Aura.Context.AuraContext({});
                    actual = targetContext.getURIDefsState();
                });
                Assert.Equal(expected, actual);
            }

            [Fact]
            function uriDefsStateDefinedInContext() {
                var actual;
                var expected = {"bundleRequests":true, "hydration":"one", "createCmp":true};

                uriDefsMock(function(){
                    window.location.search = '';
                    var targetContext = new Aura.Context.AuraContext({"uad":1});
                    actual = targetContext.getURIDefsState();
                });

                Assert.Equal(expected, actual);
            }

            [Fact]
            function uriDefsStateDefinedNotInContextOrURL() {
                var actual;
                var expected = null;

                uriDefsMock(function(){
                    window.location.search = '';
                    var targetContext = new Aura.Context.AuraContext({"uad":0});
                    actual = targetContext.getURIDefsState();
                });

                Assert.Equal(expected, actual);
            }
        }
    }

    [Fixture]
    function isCDNEnabled() {

        var cdnMock = function(delegate) {
            withMocks([mock$A(), mockAura(), mockJson(),
            Mocks.GetMocks(Object.Global(), {
                document:{createDocumentFragment:function() {}},
                Json:function() {},
                Aura: Aura,
                window: {
                    location: {
                        search: ''
                    }
                }
            })], delegate
            );
        };

        [Fact]
        function cdnHostIsNull() {
            var actual;
            var expected = false;

            cdnMock(function(){
                var targetContext = new Aura.Context.AuraContext({"cdn": null});
                actual = targetContext.isCDNEnabled();
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function cdnHostIsUndefined() {
            var actual;
            var expected = false;

            cdnMock(function(){
                var targetContext = new Aura.Context.AuraContext({"cdn": undefined});
                actual = targetContext.isCDNEnabled();
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function cdnHostIsNotNullOrUndefined() {
            var actual;
            var expected = true;

            cdnMock(function(){
                var targetContext = new Aura.Context.AuraContext({"cdn": "some-host"});
                actual = targetContext.isCDNEnabled();
            });

            Assert.Equal(expected, actual);
        }
    }
}
