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
    //#import aura.controller.ActionQueue
});

Test.Aura.Controller.ActionQueueTest = function(){
  [Fixture]
  function Constructor(){
      [Fact]
      function SetGroupNumber(){
            // Arrange
            var expected = -1;
            var target = new ActionQueue();

            // Act
            var actual = target.nextActionGroupNumber;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetLatAbortableNumber(){
            // Arrange
            var expected = -1;
            var target = new ActionQueue();

            // Act
            var actual = target.lastAbortableActionGroupNumber;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ActionsIsEmptyAfterInit(){
            // Arrange
            var expected = 0;
            var target = new ActionQueue();

            // Act
            var actual = target.actions.length;

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function Enqueue(){
        [Fact]
        function ActionIsEnqueued(){
            // Arrange
            var expected = new Action();
            var target = new ActionQueue();

            // Act
            target.enqueue(expected);
            var actual = target.actions[0];

            // Assert
            Assert.Equal(expected, actual);
            Assert.Equal(1, target.actions.length);
        }

        [Fact]
        function AbortableActionIsEnqueued(){
            // Arrange
            var expected = new Action();
            var target = new ActionQueue();

            // Act
            expected.setAbortable(true);
            target.enqueue(expected);
            target.enqueue(expected);
            var actual = target.actions[0];

            // Assert
            Assert.Equal(expected, actual);
            Assert.Equal(2, target.actions.length);
            Assert.True(actual.isAbortable());
        }

        [Fact]
        function OldAbortableActionPruned(){
            // Arrange
            var expected = new Action();
            var target = new ActionQueue();

            // Act
            expected.setAbortable(true);
            target.enqueue(expected);
            target.incrementNextActionGroupNumber();
            target.enqueue(expected);
            var actual = target.actions[0];

            // Assert
            Assert.Equal(expected, actual);
            Assert.Equal(1, target.actions.length);
            Assert.True(actual.isAbortable());
        }
    }
}
