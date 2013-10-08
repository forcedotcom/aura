({
	/**
	 * Test the server side action is a background action
	 */
	testServerActionIsBackground : {
		test : function(component) {
			var foregroundAction = component.get("c.executeInForeground");
			$A.test.assertFalse(foregroundAction.isBackground(),
					"foreground action should have had isBackground === false");
			var foregroundActionWR = component.get("c.executeInForegroundWithReturn");
			$A.test.assertFalse(foregroundActionWR.isBackground(),
					"foreground action with return should have had isBackground === false");
			var backgroundAction = component.get("c.executeInBackground");
			$A.test.assertTrue(backgroundAction.isBackground(),
					"background action should have had isBackground === true");
			var backgroundActionWR = component.get("c.executeInBackgroundWithReturn");
			$A.test.assertTrue(backgroundActionWR.isBackground(),
					"background action with return should have had isBackground === true");

			var wasFG = component.get("c.executeInForeground");
			wasFG.setBackground(true);
			$A.test.assertTrue(wasFG.isBackground(), "wasFG action should have had isBackground set to true");
			var stillBG = component.get("c.executeInBackground");
			stillBG.setBackground(false);
			$A.test.assertTrue(stillBG.isBackground(), "stillBG action should not have had isBackground set to false");
		}
	},

	// Sets up window error handler, executes testFunction with provided input, then checks for uncaught error message.
	// Can't try/catch because the error is expected in the XHR callback.
	assertUncaughtCallbackError : function(testFunction, errorMessageStartsWith) {
		var original = window.onerror;
		var message;
		window.onerror = function(msg, err) {
			message = msg;
			return true;
		};
		testFunction();
		$A.test.addWaitForWithFailureMessage(true, function() {
			if (!!message) {
				// restore window error handler once an error is detected
				// if test failed before this, then it doesn't really matter whether the handler is restored
				window.onerror = original;
				return true;
			}
			return false;
		}, "Timed out waiting for uncaught javascript error", function(cmp) {
			var msg = $A.test.getAuraErrorMessage();
			if (msg.indexOf(errorMessageStartsWith) !== 0) {
				$A.test.fail("Unexpected error message: " + msg);
			}

		});
	},

	testEnqueuedCallbackJavascriptError : {
		test : function(cmp) {
			this
					.assertUncaughtCallbackError(
							function() {
								var a = $A.test.getAction(cmp, "c.executeInForeground", null, function() {
									throw new Error("this is intentional");
								});
								$A.run(function() {
									$A.enqueueAction(a);
								});
							},
							"Error while running actionCallback[java://org.auraframework.impl.java.controller.ParallelActionTestController/ACTION$executeInForeground:{}] : Error while running java://org.auraframework.impl.java.controller.ParallelActionTestController/ACTION$executeInForeground:{}");
		}
	},

	testRunActionsCallbackJavascriptError : {
		test : function(cmp) {
			this
					.assertUncaughtCallbackError(
							function() {
								var a = $A.test.getAction(cmp, "c.executeInForeground", null, function() {
									throw new Error("this is intentional");
								});
								$A.clientService.runActions([ a ], cmp, function() {
								});
							},
							"Error while running actionCallback[java://org.auraframework.impl.java.controller.ParallelActionTestController/ACTION$executeInForeground:{}] : Error while running java://org.auraframework.impl.java.controller.ParallelActionTestController/ACTION$executeInForeground:{}");
		}
	},

	testRunActionsGroupCallbackJavascriptError : {
		test : function(cmp) {
			this
					.assertUncaughtCallbackError(
							function() {
								var a = $A.test.getAction(cmp, "c.executeInForeground", null, function() {
								});
								$A.clientService.runActions([ a ], cmp, function() {
									throw new Error("this is intentional");
								});
							},
							"Error while running actionCallback[java://org.auraframework.impl.java.controller.ParallelActionTestController/ACTION$executeInForeground:{}] : Error while running java://org.auraframework.impl.java.controller.ParallelActionTestController/ACTION$executeInForeground:{}");
		}
	},

    testServerActionSendsError : {
        test : [ function(cmp) {
                var a = $A.test.getAction(cmp, "c.errorInForeground", null,
                      function(action) {
                          cmp.getAttributes().setValue("errorMessage", action.error[0].message);
                      });
                $A.clientService.runActions([ a ], cmp);
                $A.test.addWaitFor(true, function() {
                        return cmp.getAttributes().get("errorMessage") !== undefined;
                    });
            }, function(cmp) {
                 var message = cmp.getAttributes().get("errorMessage");
                 $A.test.assertTrue(message != undefined, "No error message from server at all");
                 $A.test.assertTrue(message.indexOf("ArrayIndexOutOfBoundsException: 42") > 0,
                     "Wrong message received from server: " + message);
            }]
    }

})
