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
Function.RegisterNamespace("Test.Aura.Metrics");
[Fixture]
Test.Aura.Metrics.AuraMetricsServiceTest=function(){
    var Aura = {Services: {}};

    Mocks.GetMocks(Object.Global(), {
        "window" : {},
        Aura: Aura
    })
    (function () {
        [Import("aura-impl/src/main/resources/aura/metrics/AuraMetricsService.js")]
    });

    [Fixture]
    function Instrument() {
        [Fact]
        function RetainsParameterAsArrayInBeforeHook() {
            var target = new Aura.Services.MetricsService();
            target.markStart = function(){};
            target.markEnd = function(){};
            var beforeHookParam;
            var testObject = {
                    testMethod: function() {
                    }
            };
            var beforeHook = function(mark,a) {
                beforeHookParam = a;
            }

            target.instrument(testObject, "testMethod", "metricsPluginTest", false, beforeHook);
            testObject.testMethod(["first","second"]);

            Assert.True(beforeHookParam instanceof Array);
        }

        [Fact]
        function RetainsParameterAsArrayInAfterHook() {
            var target = new Aura.Services.MetricsService();
            target.markStart = function(){};
            target.markEnd = function(){};
            var afterHookParam;
            var testObject = {
                    testMethod: function() {
                    }
            };
            var afterHook = function(mark,a) {
                afterHookParam = a;
            }

            target.instrument(testObject, "testMethod", "metricsPluginTest", false, undefined, afterHook);
            testObject.testMethod(["first","second"]);

            Assert.True(afterHookParam instanceof Array);
        }

        [Fact]
        function RetainsParameterAsArrayInOriginalFunction() {
            var target = new Aura.Services.MetricsService();
            target.markStart = function(){};
            target.markEnd = function(){};
            var originalFuncParam;
            var testObject = {
                    testMethod: function(a) {
                        originalFuncParam = a;
                    }
            };
            var beforeHook = function(mark,a) {
            }

            target.instrument(testObject, "testMethod", "metricsPluginTest", false, beforeHook);
            testObject.testMethod(["first","second"]);

            Assert.True(originalFuncParam instanceof Array);
        }
    }

    [Fixture]
    function RegisterPlugin() {
        [Fact]
        function AddsPluginToListOfPluginInstancesAfterInitialization() {
            var expected = {
                    initialize: function(){}
            }
            var target = new Aura.Services.MetricsService();
            target.pluginsInitialized = true; // emulate post-initialization scenario

            target.registerPlugin({
                "name"   : "TestPlugin",
                "plugin" : expected
            });
            var actual = target.pluginInstances["TestPlugin"];

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function ResourcePerfInfo() {

        [Fact]
        function SummarizeResourcePerfInfoIncludesInitiatorType() {
            var expected = "SCRIPT";

            var target = new Aura.Services.MetricsService();
            var actual = target.summarizeResourcePerfInfo({
                "initiatorType": expected
            }).initiatorType;

            Assert.Equal(expected, actual);
        }
    }
}
