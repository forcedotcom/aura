({
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

    testFailingDescriptorForErrorFromPromise: {
        test: [
            function(cmp) {
                $A.test.clickOrTouch(cmp.find("errorFromPromiseButton").getElement());
                this.waitForErrorModal();
            },
            function(cmp) {
                var actual = this.findFailingDescriptorFromErrorModal();
                var expected = "markup://auratest:errorHandlingApp";

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
                        actual = event.getParam("error").message;
                    }
                });

                // act
                var event = $A.eventService.newEvent("aura:serverActionError");
                event.setParam("error", new Error(expected));
                event.fire();

                // assert
                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    testHandleExceptionAsAssertion: {
        attributes: {"handleSystemError": true},
        test: [
            function (cmp) {
                // arrange
                var action = cmp.get("c.handleException");

                // act
                $A.enqueueAction(action);

                $A.test.addWaitForWithFailureMessage(true, function () {
                    return cmp.get("v.eventHandled");
                }, "The expected error didn't get handled.");
            },

            // assert
            function (cmp) {
                cmp.set("v.handleSystemError", false);
                this.checkActionError(cmp._auraError, "err", $A.severity.ALERT, "org.auraframework.throwable.GenericEventException");
            }
        ]
    },

    testHandleExceptionWithThrownArgument: {
        attributes: {"handleSystemError": true},
        test: [
            function (cmp) {
                // arrange
                var action = cmp.get("c.handleExceptionWithThrownArgument");

                // act
                $A.enqueueAction(action);

                $A.test.addWaitForWithFailureMessage(true, function () {
                    return cmp.get("v.eventHandled");
                }, "The expected error didn't get handled.");
            },

            // assert
            function (cmp) {
                cmp.set("v.handleSystemError", false);
                this.checkActionError(cmp._auraError, "err", $A.severity.ALERT, "java.lang.RuntimeException");
            }
        ]
    },

    testHandleExceptionCallbackNotCalled: {
        test: [
            function(cmp) {
                // arrange
                var action = cmp.get("c.handleException");
                var called = false;
                action.setCallback(cmp, function() {
                    called = true;
                });

                // act
                $A.enqueueAction(action);

                // assert
                this.waitForErrorModal(function() {
                    $A.test.assertFalse(called);
                });
            }
        ]
    },

    testHandleCustomException: {
        test: [
            function (cmp) {
                // arrange
                var targetError;
                var action = cmp.get("c.handleCustomException");
                var called = false;

                action.setCallback(cmp, function (response) {
                    targetError = response.error[0];
                    called = true;
                });

                // act
                $A.enqueueAction(action);

                // assert
                $A.test.addWaitFor(
                    true,
                    function() {
                        return called;
                    },
                    function() {
                        this.checkActionError(targetError, "err", undefined, "java.lang.RuntimeException");
                    });
            }
        ]
    },

    testHandleCustomExceptionWithData: {
        test: [
            function(cmp) {
                // arrange
                var targetError;
                var action = cmp.get("c.handleCustomExceptionWithData");
                var called = false;

                action.setCallback(cmp, function (response) {
                    targetError = response.error[0];
                    called = true;
                });

                // act
                $A.enqueueAction(action);

                // assert
                $A.test.addWaitFor(
                    true,
                    function() {
                        return called;
                    },
                    function() {
                        this.checkActionError(targetError, "err", undefined, "java.lang.RuntimeException");
                        $A.test.assertEquals("testCustomMessage", targetError.data.customMessage);
                    });
            }
        ]
    },

    testGetCallbackErrorReporting: {
        test: [
            /**
             * Verifies that passing in random data to a getCallback generated function reports
             * the original error.
             */
            function(cmp) {
                var expected = "Error in $A.getCallback() [testGetCallbackErrorReporting]";
                var callback = $A.getCallback(function(){
                    throw new Error("testGetCallbackErrorReporting");
                });
                var actual;

                try {
                    callback(true, true);
                } catch(e) {
                    actual = e.message;
                }

                $A.test.assertEquals(expected, actual);
            },

            /**
             * Verifies that when you pass in an action as the first parameter, but junk as the second still reports the original error.
             */
            function(cmp) {
                var expected = "Error in $A.getCallback() [testGetCallbackErrorReporting]";
                var action = cmp.get("c.handleCustomExceptionWithData");
                var callback = $A.getCallback(function(){
                    throw new Error("testGetCallbackErrorReporting");
                });
                var actual;

                try {
                    callback(action, true);
                } catch(e) {
                    actual = e.message;
                }

                $A.test.assertEquals(expected, actual);
            },

            /**
             * Verifies Happiest path. Passing in an action and a component. This is the typical use case for actions throwing exceptions
             * and what the getCallback should be best at reporting errors for.
             */
            function(cmp) {
                var expected = "Error in $A.getCallback() [testGetCallbackErrorReporting]";
                var action = cmp.get("c.handleCustomExceptionWithData");
                var callback = $A.getCallback(function(){
                    throw new Error("testGetCallbackErrorReporting");
                });
                var actual;

                try {
                    callback(action, cmp);
                } catch(e) {
                    actual = e.message;
                }

                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    /**
     * Checks the properties of an Action error object.
     *
     * @param error         Actual error object to check.
     * @param message       Expected error message.
     * @param severity      Expected severity.
     * @param stackTrace    Expected stack trace.
     */
    checkActionError: function (error, message, severity, stackTrace) {
        $A.test.assertTrue(typeof error.id === 'string' && error.id.length > 0, "Unexpected error id");
        $A.test.assertEquals(message, error.message, "Unexpected error message");
        $A.test.assertEquals(severity, error.severity, "Unexpected error severity");
        $A.test.assertEquals(error.stackTrace.indexOf(stackTrace), 0, "Unexpected error stack trace");
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
