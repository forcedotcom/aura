({
    testErrorFromInvalidComponent : {
        attributes: {"handleSystemError": true},
        test: [
            function(cmp) {
                $A.test.expectAuraError("Invalid component tried calling function");
                $A.test.clickOrTouch(cmp.find("errorFromInvalidComponentButton").getElement());

                $A.test.addWaitForWithFailureMessage(true, function(){
                        return cmp.get("v.eventHandled");
                    },
                    "The expected error didn't get handled.");
            }, function(cmp) {
                // set handler back to default, so that error model can show up
                cmp.set("v.handleSystemError", false);

                var expectedSeverity = $A.severity.QUIET;
                $A.test.assertEquals(expectedSeverity, cmp.get("v.severity"), "Found unexpected severity");

                var expectedMessage = "Failing descriptor: {InvalidComponent markup://auratest:errorHandling";
                var errorMsg = $A.test.getText(document.getElementById("appErrorOutput"));
                $A.test.assertTrue($A.test.contains(errorMsg, expectedMessage),
                        "Failed to find expected failing descriptor: " + errorMsg);
            }
        ]
    },

    /**
     * Verify that AuraError's severity default value is Quiet
     */
    testAuraFriendlyErrorDefaultSeverity : {
        attributes: {"handleSystemError": true},
        test: [
            function(cmp) {
                $A.test.expectAuraError("AuraFriendlyError from app client controller");
                $A.test.clickOrTouch(cmp.find("auraFriendlyErrorFromClientControllerButton").getElement());

                $A.test.addWaitForWithFailureMessage(true, function(){
                        return cmp.get("v.eventHandled");
                    },
                    "The expected error didn't get handled.");
            }, function(cmp) {
                var expected = $A.severity.QUIET;
                var actual = cmp.get("v.severity");

                // set handler back to default, so that error model can show up
                cmp.set("v.handleSystemError", false);
                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    /**
     * Verify that a non-AuraError is wrapped in an AuraError when it's handled in error handler
     */
     testNonAuraErrorIsWrappedAsAuraErrorInHandler: {
        attributes: {"handleSystemError": true},
        test: [
            function(cmp) {

                $A.test.expectAuraError("Error from app client controller");
                $A.test.clickOrTouch(cmp.find("errorFromClientControllerButton").getElement());
                $A.test.addWaitForWithFailureMessage(true, function(){
                        return cmp.get("v.eventHandled");
                    },
                    "The expected error didn't get handled.");
            },
            function(cmp) {
                var expectedMessage = "Error from app client controller";
                // cmp._auraError gets assigned in error handler
                var targetError = cmp._auraError;
                cmp.set("v.handleSystemError", false);
                $A.test.assertTrue($A.test.contains(targetError.message, expectedMessage),
                        "Error in handler doesn't contain the original error message.");
            }
        ]
     },

    testFailingDescriptorForErrorFromCreateComponentCallback: {
        test: [
            function(cmp) {
                $A.test.expectAuraError("Error from createComponent callback in app");
                $A.test.clickOrTouch(cmp.find("errorFromCreateComponentCallbackButton").getElement());
                this.waitForErrorModal();
            },
            function(cmp) {
                var actual = this.findFailingDescriptorFromErrorModal();
                var action = cmp.get("c.throwErrorFromCreateComponentCallback");
                var expected = action.getDef().toString();

                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    /**
     * Verify that failing descriptor is correct when an Error gets thrown from aura:method.
     * The test approach is to click a button to call aura:method in controller.
     */
    testFailingDescriptorForErrorFromAuraMethodHandler: {
        test: [
            function(cmp) {
                $A.test.expectAuraError("Error from app client controller");
                $A.test.clickOrTouch(cmp.find("errorFromAuraMethodHandlerButton").getElement());
                this.waitForErrorModal();
            },
            function(cmp) {
                var actual = this.findFailingDescriptorFromErrorModal();
                // expects the descriptor is where the error happens
                var action = cmp.get("c.throwErrorFromClientController");
                var expected = action.getDef().toString();

                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    testFailingDescriptorForErrorFromAuraMethodWithCallback: {
        test: [
            function(cmp) {
                $A.test.expectAuraError("Error from server action callback in app");
                var action = cmp.get("c.throwErrorFromAuraMethodHandlerWithCallback");
                $A.enqueueAction(action);
                this.waitForErrorModal();
            },
            function(cmp) {
                var actual = this.findFailingDescriptorFromErrorModal();
                var expected = cmp.getDef().getDescriptor().getQualifiedName();

                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    testFailingDescriptorForErrorFromContainedCmpController: {
        test: [
            function(cmp) {
                $A.test.expectAuraError("Error from component client controller");
                $A.test.clickOrTouch(cmp.find("errorFromContainedCmpControllerButton").getElement());
                this.waitForErrorModal();
            },
            function(cmp) {
                var actual = this.findFailingDescriptorFromErrorModal();
                var action = cmp.find("containedCmp").get("c.throwErrorFromClientController");
                var expected = action.getDef().toString();

                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    testFailingDescriptorForErrorFromContainedCmpCallback: {
        test: [
            function(cmp) {
                $A.test.expectAuraError("Error from function wrapped in getCallback in component");
                var action = cmp.get("c.throwErrorFromContainedCmpCallback");
                $A.enqueueAction(action);
                this.waitForErrorModal();
            },
            function(cmp) {
                var actual = this.findFailingDescriptorFromErrorModal();
                var expected = cmp.find("containedCmp").getDef().getDescriptor().getQualifiedName();

                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    /**
     * Verify that failing descriptor is the source of original error when error from nested getCallback
     * functions.
     * The test approach is that call a client action to trigger a function wrapped by $A.getCallback, which
     * trigger another a funtion wrapped by $A.getCallback via aura:method. The actual error is from the latter
     * function, so the failing descriptor is the owner component of that function, which is the contained
     * component (markup://auratest:errorHandling).
     */
    testFailingDescriptorForErrorFromNestedGetCallbackFunctions: {
        test: [
            function(cmp) {
                $A.test.expectAuraError("Error from function wrapped in getCallback in component");
                var action = cmp.get("c.throwErrorFromNestedGetCallbackFunctions");
                $A.enqueueAction(action);
                this.waitForErrorModal();
            },
            function(cmp) {
                var actual = this.findFailingDescriptorFromErrorModal();
                var expected = cmp.find("containedCmp").getDef().getDescriptor().getQualifiedName();

                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    testStackTraceForErrorFromServerActionCallbackWrappedInGetCallback: {
        test: [
            function(cmp) {
                $A.test.expectAuraError("Error in $A.getCallback() [Error from server action callback wrapped in $A.getCallback]");
                $A.test.clickOrTouch(cmp.find("errorFromServerActionCallbackWrappedInGetCallbackButton").getElement());
                this.waitForErrorModal();
            },
            function(cmp) {
                var actual = this.findStacktraceFromErrorModal();
                var expected = "java://org.auraframework.components.test.java.controller.TestController/ACTION$doSomething@markup://auratest:errorHandlingApp";

                $A.test.assertTrue(actual.indexOf(expected) > -1);
            }
        ]
    },

    testFailingDescriptorForNonExistingEventHandlerError: {
        test: [
            function(cmp) {
                $A.test.expectAuraError("Unable to find 'nonExistingHandler'");
                $A.test.clickOrTouch(cmp.find("fireTestEventButton").getElement());
                this.waitForErrorModal();
            },
            function(cmp) {
                var actual = this.findFailingDescriptorFromErrorModal();
                var expected = cmp.getDef().getDescriptor().getQualifiedName();

                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    testFiringServerActionErrorEvent: {
        test: [
            function(cmp) {
                // arrange
                var expected = "foo";
                var actual;

                $A.eventService.addHandler({
                    "event": "aura:serverActionError",
                    "globalId": cmp.getGlobalId(),
                    "handler": function(event) {
                        actual = event.getParam("auraError").message;
                    }
                });

                // act
                var event = $A.eventService.newEvent("aura:serverActionError");
                event.setParam("auraError", new Error(expected));
                event.fire();

                // assert
                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    waitForErrorModal: function(callback) {
        $A.test.addWaitForWithFailureMessage(true,
            function(){
                var element = document.getElementById('auraErrorMask');
                var style = $A.test.getStyle(element, 'display');
                return style === 'block';
            },
            "Error Model didn't show up.",
            callback);
    },

    findStacktraceFromErrorModal: function() {
        var element = document.getElementById('auraErrorStack');
        $A.test.assertNotNull(element, "Failed to find stacktrace element");
        return $A.test.getText(element);
    },

    /**
     * This function doesn't check if error modal exist. If expected error is from async
     * code, using waitForErrorModal() to guarantee error modal is shown.
     */
    findFailingDescriptorFromErrorModal: function() {
        var errorMsg = $A.test.getText(document.getElementById('auraErrorMessage'));
        if(!errorMsg) {
            $A.test.fail("Failed to find error message.");
        }
        var matches = errorMsg.match(/^Failing descriptor: \{(.*)\}$/m);
        if(!matches) {
            $A.test.fail("Failed to find Failing Descriptor from error message: " + errorMsg);
        }
        var failingDescriptor = matches[1];
        return failingDescriptor;
    }

})
