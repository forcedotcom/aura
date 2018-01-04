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
    assertLogs : function(cmp, expected) {
        $A.test.assertEquals(expected.join(), this.getLoggedStatements(cmp).join());
    },

    getLoggedStatements: function(cmp) {
        return cmp.find("logPanel").get("v.logs");
    },

    testFacetEventHandledByRoot : {
        test : function(cmp) {
            var expected = [
                "fire Event",
                "handle CAPTURE Event in Root",
                "handle Event in Root",
                "handleSuper Event in Root"
            ];

            cmp.find("logPanel").clear();
            cmp.find("emitter").fireEvent();

            this.assertLogs(cmp, expected);
        }
    },

    testFacetExtendedEventHandledByRoot : {
        test : function(cmp) {
            var expected = [
                "fire Extended",
                "handle CAPTURE Extended in Root",
                "handle Extended in Root",
                "handleSuper Extended in Root"
            ];

            cmp.find("logPanel").clear();
            cmp.find("emitterExtended").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testFacetOtherEventNotHandled : {
        test : function(cmp) {
            var expected = [ "fire Other" ];

            cmp.find("logPanel").clear();
            cmp.find("emitterOther").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testInnerOtherEventNotHandled : {
        test : function(cmp) {
            var expected = [ "fire Other" ];

            cmp.find("logPanel").clear();
            cmp.find("inner").find("emitterOther").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testInnerEventNotHandledByContainer : {
        test : function(cmp) {
            var expected = [
            "fire Event",
            "handle CAPTURE Event in Root",
            "handleGrandchild Event in Inner",
            "handleChild Event in Inner",
            "handle Event in Inner",
            "handle Event in Root",
            "handleSuper Event in Root" ];

            cmp.find("logPanel").clear();
            cmp.find("inner").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testInnerEventFromSuperNotHandledByContainerOrSubdefs : {
        test : function(cmp) {
            var expected = [
            "fire Event",
            "handle CAPTURE Event in Root",
            "handleChild Event in Inner",
            "handle Event in Inner",
            "handle Event in Root",
            "handleSuper Event in Root" ];

            cmp.find("logPanel").clear();
            cmp.find("inner").getSuper().find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testInnerExtendedEventFromSuperSuperNotHandledByContainerOrSubdefs : {
        test : function(cmp) {
            var expected = [
            "fire Extended",
            "handle CAPTURE Extended in Root",
            "handle Extended in Inner",
            "handle Extended in Root",
            "handleSuper Extended in Root" ];

            cmp.find("logPanel").clear();
            cmp.find("inner").getSuper().getSuper().find("emitterExtended").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testContainerContentGrandchildEventBubblesAllTheWay : {
        test : function(cmp) {
            var expected = [
            "fire Event",
            "handle CAPTURE Event in Root",
            "handleGrandchild Event in ContainerContent",
            "handleChild Event in ContainerContent",
            "handle Event in ContainerContent",
            "handleContainer Event in Container",
            "handle Event in Root",
            "handleSuper Event in Root" ];

            cmp.find("logPanel").clear();
            cmp.find("container").find("content").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testContainerContentExtendedEventFromSuperNotHandledBySubdefs : {
        test : function(cmp) {
            var expected = [
            "fire Extended",
            "handle CAPTURE Extended in Root",
            "handleChild Extended in ContainerContent",
            "handle Extended in ContainerContent",
            "handleContainer Extended in Container",
            "handle Extended in Root",
            "handleSuper Extended in Root" ];

            cmp.find("logPanel").clear();
            cmp.find("container").find("content").getSuper().find("emitterExtended").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testProvidedByHandlerBubbling : {
        test : function(cmp) {
            var expected = [
            "fire Event",
            "handle CAPTURE Event in Root",
            "handleChild Event in Provided",
            "handle Event in Provided",
            "handle Event in Root",
            "handleSuper Event in Root" ];

            cmp.find("logPanel").clear();
            cmp.find("provided").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testClientCreatedBubblingIncludesRoot : {
        test : [
            function(cmp) {
                var that = this;
                cmp._target = undefined;
                $A.componentService.createComponent("test:testEventBubblingHandlerGrandchild", {
                        logId : "Client"
                    }, function(newCmp) {
                        var output = cmp.find("clientTarget");
                        newCmp.setAttributeValueProvider(output);
                        var body = output.get("v.body");
                        body.push(newCmp);
                        output.set("v.body", body);
                        cmp._target = newCmp;
                    });
                $A.test.addWaitFor(true, function() { return cmp._target !== undefined; });
            }, function(cmp) {
                var expected = [
                "fire Event",
                "handle CAPTURE Event in Root",
                "handleGrandchild Event in Client",
                "handleChild Event in Client",
                "handle Event in Client",
                "handle Event in Root",
                "handleSuper Event in Root" ];

                cmp.find("logPanel").clear();

                cmp._target.find("emitter").fireEvent();
                this.assertLogs(cmp, expected);
            }
        ]
    },

    testClientCreatedThenProvidedByHandlerBubbling : {
        test : [ function(cmp) {
            var that = this;
            cmp._target = undefined;
            $A.componentService.createComponent("test:testEventBubblingHandler", {
                logId : "ProvidedClient",
                provideByHandler : "test:testEventBubblingHandlerChild"
            }, function(newCmp) {
                var output = cmp.find("clientTarget");
                newCmp.setAttributeValueProvider(output);
                var body = output.get("v.body");
                body.push(newCmp);
                output.set("v.body", body);
                cmp._target = newCmp;
            });
            $A.test.addWaitFor(true, function() {
                return cmp._target !== undefined;
            });
        }, function(cmp) {
            var expected = [
            "fire Extended",
            "handle CAPTURE Extended in Root",
            "handleChild Extended in ProvidedClient",
            "handle Extended in ProvidedClient",
            "handle Extended in Root",
            "handleSuper Extended in Root" ];

            cmp.find("logPanel").clear();
            cmp._target.find("emitterExtended").fireEvent();
            this.assertLogs(cmp, expected);
        } ]
    },

    testStopInRoot : {
        test : function(cmp) {
            var expected = [
            "fire Event",
            "handle CAPTURE Event in Root",
            "handleGrandchild Event in ContainerContent",
            "handleChild Event in ContainerContent",
            "handle Event in ContainerContent",
            "handleContainer Event in Container",
            "handle Event in Root",
            "stopRoot Event" ];

            $A.test.addEventHandler("bubblingEvent", function(e) {
                $A.logger.info("stopRoot " + e.getParam("name"));
                e.stopPropagation();
            }, cmp, false);

            cmp.find("logPanel").clear();
            cmp.find("container").find("content").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testStopInContainer : {
        test : function(cmp) {
            var expected = [
            "fire Event",
            "handle CAPTURE Event in Root",
            "handleGrandchild Event in ContainerContent",
            "handleChild Event in ContainerContent",
            "handle Event in ContainerContent",
            "handleContainer Event in Container",
            "stopContainer Event" ];

            $A.test.addEventHandler("bubblingEvent", function(e) {
                $A.logger.info("stopContainer " + e.getParam("name"));
                e.stopPropagation();
            }, cmp.find("container"), false);

            cmp.find("logPanel").clear();
            cmp.find("container").find("content").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testStopInChild : {
        test : function(cmp) {
            var expected = [
            "fire Event",
            "handle CAPTURE Event in Root",
            "handleGrandchild Event in ContainerContent",
            "handleChild Event in ContainerContent",
            "stopChild Event" ];

            $A.test.addEventHandler("bubblingEvent", function(e) {
                $A.logger.info("stopChild " + e.getParam("name"));
                e.stopPropagation();
            }, cmp.find("container").find("content").getSuper(), false);

            cmp.find("logPanel").clear();
            cmp.find("container").find("content").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testStopInGrandchild : {
        test : function(cmp) {
            var expected = [
            "fire Event",
            "handle CAPTURE Event in Root",
            "handleGrandchild Event in ContainerContent",
            "stopGrandchild Event" ];

            $A.test.addEventHandler("bubblingEvent", function(e) {
                $A.logger.info("stopGrandchild " + e.getParam("name"));
                e.stopPropagation();
            }, cmp.find("container").find("content"), false);

            cmp.find("logPanel").clear();
            cmp.find("container").find("content").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testSelfDestroyedDuringBubbling : {
        test : function(cmp) {
            var expected = [
            "fire Event",
            "handle CAPTURE Event in Root",
            "destroy Inner" ];

            var toDestroy = cmp.find("inner");
            $A.test.addEventHandler("bubblingEvent", function() {
                $A.logger.info("destroy Inner");
                toDestroy.destroy();
            }, cmp.find("inner"), true);

            cmp.find("logPanel").clear();
            cmp.find("inner").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testSuperDestroyedDuringBubbling : {
        test : function(cmp) {
            var expected = [
                "fire Event",
                "handle CAPTURE Event in Root",
                "destroy InnerSuper"
            ];

            var toDestroy = cmp.find("inner").getSuper();
            $A.test.addEventHandler("bubblingEvent", function() {
                $A.logger.info("destroy InnerSuper");
                toDestroy.destroy();
            }, cmp.find("inner"), true);

            cmp.find("logPanel").clear();
            cmp.find("inner").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testSuperSuperDestroyedDuringBubbling : {
        test : function(cmp) {
            var expected = [
                "fire Event",
                "handle CAPTURE Event in Root",
                "handleGrandchild Event in Inner",
                "destroy InnerSuperSuper"
            ];

            var toDestroy = cmp.find("inner").getSuper().getSuper();
            $A.test.addEventHandler("bubblingEvent", function() {
                $A.logger.info("destroy InnerSuperSuper");
                toDestroy.destroy();
            }, cmp.find("inner").getSuper(), true);

            cmp.find("logPanel").clear();
            cmp.find("inner").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testComponentValueProviderDestroyedDuringBubbling : {
        test : function(cmp) {
            var expected = [
                "fire Event",
                "handle CAPTURE Event in Root",
                "handleGrandchild Event in ContainerContent",
                "handleChild Event in ContainerContent",
                "handle Event in ContainerContent",
                "destroy Container"
            ];

            var toDestroy = cmp.find("container");
            $A.test.addEventHandler("bubblingEvent", function() {
                $A.logger.info("destroy Container");
                toDestroy.destroy();
            }, cmp.find("container"), true);

            cmp.find("logPanel").clear();
            cmp.find("container").find("content").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testSuperWithoutHandlersContinuesBubbling : {
        test : function(cmp) {
            var expected = [
            "fire Event",
            "handle CAPTURE Event in Root",
            "handle Event in NoSuperHandlers",
            "handle Event in Root",
            "handleSuper Event in Root" ];

            cmp.find("logPanel").clear();
            cmp.find("noSuperHandlers").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testEventHandlerAddedDuringBubblingAreNotIncluded : {
        test : function(cmp) {
            var expected = [
            "fire Event",
            "handle CAPTURE Event in Root",
            "handleAdded1 Event",
            "handleAdded2 Event",
            "handleAdded3 Event",
            "add handlers",
            "handleChild Event in Provided",
            "handle Event in Provided",
            "handle Event in Root",
            "handleSuper Event in Root" ];

            var added = false;
            $A.test.addEventHandler("bubblingEvent", function(e) {
                $A.logger.info("handleAdded3 " + e.getParam("name"));
                if (!added) {
                    $A.logger.info("add handlers");

                    // insert a few at the beginning
                    $A.test.addEventHandler("bubblingEvent", function(e) {
                        $A.logger.info("handleAddedB " + e.getParam("name"));
                    }, cmp.find("provided"), true);
                    $A.test.addEventHandler("bubblingEvent", function(e) {
                        $A.logger.info("handleAddedA " + e.getParam("name"));
                    }, cmp.find("provided"), true);

                    // append a couple at the end
                    $A.test.addEventHandler("bubblingEvent", function(e) {
                        $A.logger.info("handleAddedX " + e.getParam("name"));
                    }, cmp.find("provided"), false);
                    $A.test.addEventHandler("bubblingEvent", function(e) {
                        $A.logger.info("handleAddedY " + e.getParam("name"));
                    }, cmp.find("provided"), false);
                    added = true;
                }
            }, cmp.find("provided"), true);
            $A.test.addEventHandler("bubblingEvent", function(e) {
                $A.logger.info("handleAdded2 " + e.getParam("name"));
            }, cmp.find("provided"), true);
            $A.test.addEventHandler("bubblingEvent", function(e) {
                $A.logger.info("handleAdded1 " + e.getParam("name"));
            }, cmp.find("provided"), true);

            cmp.find("logPanel").clear();
            cmp.find("provided").find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testSelfHandledWithoutFacetValueProvider : {
        test : function(cmp) {
            var expected = [
                "fire Super",
                "handleSuper Super in Root"
            ];

            cmp.find("logPanel").clear();
            cmp.getSuper().find("emitter").fireEvent();
            this.assertLogs(cmp, expected);
        }
    },

    testBubbleThroughPassthroughValue: {
        test: function(cmp) {
            var expected = [
                "fire Passthrough",
                "handle CAPTURE Passthrough in Root",
                "handle Passthrough in Root",
                "handleSuper Passthrough in Root"
            ];
            var emitter = cmp.find("emitterInIteration");

            cmp.find("logPanel").clear();
            emitter.fireEvent();

            var actual = this.getLoggedStatements(cmp);

            $A.test.assertEquals(expected.toString(), actual.toString());
        }
    }

})
