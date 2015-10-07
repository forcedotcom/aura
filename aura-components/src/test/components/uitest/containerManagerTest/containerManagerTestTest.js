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
            cmp.getDef().getHelper().globalPanelRefs.forEach(function(panel, index){
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
            cmp.getDef().getHelper().globalPanelRefs.forEach(function(panel, index){
                var panelEl = panel.getElement();

                $A.test.assertEquals(panelManager, panelEl.parentNode,
                    "Failed to match parentNode for panel id: " + panelEl.id);

                $A.test.assertEquals((index+1), parseInt(panelEl.style.zIndex),
                    "Incorrect z-index value for panel id: " + panelEl.id);
            });
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
            var panelRefs = cmp.getDef().getHelper().globalPanelRefs;
            var containerManager = cmp.find("cm").getElement();
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
                cmp.getDef().getHelper().smLib.stackManager.sendToBack(panelEl);
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
                cmp.getDef().getHelper().smLib.stackManager.bringToFront(panelEl);
            });

            panelRefs.forEach(function(panel, index) {
                var panelEl = panel.getElement();
                $A.test.assertEquals((index+length), parseInt(panelEl.style.zIndex),
                    "(bringToFront) Incorrect z-index value for panel id: " + panelEl.id);
            });
        }, function(cmp) {
            var panelRefs = cmp.getDef().getHelper().globalPanelRefs;
            var panel_2 = panelRefs[1];

            //delete panel_2 and assert newly assigned zIndexes
            var globalId = panel_2.getGlobalId();
            var destroyedId = panel_2.destroy();

            //1 - 5, 3-7, 4-8, 5-9
            //after you destroy panel_2, z-indexes will get recomputed
            //only if you call sendToBack or bringToFront
            $A.test.addWaitForWithFailureMessage(true, function () {
                return true;
            }, "Failed to destroy panel", function(){
                panelRefs.splice(1,1);

                var temp;
                temp = panelRefs[0].getElement();
                $A.test.assertEquals(parseInt(temp.style.zIndex), 5,
                    "Incorrect zIndex for panel id:" + temp.id);
                temp = panelRefs[1].getElement();
                $A.test.assertEquals(parseInt(temp.style.zIndex), 7,
                    "Incorrect zIndex for panel id:" + temp.id);
                temp = panelRefs[2].getElement();
                $A.test.assertEquals(parseInt(temp.style.zIndex), 8,
                    "Incorrect zIndex for panel id:" + temp.id);
                temp = panelRefs[3].getElement();
                $A.test.assertEquals(parseInt(temp.style.zIndex), 9,
                    "Incorrect zIndex for panel id:" + temp.id);
            });
        }]
    },

    testGarbageCollection: {
        attributes: {"useContainer": "true"},
        test: [function(cmp) {
            this.createPanels(5, cmp);
        }, function (cmp) {
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

    createPanels: function(count, cmp) {
        var button = cmp.find("create").getElement();
        var i = 1;
        while(i <= count) {
            button.click();
            i++;
        }
        $A.test.addWaitForWithFailureMessage(true, function() {
            return ($A.test.select(".uiPanel").length === 5);
        }, "Failed to create panels.");
    }
})