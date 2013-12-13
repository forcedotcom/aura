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

Function.RegisterNamespace("Test.Aura.Controller");

[Fixture]
Test.Aura.Controller.ActionCollectorTest = function(){
    var $A = {
        ns : {},
        assert: function(condition, message) {
            if (!condition) {
                var error = new Error(message);
                throw error;
            }
        },
        util: {
            isFunction: function(obj){
                return false;
            }
        }
    };

    var mockAura = Mocks.GetMocks(Object.Global(), { "$A": $A });

    //Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
    Mocks.GetMocks(Object.Global(), { "exp": function(){}, "$A":$A})(function(){
        //#import aura.controller.ActionCollector
    });

    [Fixture]
    function Constructor(){
        [Fact]
        function ActionsToSendToEmpty(){
            // Arrange
            var expected = [];
            var target;
            mockAura(function(){
                target = new $A.ns.ActionCollector();
            });

            // Act
            var actual = target.actionsToSend;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ActionsToCompleteToEmpty(){
            // Arrange
            var expected = [];
            var target;
            mockAura(function(){
                target = new $A.ns.ActionCollector();
            });

            // Act
            var actual = target.actionsToComplete;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsNumToMinus1(){
            // Arrange
            var expected = -1;
            var target;
            mockAura(function(){
                target = new $A.ns.ActionCollector();
            });

            // Act
            var actual = target.num;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsToCollectTo0(){
            // Arrange
            var expected = 0;
            var target;
            mockAura(function(){
                target = new $A.ns.ActionCollector();
            });

            // Act
            var actual = target.actionsToCollect;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ActionsRequestedSetsToCollect(){
            // Arrange
            var expected = 1;
            var target;
            mockAura(function(){
                target = new $A.ns.ActionCollector(["action"]);
            });

            // Act
            var actual = target.actionsToCollect

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function GetActionsRequested() {
        [Fact]
        function ActionsRequestedStartsAsInput(){
            // Arrange
            var expected = [ "action" ];
            var target;
            mockAura(function(){
                target = new $A.ns.ActionCollector(expected);
            });

            // Act
            var actual = target.getActionsRequested();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ActionsRequestedIsSettable(){
            // Arrange
            var expected = [ "action1", "action2" ];
            var target;
            mockAura(function(){
                target = new $A.ns.ActionCollector();
            });
            target.actionsRequested = expected;

            // Act
            var actual = target.getActionsRequested();

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
