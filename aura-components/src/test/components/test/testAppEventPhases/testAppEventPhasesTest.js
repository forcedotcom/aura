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
    clearLogs: function(cmp) {
        cmp.find("logPanel").clear();
    },

    assertLogs : function(cmp, expectedPhased, expectedBroadcast) {
        var actualArr = this.getLoggedStatements(cmp);
        // Assert expectedPhased - first expectedPhased.length belong to the phased group
        var broadcastStartIdx = this.indexOfFirstBroadcast(actualArr);
        var actualPhased = actualArr.slice(0, broadcastStartIdx > -1 ? broadcastStartIdx : actualArr.length);
        var actualBroadcast = actualArr.slice(actualPhased.length);
        $A.test.assertEquals(actualPhased.join(), actualArr.slice(0, expectedPhased.length).join(), "Incorrect phased sequence");

        // Assert expectedBroadcast - rest belong to the broadcast group; can appear in any order
        this.matchBroadcast(actualBroadcast, expectedBroadcast);
    },

    assertLogsRaw: function(cmp, expectedLogs) {
        var actualArr = this.getLoggedStatements(cmp);
        $A.test.assertEquals(actualArr.join(), expectedLogs.join(), "Incorrect sequence");
    },

    indexOfFirstBroadcast: function(logs) {
        for(var i = 0; i < logs.length; i++) {
            if(logs[i].indexOf("BROADCAST ") === 0) {
                return i;
            }
        }
        return -1;
    },

    getLoggedStatements: function(cmp) {
        return cmp.find("logPanel").get("v.logs");
    },

    getDefaultBroadcasts: function(sourceId) {
        var knownBroadcastHandlers = [
            "GrandchildWrapper",
            "Grandchild",
            "RootOwnedWrapper",
            "RootOwnedHandler",
            "RootOwnedChild",
            "RootWrapper",
            "RootSuper"
        ];

        return knownBroadcastHandlers.map(function(logId) {
            return "BROADCAST handle " + sourceId + " in " + logId;
        });
    },

    getCustomBroadcasts: function(sourceId, logIds) {
        return this.buildPhasedLogs(sourceId, logIds, "BROADCAST");
    },

    buildPhasedLogs: function(sourceId, logIds, phase) {
        return logIds.map(function(logId) {
            return phase + " handle " + sourceId + " in " + logId;
        });
    },

    getExpectedPhasedLogs: function(sourceId, expectedCapture, expectedBubble) {
        return ["fire " + sourceId]
            .concat(this.buildPhasedLogs(sourceId, expectedCapture, "CAPTURE"))
            .concat(this.buildPhasedLogs(sourceId, expectedBubble, "BUBBLE"));
    },

    runCommand: function(params) {
        if(!params.eventList) {
            params.eventList = [];
        }
        $A.get("e.test:testAppEventPhasesCommand").setParams(params).fire();
    },

    matchBroadcast: function(actual, expected) {
        $A.test.assertEquals(expected.length, actual.length, "Wrong number broadcast handlers");
        expected.forEach(function(exVal) {
            $A.test.assertTrue(actual.indexOf(exVal) >= 0, "Incorrect broadcast sequence: missing " + exVal);
        });
    },

    createCmp: function(sourceId, targetId, progId, appendToBody) {
        return new Promise(function(success, failure) {
            this.runCommand({
                sourceId: sourceId, 
                skipLog: true,
                actions: [{
                    action: function(curCmp) {
                        $A.createComponent("test:testAppEventPhasesHandlerChild", {
                            logId: progId
                        }, function(newCmp) {
                            var wrapperCmp = curCmp.find("wrapper");
                            var newBody;
                            if(!appendToBody) {
                                newBody = [newCmp];
                            }
                            else {
                                newBody = wrapperCmp.get("v.body") || [];
                                newBody.push(newCmp);
                            }
                            wrapperCmp.set("v.body", newBody);
                            success();
                        });
                    },
                    targetId: targetId, phase: "BUBBLE"
                }]
            });
        }.bind(this));
    },

    /**
     * Hooks the $A.test.addWaitForWithFailureMessage API into
     * a promise-oriented syntax.
     * 
     * Used like this:
     * somePromise.then(this.continuation(optionalFailureMsg));
     */
    continuation: function(optionalFailureMsg) {
        var ready = false;
        $A.test.addWaitForWithFailureMessage(true, function() {
            return ready;
        }, optionalFailureMsg || "Did not complete in time");

        return function() {
            ready = true;
        };
    },

    /**
     * TESTS
     */
    testDefaultFromRoot: {
        test : function(cmp) {
            var sourceId = "Root";
            var expectedCapture = ["RootSuper", "Root"];
            var expectedBubble = expectedCapture.slice().reverse();
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getDefaultBroadcasts(sourceId);
            var actions = [];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testDefaultFromMiddleSuper: {
        test : function(cmp) {
            var sourceId = "RootOwnedHandler";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler"];
            var expectedBubble = expectedCapture.slice().reverse();
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getDefaultBroadcasts(sourceId);
            var actions = [];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});

            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testDefaultFromNested: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            var expectedBubble = expectedCapture.slice().reverse();
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getDefaultBroadcasts(sourceId);
            var actions = [];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});

            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedStopPropCaptureAtRootSuper: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper"];
            var expectedBubble = [];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getDefaultBroadcasts(sourceId);
            var actions = [{action: "stopPropagation", targetId: "RootSuper", phase: "CAPTURE"}];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromMiddleStopPropCaptureAtRoot: {
        test : function(cmp) {
            var sourceId = "RootOwnedChild";
            var expectedCapture = ["RootSuper", "Root"];
            var expectedBubble = [];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getDefaultBroadcasts(sourceId);
            var actions = [{action: "stopPropagation", targetId: "Root", phase: "CAPTURE"}];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedStopPropCaptureAtNested: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            var expectedBubble = [];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getCustomBroadcasts(sourceId, ["GrandchildWrapper", "Grandchild"]);
            var actions = [{action: "stopPropagation", targetId: "Grandchild", phase: "CAPTURE"}];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedStopPropBubbleAtRoot: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            // Mirrors component event bubbling semantics; stopPropagation cancels going up inheritance as well
            var expectedBubble = ["Grandchild", "RootOwnedChild", "RootOwnedHandler", "Root"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getDefaultBroadcasts(sourceId);
            var actions = [{action: "stopPropagation", targetId: "Root", phase: "BUBBLE"}];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromMiddleStopPropBubbleAtMiddleSuper: {
        test : function(cmp) {
            var sourceId = "RootOwnedChild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild"];
            var expectedBubble = ["RootOwnedChild", "RootOwnedHandler"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getCustomBroadcasts(sourceId, ["RootOwnedWrapper", "RootOwnedChild", "RootOwnedHandler", "GrandchildWrapper", "Grandchild"]);
            var actions = [{action: "stopPropagation", targetId: "RootOwnedHandler", phase: "BUBBLE"}];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedStopPropBubbleAtMiddle: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            // Mirrors component event bubbling semantics; stopPropagation cancels going up inheritance as well
            var expectedBubble = ["Grandchild", "RootOwnedChild"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getCustomBroadcasts(sourceId, ["RootOwnedWrapper", "RootOwnedChild", "RootOwnedHandler", "GrandchildWrapper", "Grandchild"]);
            var actions = [{action: "stopPropagation", targetId: "RootOwnedChild", phase: "BUBBLE"}];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },


    testFromNestedPreventDefaultBubbleAtMiddle: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            var expectedBubble = expectedCapture.slice().reverse();
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            var actions = [{action: "preventDefault", targetId: "RootOwnedChild", phase: "BUBBLE"}];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedStopPropPreventDefaultCaptureAtRoot: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root"];
            var expectedBubble = [];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            var actions = [
                {action: "stopPropagation", targetId: "Root", phase: "CAPTURE"},
                {action: "preventDefault", targetId: "Root", phase: "CAPTURE"}
            ];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedStopPropBubbleAtMiddlePreventDefaultCaptureAtRootSuper: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            var expectedBubble = ["Grandchild", "RootOwnedChild"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            var actions = [
                {action: "stopPropagation", targetId: "RootOwnedChild", phase: "BUBBLE"},
                {action: "preventDefault", targetId: "RootSuper", phase: "CAPTURE"}
            ];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedDestroyCaptureAtMiddle: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild"];
            var expectedBubble = ["Root", "RootSuper"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getCustomBroadcasts(sourceId, [
                "RootWrapper",
                "RootSuper"
            ]);
            var actions = [
                {action: "destroy", targetId: "RootOwnedChild", phase: "CAPTURE"}
            ];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedDestroyBubbleAtMiddleSuper: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            var expectedBubble = ["Grandchild", "RootOwnedChild", "RootOwnedHandler", "Root", "RootSuper"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getCustomBroadcasts(sourceId, [
                "RootWrapper",
                "RootSuper"
            ]);
            var actions = [
                {action: "destroy", targetId: "RootOwnedHandler", phase: "BUBBLE"}
            ];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedDestroyBubbleAtMiddle: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            var expectedBubble = ["Grandchild", "RootOwnedChild", "Root", "RootSuper"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getCustomBroadcasts(sourceId, [
                "RootWrapper",
                "RootSuper"
            ]);
            var actions = [
                {action: "destroy", targetId: "RootOwnedChild", phase: "BUBBLE"}
            ];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedDefaultProgrammatic: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var progId = "RootOwnedProgrammatic";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedProgrammaticHandler", "RootOwnedProgrammaticChild", "Grandchild"];
            var expectedBubble = ["Grandchild", "RootOwnedProgrammaticChild", "RootOwnedProgrammaticHandler", "Root", "RootSuper"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getCustomBroadcasts(sourceId, [
                "GrandchildWrapper",
                "Grandchild",
                "RootOwnedProgrammaticWrapper",
                "RootOwnedProgrammaticHandler",
                "RootOwnedProgrammaticChild",
                "RootWrapper",
                "RootSuper"
            ]);
            var actions = [];

            this.clearLogs(cmp);
            // Programmatically create a component during setup
            this.createCmp(sourceId, "Root", progId)
            .then(function() {
                this.runCommand({sourceId: sourceId, actions: actions});
                
                this.assertLogs(cmp, expectedPhased, expectedBroadcast);
            }.bind(this))
            .then(this.continuation());
        }
    },

    testFromNestedStopPropCaptureAtProgrammaticSuper: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var progId = "RootOwnedProgrammatic";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedProgrammaticHandler"];
            var expectedBubble = [];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getCustomBroadcasts(sourceId, [
                "GrandchildWrapper",
                "Grandchild",
                "RootOwnedProgrammaticWrapper",
                "RootOwnedProgrammaticHandler",
                "RootOwnedProgrammaticChild"
            ]);
            var actions = [{action: "stopPropagation", targetId: "RootOwnedProgrammaticHandler", phase: "CAPTURE"}];

            this.clearLogs(cmp);
            // Programmatically create a component during setup
            this.createCmp(sourceId, "Root", progId)
            .then(function() {
                this.runCommand({sourceId: sourceId, actions: actions});
                
                this.assertLogs(cmp, expectedPhased, expectedBroadcast);
            }.bind(this))
            .then(this.continuation());
        }
    },

    testFromNestedStopPropBubbleAtProgrammatic: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var progId = "RootOwnedProgrammatic";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedProgrammaticHandler", "RootOwnedProgrammaticChild", "Grandchild"];
            var expectedBubble = ["Grandchild", "RootOwnedProgrammaticChild"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getCustomBroadcasts(sourceId, [
                "GrandchildWrapper",
                "Grandchild",
                "RootOwnedProgrammaticWrapper",
                "RootOwnedProgrammaticHandler",
                "RootOwnedProgrammaticChild"
            ]);
            var actions = [{action: "stopPropagation", targetId: "RootOwnedProgrammaticChild", phase: "BUBBLE"}];

            this.clearLogs(cmp);
            // Programmatically create a component during setup
            this.createCmp(sourceId, "Root", progId)
            .then(function() {
                this.runCommand({sourceId: sourceId, actions: actions});
                
                this.assertLogs(cmp, expectedPhased, expectedBroadcast);
            }.bind(this))
            .then(this.continuation());
        }
    },

    testFromProgrammaticStopPropBubbleAtProgrammaticSuperPreventDefaultCaptureAtProgrammatic: {
        test : function(cmp) {
            var sourceId = "RootOwnedProgrammaticChild";
            var progId = "RootOwnedProgrammatic";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedProgrammaticHandler", "RootOwnedProgrammaticChild"];
            var expectedBubble = ["RootOwnedProgrammaticChild", "RootOwnedProgrammaticHandler"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            var actions = [
                {action: "stopPropagation", targetId: "RootOwnedProgrammaticHandler", phase: "BUBBLE"},
                {action: "preventDefault", targetId: "RootOwnedProgrammaticChild", phase: "CAPTURE"}
            ];

            this.clearLogs(cmp);
            // Programmatically create a component during setup; fire it at the Grandchild
            this.createCmp("Root", "Root", progId)
            .then(function() {
                this.runCommand({sourceId: sourceId, actions: actions});
                
                this.assertLogs(cmp, expectedPhased, expectedBroadcast);
            }.bind(this))
            .then(this.continuation());
        }
    },

    testFromProgrammaticStopPropBubbleAtProgrammaticSuperPreventDefaultCaptureAtProgrammatic: {
        test : function(cmp) {
            var sourceId = "RootOwnedProgrammaticChild";
            var progId = "RootOwnedProgrammatic";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedProgrammaticHandler", "RootOwnedProgrammaticChild"];
            var expectedBubble = ["RootOwnedProgrammaticChild", "RootOwnedProgrammaticHandler"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            var actions = [
                {action: "stopPropagation", targetId: "RootOwnedProgrammaticHandler", phase: "BUBBLE"},
                {action: "preventDefault", targetId: "RootOwnedProgrammaticChild", phase: "CAPTURE"}
            ];

            this.clearLogs(cmp);
            // Programmatically create a component during setup; fire it at the Grandchild
            this.createCmp("Root", "Root", progId)
            .then(function() {
                this.runCommand({sourceId: sourceId, actions: actions});
                
                this.assertLogs(cmp, expectedPhased, expectedBroadcast);
            }.bind(this))
            .then(this.continuation());
        }
    },

    testDefaultExtEvtFromRoot: {
        test : function(cmp) {
            var sourceId = "Root";
            var expectedCapture = ["RootSuper", "Root"];
            var expectedBubble = expectedCapture.slice().reverse();
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getDefaultBroadcasts(sourceId);
            var actions = [];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions, eventName: "test:testAppEventPhasesEventExtended"});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testExtEvtFromNestedStopPropBubbleAtMiddle: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            var expectedBubble = ["Grandchild", "RootOwnedChild"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = this.getCustomBroadcasts(sourceId, ["RootOwnedWrapper", "RootOwnedChild", "RootOwnedHandler", "GrandchildWrapper", "Grandchild"]);
            var actions = [{action: "stopPropagation", targetId: "RootOwnedChild", phase: "BUBBLE"}];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions, eventName: "test:testAppEventPhasesEventExtended"});
            
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testDefaultFromNestedPauseBubbleAtMiddle: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            var expectedBubble = ["Grandchild", "RootOwnedChild"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            var actions = [{action: "pause", targetId: "RootOwnedChild", phase: "BUBBLE"}];
            var eventList = [];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions, eventList: eventList});

            this.assertLogs(cmp, expectedPhased, expectedBroadcast);

            eventList[0].resume();
            expectedBubble = expectedCapture.slice().reverse();
            expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            expectedBroadcast = this.getDefaultBroadcasts(sourceId);
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testDefaultFromNestedMultiplePauses: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root"];
            var expectedBubble = [];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            var actions = [
                {action: "pause", targetId: "Root", phase: "CAPTURE"},
                {action: "pause", targetId: "RootOwnedChild", phase: "BUBBLE"}
            ];
            var eventList = [];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions, eventList: eventList});

            this.assertLogs(cmp, expectedPhased, expectedBroadcast);

            eventList[0].resume();
            expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            expectedBubble = ["Grandchild", "RootOwnedChild"];
            expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);

            eventList[0].resume();
            expectedBubble = expectedCapture.slice().reverse();
            expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            expectedBroadcast = this.getDefaultBroadcasts(sourceId);
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedPauseResumeBeforeStopPropBubbleAtMiddleSuper: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            var expectedBubble = [];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            var actions = [
                {action: "pause", targetId: "Grandchild", phase: "CAPTURE"},
                {action: "stopPropagation", targetId: "RootOwnedHandler", phase: "BUBBLE"}
            ];
            var eventList = [];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions, eventList: eventList});

            this.assertLogs(cmp, expectedPhased, expectedBroadcast);

            eventList[0].resume();
            expectedBubble = ["Grandchild", "RootOwnedChild", "RootOwnedHandler"];
            expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            expectedBroadcast = this.getCustomBroadcasts(sourceId, [
                "GrandchildWrapper",
                "Grandchild",
                "RootOwnedWrapper",
                "RootOwnedHandler",
                "RootOwnedChild"
            ]);
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedPauseResumeAfterPreventDefaultBubbleAtRoot: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            var expectedBubble = ["Grandchild", "RootOwnedChild", "RootOwnedHandler"];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            var actions = [
                {action: "pause", targetId: "RootOwnedHandler", phase: "BUBBLE"},
                {action: "preventDefault", targetId: "Root", phase: "CAPTURE"}
            ];
            var eventList = [];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions, eventList: eventList});

            this.assertLogs(cmp, expectedPhased, expectedBroadcast);

            eventList[0].resume();
            expectedBubble = expectedCapture.slice().reverse();
            expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedPauseBeforeFireThenResume: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = [];
            var expectedBubble = expectedCapture.slice().reverse();
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            // Signal the event source component to create the event, call pause(), then call fire()
            var actions = [{action: "pause", before: true}];
            var eventList = [];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions, eventList: eventList});

            this.assertLogs(cmp, expectedPhased, expectedBroadcast);

            eventList[0].resume();
            expectedCapture = ["RootSuper", "Root", "RootOwnedHandler", "RootOwnedChild", "Grandchild"];
            expectedBubble = expectedCapture.slice().reverse();
            expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            expectedBroadcast = this.getDefaultBroadcasts(sourceId);
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromNestedPauseDestroyThenResume: {
        test : function(cmp) {
            var sourceId = "Grandchild";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler"];
            var expectedBubble = [];
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            var actions = [
                {action: "pause", targetId: "RootOwnedHandler", phase: "CAPTURE"}
            ];
            var eventList = [];

            this.clearLogs(cmp);
            this.runCommand({sourceId: sourceId, actions: actions, eventList: eventList});

            this.assertLogs(cmp, expectedPhased, expectedBroadcast);

            // Now destroy RootOwnedHandler; don't log anything here to avoid polluting the logs
            this.runCommand({sourceId: sourceId, actions: [{action: "destroy", targetId: "RootOwnedHandler", phase: "BUBBLE"}], eventList: [], skipLog: true});

            eventList[0].resume();
            expectedBubble = ["Root", "RootSuper"];
            expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            expectedBroadcast = this.getCustomBroadcasts(sourceId, [
                "RootWrapper",
                "RootSuper"
            ]);
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
        }
    },

    testFromMiddleSuperPauseCreateProgrammaticThenResume: {
        test : function(cmp) {
            var sourceId = "RootOwnedHandler";
            var progId = "RootOwnedProgrammatic";
            var expectedCapture = ["RootSuper", "Root", "RootOwnedHandler"];
            var expectedBubble = ["RootOwnedHandler", "Root"]; 
            var expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
            var expectedBroadcast = [];
            var actions = [{action: "pause", targetId: "Root", phase: "BUBBLE"}];
            var eventList = [];

            this.clearLogs(cmp);
            // Run the command; will pause at Root
            this.runCommand({sourceId: sourceId, actions: actions, eventList: eventList});
            // Assert that everything is golden at this point
            this.assertLogs(cmp, expectedPhased, expectedBroadcast);
            console.info("PASSED Assertion 1");

            // Now programmatically create a component
            this.createCmp(sourceId, "Root", progId, true)
            .then(function() {
                // Resume the original event
                eventList[0].resume();
                expectedBubble = expectedCapture.slice().reverse();
                expectedPhased = this.getExpectedPhasedLogs(sourceId, expectedCapture, expectedBubble);
                expectedBroadcast = this.getDefaultBroadcasts(sourceId).concat(this.getCustomBroadcasts(sourceId, [
                    "GrandchildWrapper",
                    "Grandchild",
                    "RootOwnedProgrammaticWrapper",
                    "RootOwnedProgrammaticHandler",
                    "RootOwnedProgrammaticChild"
                ]));
                // Should include broadcast handlers from the programmatically created components
                // that arrived after the event was originally fired
                this.assertLogs(cmp, expectedPhased, expectedBroadcast);
            }.bind(this))
            .then(this.continuation());
        }
    }
})
