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
Test.Aura.Context.AuraContextTest = function () {

    var Aura = { Context: {} };
    Mocks.GetMocks(Object.Global(), {
        Aura: Aura
    })(function () {
        [Import("aura-impl/src/main/resources/aura/context/AuraContext.js")]
    });


    [Fixture]
    function PruneLoaded() {
        // mock necessary framework parts with custom return value for $A.componentService.getDef()
        var mockFramework = function(getDefReturnValue) {
            function Action() {}
            Action.getStorage = function() {};
            Action.prototype.getId = function() {};

            function GlobalValueProviders(ignored, callback) {
                callback(this);
            }
            GlobalValueProviders.prototype.getValueProvider = function() { };

            return Mocks.GetMocks(Object.Global(), {
                "Aura" : {
                    "Provider" : {
                        "GlobalValueProviders" : GlobalValueProviders
                    }
                },
                "$A" : {
                    log : function(msg) { },
                    componentService : {
                        getComponentDef : function(desc) {
                            return getDefReturnValue;
                        }
                    },
                    util: {
                        isArray: function() { return false; },
                        apply: function(baseObject) { return baseObject; }
                    }
                },
                "Action" : Action
            });
        };

        [Fact]
        function ShouldSaveIfComponentPruned() {
            var saveToStorage = Stubs.GetMethod("force", undefined);
            var getDefReturnValue = undefined; // no def causing foo:bar to not be found

            mockFramework(getDefReturnValue)(function() {
                // arrange
                var target = new Aura.Context.AuraContext({loaded: { "COMPONENT@markup://foo:bar": "123" }});
               target.saveToStorage = saveToStorage;

                // act
                target.pruneLoaded();

            });

            // assert
            Assert.True(saveToStorage.Calls[0].Arguments.force);

        }

        [Fact]
        function ShouldNotSaveIfNoComponentPruned() {
            var saveToStorage = Stubs.GetMethod("force", undefined);
            var getDefReturnValue = {}; // a fake def for foo:bar

            mockFramework(getDefReturnValue)(function() {
                // arrange
                var target = new Aura.Context.AuraContext({loaded: { "COMPONENT@markup://foo:bar": "123" }});
                target.saveToStorage = saveToStorage;

                // act
                target.pruneLoaded();
            });

            // assert
            Assert.Equal(0, saveToStorage.Calls.length);

        }

        [Fact]
        function ShouldNotSaveIfOnlyApplication() {
            var saveToStorage = Stubs.GetMethod("force", undefined);
            var getDefReturnValue = {}; // a fake def, won't be requested

            mockFramework(getDefReturnValue)(function() {
                // arrange
                var target = new Aura.Context.AuraContext({loaded: { "APPLICATION@markup://foo:bar": "123" }});
                target.saveToStorage = saveToStorage;

                // act
                target.pruneLoaded();
            });

            // assert
            Assert.Equal(0, saveToStorage.Calls.length);
        }

        [Fact]
        function ShouldSaveIfComponentPrunedAndApplicationRemains() {
            var saveToStorage = Stubs.GetMethod("force", undefined);
            var getDefReturnValue = null; // no def causing foo:baz to not be found

            mockFramework(getDefReturnValue)(function() {
                // arrange
                var target = new Aura.Context.AuraContext({loaded: { "APPLICATION@markup://foo:bar": "123", "COMPONENT@markup://foo:baz": "456" }});
                target.saveToStorage = saveToStorage;

                // act
                target.pruneLoaded();
            });

            // assert
            Assert.True(saveToStorage.Calls[0].Arguments.force);
        }
    }

};
