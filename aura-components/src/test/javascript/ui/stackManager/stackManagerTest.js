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

Function.RegisterNamespace("Test.Components.Ui.StackManager");

[Fixture]
Test.Components.Ui.StackManager.StackManagerTest = function() {

    var stackManager = null;

    ImportJson(
        "aura-components/src/main/components/ui/stackManagerLib/stackManager.js",
        function(path,result){
            stackManager = result();
        }
    );

    var mock$A = Mocks.GetMock(Object.Global(),"$A",{
        util:{
            isString: function(cmp) {
                return false;
            },
            isComponent: function(cmp) {
                return true;
            },
            isFunction: function(func) {
                return (typeof(func) === 'function');
            }
        },
        assert: function(obj, msg) {
            if (!obj) {
                throw msg;
            }
        }
    });

    var mockHTMLElement = Mocks.GetMock(Object.Global(), "HTMLElement", function(){});

    /*******************************
     Helper functions
     *******************************/
    function newMockElement(stackContextRoot, zIndex, parentNode) {
        parentNode = parentNode ? parentNode : null;

        var node = {
            parentNode: parentNode,
            childNodes: [],
            nodeType: 1,
            tagName: "DIV",
            _stackContextRoot: stackContextRoot,
            style: {
                zIndex: zIndex
            },
            getElement: function() {
                return this;
            }
        };

        if (parentNode) {
            parentNode.childNodes.push(node);
        }

        return node;
    }

    function createChildren(parentNode, numChildren) {
        // initial zIndeces: 1,2,3,4,5,...
        for (var i = 1; i <= numChildren; i++) {
            newMockElement(false, i.toString(), parentNode);
        }
        return parentNode.childNodes;
    }

    function verifyZIndices (elements, expectedZIndices) {
        var actualIndices = [];
        for(var i = 0; i < elements.length; i++) {
            actualIndices.push(elements[i].style.zIndex);
        }
        actualIndices = actualIndices.toString();

        if (Array.isArray(expectedZIndices)) {
            expectedZIndices = expectedZIndices.toString();
        }
        Assert.Equal(expectedZIndices, actualIndices);
    }

    /*******************************
     Tests Start Here
     *******************************/
    [Fixture]
    function stackingCtxRootTests () {
        [Fact]
        function testSetStackingCtxRoot() {
            var stubEl = newMockElement(false, "0");

            mock$A(function() {
                mockHTMLElement(function() {
                    stackManager.setStackingContextRoot(stubEl);
                });
            });

            Assert.True(stubEl._stackContextRoot);
        }
    }

    [Fixture]
    function zIndices () {

        [Fact, Data({
            move: stackManager.sendToBack,
            expectedZIndices: "1,2,0,4,5"
        }, {
            move: stackManager.bringToFront,
            expectedZIndices: "1,2,6,4,5"
        })]
        function testBasic(data) {
            var parentEl = newMockElement(true, "auto");
            var children = createChildren(parentEl, 5);

            mock$A(function() {
                mockHTMLElement(function() {
                    data.move(children[2]);
                    data.move(children[2]);
                });
            });

            verifyZIndices(children, data.expectedZIndices);
        }

         /**
          * Verify sendToBack increments the zIndeces of all the other
          * elements when the lowest layer is already occupied
          */
        [Fact]
        function testSendTobackBumpIndices() {
            var parentEl = newMockElement(true, "auto");
            var children = createChildren(parentEl, 5);

            var presetZIndices = ['1', '0', '3', '4', '5'];
            for (var i = 0; i < presetZIndices.length; i++) {
                children[i].style.zIndex = presetZIndices[i];
            }

            mock$A(function() {
                mockHTMLElement(function() {
                    stackManager.sendToBack(children[2]);
                });
            });

            verifyZIndices(children, '2,1,0,5,6');
        }

        /**
         * Verify bringToFront/sendToBack on the same element don't keep updating
         * zIndeces when the values are correct already
         */
        [Fact, Data({
            move: stackManager.sendToBack,
            expectedZIndices: "1,0,3"
        }, {
            move: stackManager.bringToFront,
            expectedZIndices: "1,4,3"
        })]
        function testMoveElementTwice(data) {
            var parentEl = newMockElement(true, "auto");
            var children = createChildren(parentEl, 3);

            mock$A(function() {
                mockHTMLElement(function() {
                    data.move(children[1]);
                    data.move(children[1]);
                });
            });

            verifyZIndices(children, data.expectedZIndices);
        }
    }

    /**
     * Verify can create stacking context when panel's parent is not a stack
     * context root also verify that we can do it using a custom callback
     */
    [Fixture, Skip('Waiting for W-2818517')]
    function forceCreateStackingCtx() {

        [Fact, Data({
            // default way
            forceCreateStackingCtx: true,
            expectedZIndex: "0",
            expectedPosition: "relative"
        }, {
            // custom callback
            forceCreateStackingCtx: function(parent) {
                parent.style.zIndex = "-1";
                parent.style.position = "custom";
            },
            expectedZIndex: "-1",
            expectedPosition: "custom"
        })]
        function testForceCreateStackingCtx(data) {
            var grandParentEl = newMockElement(true, "auto");
            grandParentEl.tagName = "BODY";
            var parentEl = newMockElement(false, "auto", grandParentEl);
            var stubEl = newMockElement(false, "0", parentEl);

            mock$A(function() {
                mockHTMLElement(function() {
                    stackManager.sendToBack(stubEl, data.forceCreateStackingCtx);
                });
            });

            // small hack to verify two values at once
            Assert.Equal(data.expectedZIndex + data.expectedPosition,
                parentEl.style.zIndex + parentEl.style.position);
        }
    }

    /**
     * Verify StackManager ignores non-integer zIndex
     */
    [Fixture]
    function nanZIndex() {
        [Fact, Data({
            move: stackManager.sendToBack,
            expectedZIndices: "1,auto,0,4,5"
        }, {
            move: stackManager.bringToFront,
            expectedZIndices: "1,auto,6,4,5"
        })]
        function testNaNZIndex(data) {
            var parentEl = newMockElement(true, "auto");
            var children = createChildren(parentEl, 5);

            children[1].style.zIndex = 'auto';

            mock$A(function() {
                mockHTMLElement(function() {
                    data.move(children[2]);
                });
            });

            verifyZIndices(children, data.expectedZIndices);
        }
    }

    /**
     * Verify that passing invalid argument into stackManager throws some exception
     */
    [Fixture]
    function invalidArgument() {
        [Fact, Data({
            arg: null
        }, {
            arg: {}
        }, {
            arg: 5
        })]
        function testIncorrectTypeArgument(data) {
            var actual;
            mock$A(function() {
                mockHTMLElement(function() {
                    actual = Record.Exception(function() {
                        stackManager.sendToBack(data.arg);
                    });
                });
            });
            Assert.NotNull(actual, 'Should throw an exception for invalid argument type');
        }

        [Fact]
        function testNullSibling() {
            var parentEl = newMockElement(true, "auto");
            var children = createChildren(parentEl, 5);
            children[2] = null;

            var actual;
            mock$A(function() {
                mockHTMLElement(function() {
                    actual = Record.Exception(function() {
                        stackManager.sendToBack(children[1]);
                    });
                });
            });
            Assert.NotNull(actual, 'Should throw an exception for invalid sibling');
        }
    }
}
