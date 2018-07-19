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
Function.RegisterNamespace("Test.Aura.MetricsPlugins");
[Fixture]
Test.Aura.MetricsPlugins.TransportMetricsPluginTest=function(){
    var Aura = {Services: {}};
    var target = undefined;
    Mocks.GetMocks(Object.Global(), {
        "window" : {},
        Aura: Aura,
        $A: {
            metricsService: {
                registerPlugin: function(obj) {
                    target = new obj.plugin();
                }
            }
        }
    })
    (function () {
        [Import("aura-impl/src/main/resources/aura/metrics/plugins/TransportMetricsPlugin.js")]
    });

    [Fixture]
    function TestServerTimingHeaderParsing() {
        var headerValue = undefined;
        var mockRequest = {
            getResponseHeader:function(r) {
                if (r === "Server-Timing") {
                    return headerValue;
                }
            }
        }

        [Fact, Data({value: "Total;dur=100", expected:100},
                    {value: "total ; dur = 123.4", expected:123},
                    {value: "Total=100", expected:undefined},
                    {value: "foo;dur=200, miss, total;dur=102", expected:102})]
        function ExtractServerTimingTotal(data) {
            headerValue = data.value;
            var actual = target.getServerTimingTotal(mockRequest);
            Assert.Equal(data.expected, actual);
        }

        [Fact, Data({value: "", expected:undefined},
                    {value: null, expected:undefined},
                    {value: undefined, expected:undefined},
                    {value: "Total;dur=", expected: undefined})]
        function InvalidServerTimingHeader(data) {
            headerValue = data.value;
            var actual = target.getServerTimingTotal(mockRequest);
            Assert.Equal(data.expected, actual);
        }
    }
}
