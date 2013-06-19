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

[ Fixture ]
Test.Aura.Controller.ActionQueueTest = function() {
    // Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
    Mocks.GetMock(Object.Global(), "exp", function() {
    })(function() {
        // #import aura.controller.ActionQueue
    });

    var serverDef = {
        isServerAction : function() {
            return true;
        },
        isClientAction : function() {
            return false;
        }
    };

    var clientDef = {
        isServerAction : function() {
            return false;
        },
        isClientAction : function() {
            return true;
        }
    };

    [ Fixture ]
    function Constructor() {
        [ Fact ]
        function SetsTransactionId() {
            // Arrange
            var expected = -1;
            var target = new ActionQueue();

            // Act
            var actual = target.nextTransactionId;

            // Assert
            Assert.Equal(expected, actual);
        }

        [ Fact ]
        function SetsLastAbortableTransactionId() {
            // Arrange
            var expected = -1;
            var target = new ActionQueue();

            // Act
            var actual = target.lastAbortableTransactionId;

            // Assert
            Assert.Equal(expected, actual);
        }

        [ Fact ]
        function ActionsIsEmptyAfterInit() {
            // Arrange
            var expected = 0;
            var target = new ActionQueue();

            // Act
            var actual = target.actions.length;

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function Enqueue() {
        [ Fact ]
        function EnqueuesAction() {
            // Arrange
            var expected = new Action();
            var target = new ActionQueue();

            // Act
            target.enqueue(expected);
            var actual = target.actions;

            // Assert
            Assert.Equal([ expected ], actual);
        }

        [ Fact ]
        function EnqueuesAbortableAction() {
            // Arrange
            var expected = new Action();
            expected.setAbortable(true);
            var target = new ActionQueue();

            // Act
            target.enqueue(expected);
            target.enqueue(expected);
            var actual = target.actions;

            // Assert
            Assert.Equal([ expected, expected ], actual);
            Assert.True(actual[0].isAbortable());
        }

        [ Fact ]
        function CallsClearPreviousAbortableActionsWhenAbortableActionIsEnqueuedOnNewTransaction() {
            var expected = [ "lastTransaction" ];
            var abortable = new Action();
            abortable.setAbortable(true);
            var target = new ActionQueue();
            target.incrementNextTransactionId();
            target.clearPreviousAbortableActions = Stubs.GetMethod("queue", []);
            target.actions = expected;

            target.enqueue(abortable);

            Assert.Equal([ {
                Arguments : {
                    queue : expected
                },
                // abortable not returned but pushed onto returned list
                ReturnValue : [ abortable ]
            } ], target.clearPreviousAbortableActions.Calls);
        }

        [ Fact ]
        function DoesNotCallClearPreviousAbortableActionsWhenAbortableActionIsEnqueuedOnCurrentTransaction() {
            var abortable = new Action();
            abortable.setAbortable(true);
            var target = new ActionQueue();
            target.clearPreviousAbortableActions = Stubs.GetMethod();

            target.enqueue(abortable);

            Assert.Equal(0, target.clearPreviousAbortableActions.Calls.length);
        }

        [ Fact ]
        function DoesNotCallClearPreviousAbortableActionsWhenNonAbortableActionIsEnqueuedOnNewTransaction() {
            var action = new Action();
            var target = new ActionQueue();
            target.incrementNextTransactionId();
            target.clearPreviousAbortableActions = Stubs.GetMethod();

            target.enqueue(action);

            Assert.Equal(0, target.clearPreviousAbortableActions.Calls.length);
        }
    }

    [ Fixture ]
    function ClearPreviousAbortableActions() {
        [ Fact ]
        function PrunesOldAbortableAction() {
            var old = new Action();
            old.setAbortable(true);
            var expected = new Action();
            expected.setAbortable(true);
            var target = new ActionQueue();
            target.actions = [ old ];
            target.incrementNextTransactionId();

            target.enqueue(expected);
            var actual = target.actions;

            Assert.Equal([ expected ], actual);
        }

        [ Fact ]
        function PrunesOldAbortableActionsFromSet() {
            var oldest = new Action();
            oldest.setAbortable(true);
            var nonAbortable1 = new Action();
            var older = new Action();
            older.setAbortable(true);
            var nonAbortable2 = new Action();
            var old = new Action();
            old.setAbortable(true);
            var expected = new Action();
            expected.setAbortable(true);
            var target = new ActionQueue();
            target.actions = [ oldest, nonAbortable1, older, nonAbortable2, old ];
            target.incrementNextTransactionId();

            target.enqueue(expected);
            var actual = target.actions;

            Assert.Equal([ nonAbortable1, nonAbortable2, expected ], actual);
        }

        [ Fact ]
        function CallsAbortOnPrunedActions() {
            var older = new Action();
            older.setAbortable(true);
            older.abort = Stubs.GetMethod();
            var nonAbortable = new Action();
            nonAbortable.abort = Stubs.GetMethod();
            var old = new Action();
            old.setAbortable(true);
            old.abort = Stubs.GetMethod();
            var expected = new Action();
            expected.setAbortable(true);
            expected.abort = Stubs.GetMethod();
            var target = new ActionQueue();
            target.actions = [ older, nonAbortable, old ];
            target.incrementNextTransactionId();

            target.enqueue(expected);

            Assert.Equal(1, older.abort.Calls.length);
            Assert.Equal(1, old.abort.Calls.length);
            Assert.Equal(0, expected.abort.Calls.length);
            Assert.Equal(0, nonAbortable.abort.Calls.length);
        }
    }

    [ Fixture ]
    function GetClientActions() {
        [ Fact ]
        function ReturnsEmptyListIfQueueEmpty() {
            var target = new ActionQueue();

            var actual = target.getClientActions();

            Assert.Equal([], actual);
        }

        [ Fact ]
        function ReturnsEmptyListIfNoClientActions() {
            var background = new Action(serverDef, null, null, true);
            var server = new Action(serverDef);
            var target = new ActionQueue();
            target.actions = [ background, server ];

            var actual = target.getClientActions();

            Assert.Equal([], actual);
            Assert.Equal([ background, server ], target.actions);
        }

        [ Fact ]
        function ReturnsClientAction() {
            var expected = new Action(clientDef);
            var target = new ActionQueue();
            target.actions = [ expected ];

            var actual = target.getClientActions();

            Assert.Equal([ expected ], actual);
            Assert.Equal([], target.actions);
        }

        [ Fact ]
        function ReturnsClientActionsFromSet() {
            var first = new Action(clientDef);
            var background = new Action(serverDef, null, null, true);
            var second = new Action(clientDef, null, null, true);
            var server = new Action(serverDef);
            var third = new Action(clientDef);
            var target = new ActionQueue();
            target.actions = [ first, background, second, server, third ];

            var actual = target.getClientActions();

            Assert.Equal([ first, second, third ], actual);
            Assert.Equal([ background, server ], target.actions);
        }
    }

    [ Fixture ]
    function GetServerActions() {
        [ Fact ]
        function ReturnsEmptyListIfQueueEmpty() {
            var target = new ActionQueue();

            var actual = target.getServerActions();

            Assert.Equal([], actual);
        }

        [ Fact ]
        function ReturnsEmptyListIfNoServerActions() {
            var background = new Action(serverDef, null, null, true);
            var client = new Action(clientDef);
            var target = new ActionQueue();
            target.actions = [ background, client ];

            var actual = target.getServerActions();

            Assert.Equal([], actual);
            Assert.Equal([ background, client ], target.actions);
        }

        [ Fact ]
        function ReturnsServerAction() {
            var expected = new Action(serverDef);
            var target = new ActionQueue();
            target.actions = [ expected ];

            var actual = target.getServerActions();

            Assert.Equal([ expected ], actual);
            Assert.Equal([], target.actions);
        }

        [ Fact ]
        function ReturnsServerActionsFromSet() {
            var first = new Action(serverDef);
            var background = new Action(serverDef, null, null, true);
            var second = new Action(serverDef);
            var client = new Action(clientDef);
            var third = new Action(serverDef);
            var target = new ActionQueue();
            target.actions = [ first, background, second, client, third ];

            var actual = target.getServerActions();

            Assert.Equal([ first, second, third ], actual);
            Assert.Equal([ background, client ], target.actions);
        }
    }

    [ Fixture ]
    function GetNextBackgroundAction() {
        [ Fact ]
        function ReturnsNullIfQueueEmpty() {
            var target = new ActionQueue();

            var actual = target.getNextBackgroundAction();

            Assert.Null(actual);
        }

        [ Fact ]
        function ReturnsNullIfNoBackgroundActions() {
            var server = new Action(serverDef);
            var client = new Action(clientDef);
            var target = new ActionQueue();
            target.actions = [ server, client ];

            var actual = target.getNextBackgroundAction();

            Assert.Null(actual);
            Assert.Equal([ server, client ], target.actions);
        }

        [ Fact ]
        function ReturnsFirstFromFront() {
            var expected = new Action(serverDef, null, null, true);
            var other = new Action(serverDef, null, null, true);
            var server = new Action(serverDef);
            var client = new Action(clientDef);
            var target = new ActionQueue();
            target.actions = [ expected, other, server, client ];

            var actual = target.getNextBackgroundAction();

            Assert.Equal(expected, actual);
            Assert.Equal([ other, server, client ], target.actions);
        }

        [ Fact ]
        function ReturnsFirstFromEnd() {
            var server = new Action(serverDef);
            var client = new Action(clientDef);
            var expected = new Action(serverDef, null, null, true);
            var target = new ActionQueue();
            target.actions = [ server, client, expected ];

            var actual = target.getNextBackgroundAction();

            Assert.Equal(expected, actual);
            Assert.Equal([ server, client ], target.actions);
        }
    }
}
