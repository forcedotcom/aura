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
Test.Aura.AuraEventServiceTest = function() {
    var Aura = {Services:{}, Event:{}};

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "AuraEventService": function(){}
    })(function() {
        Import("aura-impl/src/main/resources/aura/AuraEventService.js");
    });


    [Fixture]
    function newEvent() {

        var accessCheckedDef;

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                assert: function(value, msg) {
                    if (!value) {
                        throw new Error(msg);
                    }
                },
                clientService: {
                    allowAccess: function(def) {
                        accessCheckedDef = def;
                        return true;
                    }
                }
            }
        });

        [Fact]
        function DoesAccessCheck() {
            var eventDescr = "eventDescr";
            var expected = "expected";
            accessCheckedDef = null;

            mockA(function() {
                var target = new Aura.Services.AuraEventService();
                target.getEventDef = function(descriptor) {
                    if(descriptor === eventDescr) {
                        return expected;
                    }
                }
                target.newEvent(eventDescr);
            });

            Assert.Equal(expected, accessCheckedDef);
        }
    }

    [Fixture]
    function getNewEvent() {

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                lockerService: {
                    trust: function() {}
                },
                assert: function(value, msg) {
                    if (!value) {
                        throw new Error(msg);
                    }
                },
                clientService:{
                },
                getRoot: function(){}
            },
            "Json": { "ApplicationKey": { "DESCRIPTOR": "descriptor" } }
        });

        [Fact]
        function AcceptsStringEventDefinition() {
            var expectedEvtDef = {
                getEventType: function() {}
            };

            var actual;
            mockA(function() {
                var target = new Aura.Services.AuraEventService();
                target["eventDefRegistry"] = {"markup://eventDescr": expectedEvtDef};

                actual = target.getNewEvent("markup://eventDescr");
            });

            Assert.Equal(expectedEvtDef, actual.getDef());
        }
    }
}
