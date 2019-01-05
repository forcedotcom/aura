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
Function.RegisterNamespace("Test.Aura.Provider");

[ Fixture ]
Test.Aura.Provider.GlobalValueProvidersTest = function() {
    var Aura = {
        afterBootstrapReady: [],
        Provider: {
            ObjectValueProvider: function(){},
            LabelValueProvider: function(){},
            ContextValueProvider: function(){}
        }
    };

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "GlobalValueProviders": function(){}
    })(function () {
        [Import("aura-impl/src/main/resources/aura/provider/GlobalValueProviders.js")]
    });

    function getAuraMock(during) {
        return Mocks.GetMocks(Object.Global(), {
            "Aura": Aura,
            "$A": {
                util: Stubs.GetObject({
                    apply: function(to, from){}
                })
            }
        })(during);
    }

    [Fixture]
    function Constructor() {

        [Fact]
        function initializesBrowserGvp() {
            getAuraMock(function () {
                var target = new Aura.Provider.GlobalValueProviders({});

                Assert.True(target.valueProviders.$Browser instanceof Aura.Provider.ObjectValueProvider);
            });
        }

        [Fact]
        function initializesLabelGvp() {
            getAuraMock(function () {
                var target = new Aura.Provider.GlobalValueProviders({});

                Assert.True(target.valueProviders.$Label instanceof Aura.Provider.LabelValueProvider);
            });
        }

        [Fact]
        function initializesLocaleGvp() {
            getAuraMock(function () {
                var target = new Aura.Provider.GlobalValueProviders({});

                Assert.True(target.valueProviders.$Locale instanceof Aura.Provider.ObjectValueProvider);
            });
        }

        [Fact]
        function initializesGlobalGvp() {
            getAuraMock(function () {
                var target = new Aura.Provider.GlobalValueProviders({});

                Assert.True(target.valueProviders.$Global instanceof Aura.Provider.ContextValueProvider);
            });
        }

        [Fact]
        function appendsExternalGvps() {
            var RecordGVP = function() {};
            getAuraMock(function () {
                var expected = {
                    $Record: new RecordGVP()
                };
                $A.globalValueProviders = expected;

                var target = new Aura.Provider.GlobalValueProviders({});

                Assert.Equal({
                    to: target.valueProviders, from: expected}, {
                    to: $A.util.apply.Calls[0].Arguments.to, from: $A.util.apply.Calls[0].Arguments.from
                });
            });

        }

        [Fact]
        function addMethodsToExternalGvps() {
            var RecordGVP = function() {};
            getAuraMock(function () {
                $A.globalValueProviders = {
                    $Record: new RecordGVP()
                };

                new Aura.Provider.GlobalValueProviders({});

                var recordGvp = $A.globalValueProviders.$Record;
                Assert.Equal({
                    getValues: true, get: true, merge: true}, {
                    getValues: "getValues" in recordGvp, get: "get" in recordGvp, merge: "merge" in recordGvp
                });
            });
        }

        [Fact]
        function mergesInitialGvpData() {
            getAuraMock(function () {
                var expectedGvpData = [{
                    type: "$Record", values: {def: "456"}}, {
                    type: "$Content", values: {geh: "789"}
                }];

                var target = new Aura.Provider.GlobalValueProviders({
                    $Global: {abc: '123'},
                    $Record: {def: '456'},
                    $Content: {geh: '789'}
                });
                target.merge = Stubs.GetMethod("gvps", "doNotPersist", undefined);
                Aura.afterBootstrapReady[0]();

                Assert.Equal({
                    gvps: expectedGvpData, doNotPersist: true}, {
                    gvps: target.merge.Calls[0].Arguments.gvps, doNotPersist: target.merge.Calls[0].Arguments.doNotPersist
                });
            });
        }
    }
}
