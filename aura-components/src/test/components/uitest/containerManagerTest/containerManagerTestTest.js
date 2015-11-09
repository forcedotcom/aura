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
({
    browsers: ["-IE7","-IE8"],

    testUseSharedContainer: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            this.createPanels(5, cmp);
        }, function(cmp) {
            var containerManager = cmp.find("cm").getElement();
            this.getPanelRefs(cmp).forEach(function(panel, index){
                var panelEl = panel.getElement();

                $A.test.assertEquals(containerManager, panelEl.parentNode,
                    "Failed to match parentNode for panel id: " + panelEl.id);

                $A.test.assertEquals((index+1), parseInt(panelEl.style.zIndex),
                    "Incorrect z-index value for panel id: " + panelEl.id);
            });
        }]
    },

    testDoesNotUseSharedContainer: {
        attributes: {"useContainer": false},
        test: [function(cmp) {
            this.createPanels(5, cmp);
        }, function(cmp) {
            var panelManager = cmp.find("pm").getElement();
            this.getPanelRefs(cmp).forEach(function(panel, index){
                var panelEl = panel.getElement();

                $A.test.assertEquals(panelManager, panelEl.parentNode,
                    "Failed to match parentNode for panel id: " + panelEl.id);

                $A.test.assertEquals((index+1), parseInt(panelEl.style.zIndex),
                    "Incorrect z-index value for panel id: " + panelEl.id);
            });
        }]
    },

    testDefaultZIndex: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            this.createPanels(3, cmp);
        }, function(cmp) {
            this.verifyZIndices(this.getPanelRefs(cmp), ['1', '2', '3']);
        }]
    },

    testStackManager: {
        attributes: {"useContainer": "true"},
        test: [function(cmp) {
            //initial   panel_id => zIndex
            //panel_1 => 1  panelRefs[0]
            //panel_2 => 2  panelRefs[1]
            //panel_3 => 3  panelRefs[2]
            //panel_4 => 4  panelRefs[3]
            //panel_5 => 5  panelRefs[4]
            this.createPanels(5, cmp);
        }, function(cmp) {
            var stackManager = this.getStackManager(cmp);
            var panelRefs = this.getPanelRefs(cmp);
            var length = panelRefs.length;

            //after sendToBack
            //reverse loop
            //panel_5 => 5   =>sendToBack    0,1,2,3,4
            //panel_4 => 4   =>sendToBack    0,1,2,3
            //panel_3 => 3   =>sendToBack    0,1,2
            //panel_2 => 2   =>sendToBack    0,1
            //panel_1 => 1   =>sendToBack    0
            panelRefs.slice(0,5).reverse().forEach(function(panel) {
                var panelEl = panel.getElement();
                stackManager.sendToBack(panelEl);
            });
            panelRefs.forEach(function(panel, index) {
                var panelEl = panel.getElement();
                $A.test.assertEquals(index, parseInt(panelEl.style.zIndex),
                    "(sendToBack) Incorrect z-index value for panel id: " + panelEl.id);
            });

            //after bringToFront
            //regular loop
            //panel_1 => 1   =>bringToFront    5
            //panel_2 => 2   =>bringToFront    5,6
            //panel_3 => 3   =>bringToFront    5,6,7
            //panel_4 => 4   =>bringToFront    5,6,7,8
            //panel_5 => 5   =>bringToFront    5,6,7,8,9
            panelRefs.forEach(function(panel) {
                var panelEl = panel.getElement();
                stackManager.bringToFront(panelEl);
            });

            panelRefs.forEach(function(panel, index) {
                var panelEl = panel.getElement();
                $A.test.assertEquals((index+length), parseInt(panelEl.style.zIndex),
                    "(bringToFront) Incorrect z-index value for panel id: " + panelEl.id);
            });
        }, function(cmp) {
            var panelRefs = this.getPanelRefs(cmp);
            var panel_2 = panelRefs[1];

            //delete panel_2 and assert newly assigned zIndexes
            var globalId = panel_2.getGlobalId();
            var destroyedId = panel_2.destroy();

            //1-5, 3-7, 4-8, 5-9
            //after you destroy panel_2, z-indexes will get recomputed
            //only if you call sendToBack or bringToFront
            var self = this;
            $A.test.addWaitForWithFailureMessage(globalId, function () {
                return destroyedId;
            }, "Failed to destroy panel", function(){
                panelRefs.splice(1,1);
                self.verifyZIndices(panelRefs, ['5', '7', '8', '9']);
            });
        }]
    },

    testGarbageCollection: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            this.createPanels(5, cmp);
        }, function () {
            var queryString = $A.getQueryStatement().from("component")
                .field("descriptor", "getDef().getDescriptor().toString()")
                .groupBy("descriptor");
            $A.test.assertEquals(5, queryString.query().groups['markup://ui:panel'].length, "Incorrect initial component count");
        }, function(cmp) {
            var containerManager = cmp.find("cm");
            var queryString = $A.getQueryStatement().from("component")
                .field("descriptor", "getDef().getDescriptor().toString()")
                .groupBy("descriptor");

            //destroy container manager
            var globalId = containerManager.getGlobalId();
            var destroyedId = containerManager.destroy();
            $A.test.addWaitForWithFailureMessage(globalId, function(){
                return (destroyedId);
            }, "Failed to destroy containerManager");

            var actual = queryString.query().groups['markup://ui:panel'];
            $A.test.assertUndefined(actual, "Failed to destroy the panels contained in containerManager");
        }]
    },

    /**
     * Verify new panel zIndex is based on existing panel's largest zIndex
     */
    testNewPanelZIndexBasedOnPrevPanels: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            this.createPanels(2, cmp);
        }, function(cmp) {
            // create 1 more after modifying the first one's zIndex
            var panelRefs = this.getPanelRefs(cmp);
            panelRefs[0].getElement().style.zIndex = 1000;
            this.createPanels(1, cmp);
        }, function(cmp) {
            this.verifyZIndices(this.getPanelRefs(cmp), ['1000', '2', '1001']);
        }]
    },


    /**
     * Verify sendToBack increments the zIndeces of all the other elements
     * when the lowest layer is already occupied
     */
    testBumpZIndexWhenSendToBack: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            // zIndeces: 1,2,3,4,5
            this.createPanels(5, cmp);
        }, function(cmp) {
            var panelRefs = this.getPanelRefs(cmp);
            var stackManager = this.getStackManager(cmp);

            // 0 is still available to use
            stackManager.sendToBack(panelRefs[1].getElement());
            this.verifyZIndices(panelRefs, ['1', '0', '3', '4', '5']);

            // 0 is mininum, bump up all the zIndeces to make space
            stackManager.sendToBack(panelRefs[2].getElement());
            this.verifyZIndices(panelRefs, ['2', '1', '0', '5', '6']);
        }]
    },

    /**
     * Verify StackManager ignores non-integer zIndex
     */
    testIgnoreNaNZindex: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            this.createPanels(5, cmp);
        }, function(cmp) {
            var panelRefs = this.getPanelRefs(cmp);
            var stackManager = this.getStackManager(cmp);
            var panel_2 = panelRefs[1].getElement();
            var panel_3 = panelRefs[2].getElement();

            panel_2.style.zIndex = 'auto';

            stackManager.sendToBack(panel_3);
            this.verifyZIndices(panelRefs, ['1', 'auto', '0', '4', '5']);

            stackManager.bringToFront(panel_3);
            this.verifyZIndices(panelRefs, ['1', 'auto', '6', '4', '5']);
        }]
    },

    /**
     * Verify bringToFront doesn't keep incrementing zIndex even
     * when the element is already in the front
     */
    testBringToFrontSameElementTwice: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            this.createPanels(3, cmp);
        }, function(cmp) {
            var panelRefs = this.getPanelRefs(cmp);
            var stackManager = this.getStackManager(cmp);
            var panel_2 = panelRefs[1].getElement();

            stackManager.bringToFront(panel_2);
            this.verifyZIndices(panelRefs, ['1', '4', '3']);

            stackManager.bringToFront(panel_2);
            this.verifyZIndices(panelRefs, ['1', '4', '3']);
        }]
    },

    /**
     * Verify sendToBack doesn't bump up other elements' zIndex
     * when the element is already in the back
     */
    testSendToBackSameElementTwice: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            this.createPanels(3, cmp);
        }, function(cmp) {
            var panelRefs = this.getPanelRefs(cmp);
            var stackManager = this.getStackManager(cmp);
            var panel_2 = panelRefs[1].getElement();

            stackManager.sendToBack(panel_2);
            this.verifyZIndices(panelRefs, ['1', '0', '3']);

            stackManager.sendToBack(panel_2);
            this.verifyZIndices(panelRefs, ['1', '0', '3']);
        }]
    },

    /**
     * Verify can pass custom function to create stacking context
     * when panel's parent is not a stack context root
     */
    // Disable due to a typo in stackManager's function
    _testForceCreateStackingCtxWithFunction: {
        attributes: {"userContainer": true},
        test: [function(cmp) {
            this.createPanels(1, cmp);
        }, function(cmp) {
            var stackManager = this.getStackManager(cmp);
            var panelRefs = this.getPanelRefs(cmp);
            var panelEl = panelRefs[0].getElement();
            var panelParent = panelEl.parentNode;

            // manually make panel's parent a non-stackCtxRoot
            panelParent._stackContextRoot = false;
            panelParent.style.zIndex = 'auto';

            // force createStackingCtx using the 2nd argument
            stackManager.sendToBack(panelEl, function(parentNode) {
                parentNode.callbackIsCalled = true;
            });

            $A.test.assertTrue(panelParent.callbackIsCalled,
                    "Users should be able to pass in callback to customize stacking context!");
        }]
    },

    /**
     * Verify the default behavior of forcing to create stacking context
     * when panel's parent is not a stack context root
     */
    // Disable due to a typo in stackManager's function
    _testForceCreateStackingCtx: {
        attributes: {"userContainer": true},
        test: [function(cmp) {
            this.createPanels(1, cmp);
        }, function(cmp) {
            var stackManager = this.getStackManager(cmp);
            var panelRefs = this.getPanelRefs(cmp);
            var panelEl = panelRefs[0].getElement();
            var panelParent = panelEl.parentNode;

            // manually make panel's parent a non-stackCtxRoot
            panelParent._stackContextRoot = false;
            panelParent.style.zIndex = 'auto';

            // force createStackingCtx using the 2nd argument
            stackManager.sendToBack(panelEl, true);
            $A.test.assertEquals("0", panelParent.style.zIndex,
                    "panel parent node should have a zindex 0!");
        }]
    },

    /**
     * Verify user can set element as stacking context root
     */
    testSetStackingCtxRoot: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            this.createPanels(1, cmp);
        }, function(cmp) {
            var stackManager = this.getStackManager(cmp);
            var panelRefs = this.getPanelRefs(cmp);
            var panelEl = panelRefs[0].getElement();

            // _stackContextRoot can be undefined/false
            $A.test.assertNotEquals(true, panelEl._stackContextRoot,
                "Initially panel should not be stacking context root!");

            stackManager.setStackingContextRoot(panelEl);

            $A.test.assertTrue(panelEl._stackContextRoot,
                "Panel should now be stacking context root!");
        }]
    },

    /**
     * Verify destroyPanel event removes panel from global panel refs
     */
    testDestroyPanel: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            this.createPanels(5, cmp);
        }, function(cmp) {
            var panelRefs = this.getPanelRefs(cmp);

            $A.test.assertDefined(panelRefs[0].getGlobalId());

            this.destroyPanel(panelRefs[0]);

            $A.test.assertUndefined(panelRefs[0].getGlobalId());
            $A.test.assertEquals(this.getPanelCount(), 4);
        }]
    },

    /****************************************************************
     ********************* Helper Functions *************************
     ****************************************************************/
    getStackManager: function(cmp) {
        return cmp.getDef().getHelper().smLib.stackManager;
    },

    getPanelRefs: function(cmp) {
        return cmp.getDef().getHelper().globalPanelRefs;
    },

    getPanelCount: function() {
        return $A.test.select(".uiPanel").length;
    },

    createPanels: function(count, cmp) {
        var expectedCount = $A.test.select(".uiPanel").length + count;

        var button = cmp.find("create").getElement();
        var i = 1;
        while(i <= count) {
            button.click();
            i++;
        }

        var self = this;
        $A.test.addWaitForWithFailureMessage(true, function() {
            return (self.getPanelCount() === expectedCount);
        }, "Failed to create panels.");
    },

    destroyPanel: function(panel) {
        $A.get('e.ui:destroyPanel').setParams({
            panelInstance: panel
        }).fire();
    },

    verifyZIndices: function(panelRefs, expectedZIndices) {
        for(var i = 0; i < panelRefs.length; i++) {
            var panelEl = panelRefs[i].getElement();
            $A.test.assertEquals(expectedZIndices[i], panelEl.style.zIndex,
                "Incorrect zIndex for panel id:" + panelEl.id
            );
        }
    }
})
