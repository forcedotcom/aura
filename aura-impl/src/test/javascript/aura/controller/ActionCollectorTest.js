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

//Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
Mocks.GetMock(Object.Global(), "exp", function(){})(function(){
    Mocks.GetMock(Object.Global(), "$A", function(){})(function(){
        $A.ns = {};
        //#import aura.controller.ActionCollector
    });
});

Test.Aura.Controller.ActionCollectorTest = function(){
    [Fixture]
    function Constructor(){
        [Fact]
        function ActionsToSendToEmpty(){
            // Arrange
            var expected = [];
            var target = new $A.ns.ActionCollector();

            // Act
            var actual = target.actionsToSend;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ActionsToCompleteToEmpty(){
            // Arrange
            var expected = [];
            var target = new $A.ns.ActionCollector();

            // Act
            var actual = target.actionsToComplete;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsNumToMinus1(){
            // Arrange
            var expected = -1;
            var target = new $A.ns.ActionCollector();

            // Act
            var actual = target.num;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsToCollectTo0(){
            // Arrange
            var expected = 0;
            var target = new $A.ns.ActionCollector();

            // Act
            var actual = target.actionsToCollect;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ActionsRequestedSetsToCollect(){
            // Arrange
            var expected = 1;
            var target = new $A.ns.ActionCollector(["action"]);

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
            var target = new $A.ns.ActionCollector(expected);

            // Act
            var actual = target.getActionsRequested();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ActionsRequestedIsSettable(){
            // Arrange
            var expected = [ "action1", "action2" ];
            var target = new $A.ns.ActionCollector();
            target.actionsRequested = expected;

            // Act
            var actual = target.getActionsRequested();

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
