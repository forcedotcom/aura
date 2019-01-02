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
Function.RegisterNamespace("Test.Aura");

[Fixture]
Test.Aura.LockerService = function () {
    var Aura = {
        Services: {
        }
    };
    var AuraLocker = {
        getMethodUsageMetrics: function () {
        }
    };
    var AuraLockerDisabled = AuraLocker;

    Mocks.GetMocks(Object.Global(), {
        Aura: Aura
    })(function () {
        [Import("aura-impl/src/main/resources/aura/lockerservice/LockerService.js")]
    });

    var getMocks = Mocks.GetMocks(Object.Global(), {
        Aura: Aura,
        window: {
            AuraLocker: AuraLocker,
            AuraLockerDisabled: AuraLockerDisabled
        }
    });

    [Fixture]
    function getMethodUsageMetricsTest() {
        [Fact]
        function testMethodIsFunction() {
            var actual;
            var expected = true;

            getMocks(function () {
                var target  = new Aura.Services.LockerService();
                actual = typeof target.getMethodUsageMetrics === "function";
            });

            Assert.Equal(expected, actual);
        }
    }
};
