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
            }
        }));
    }; 

    [Fixture]
    function EncodeForServer() {

        [Fact]
        function IncludesDefaultConfig() {
            var mocks = [mock$A(), mockAura()], 
                config = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    loaded: { loadedOriginal: 'loadedOriginal' }
                },
                expected = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    loaded: { loadedOriginal: 'loadedOriginal' }
                }, 
                actual;

            withMocks(mocks, function() {
                actual = new Aura.Context.AuraContext(config).encodeForServer(false, false);
            });

            Assert.Equal(expected, actual);
        }        

        [Fact]
        function IncludesDynamic() {
            var mocks = [mock$A(), mockAura()], 
                config = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    loaded: { loadedOriginal: 'loadedOriginal' }
                },
                expected = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    loaded: { loadedOriginal: 'loadedOriginal', loaded: 'loaded' },
                    dn: 'dn',
                    globals: '$Global'
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
            var mocks = [mock$A(), mockAura()], 
                config = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    loaded: { loadedOriginal: 'loadedOriginal' },
                    apce: true,
                    apck: 'actionPublicCacheKey'
                },
                expected = {
                    mode: 'mode',
                    fwuid: 'fwuid',
                    app: 'app',
                    loaded: { loadedOriginal : 'loadedOriginal' },
                    apck: 'actionPublicCacheKey'
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
}
