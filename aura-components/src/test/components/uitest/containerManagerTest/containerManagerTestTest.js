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

    /**
     * Verify that sendToBack/bringToFront accept component/element/id as arg
     */
    testAcceptableArgType: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            this.createPanels(3, cmp);
        }, function(cmp) {
            var stackManager = this.getStackManager(cmp);
            var panelRefs = this.getPanelRefs(cmp);

            stackManager.bringToFront(panelRefs[0]);
            this.verifyZIndices(this.getPanelRefs(cmp), ['4', '2', '3']);

            stackManager.bringToFront(panelRefs[1].getElement());
            this.verifyZIndices(this.getPanelRefs(cmp), ['4', '5', '3']);

            stackManager.bringToFront(panelRefs[2].getGlobalId());
            this.verifyZIndices(this.getPanelRefs(cmp), ['4', '5', '6']);
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
            panel_2.destroy();

            //1-5, 3-7, 4-8, 5-9
            //after you destroy panel_2, z-indexes will get recomputed
            //only if you call sendToBack or bringToFront
            panelRefs.splice(1,1);
            this.verifyZIndices(panelRefs, ['5', '7', '8', '9']);
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
            containerManager.destroy();

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
     * Verify destroyPanel event destroys panel
     */
    testDestroyPanel: {
        attributes: {"useContainer": true},
        test: [function(cmp) {
            this.createPanels(5, cmp);
        }, function(cmp) {
            var panelRefs = this.getPanelRefs(cmp);

            $A.test.assertTrue(panelRefs[0].isValid());

            this.destroyPanel(panelRefs[0]);

            $A.test.assertFalse(panelRefs[0].isValid());
            $A.test.assertEquals(4, this.getPanelCount());
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
            $A.test.assertEquals(parseInt(expectedZIndices[i]), parseInt(panelEl.style.zIndex),
                "Incorrect zIndex for panel id:" + panelEl.id
            );
        }
    }
})
