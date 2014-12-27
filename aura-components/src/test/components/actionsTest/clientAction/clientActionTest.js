({
	tearDown : function(component){
		component._gotResponse = null;
        delete component._gotResponse;
	},
	/**
	 * Test the client side action is a background action
	 */
	testClientActionIsBackground : {
		test : function(component) {
			var clientSideAction = component.get("c.clientSideAction");
			$A.test.assertFalse(clientSideAction.isBackground(),
					"clientSideAction should have had isBackground === false");

			clientSideAction.setBackground(true);
			$A.test.assertTrue(clientSideAction.isBackground(),
					"clientSideAction should have had isBackground === true after calling setBackground(true)");

			var clientSideAction = component.get("c.clientSideAction");
			$A.test.assertFalse(clientSideAction.isBackground(),
					"a freshly created clientSideAction should have had isBackground === false");
		}
	},
	/**
	 * Test the client side foreground action is executed once enqueued
	 */
	testClientActionInForeground : {
		test : [function(component) {
			var action = component.get("c.cExecuteInForeground");
			component._gotResponse = false;
			action.setCallback(this, function() {
				component._gotResponse = true;
			});
			$A.test.enqueueAction(action, true);
		}, function(component) {
			

			$A.test.addWaitFor(true, function() {
				return component._gotResponse;
			});
		}, function(component) {
			$A.test.assertTrue(component._gotResponse, "Client Side Action was not called after enqueue.");
		}]
	},

	/**
	 * Test the client side foreground action is executed once enqueued
	 */
	testClientActionInBackground : {
		test : [function(component) {
			var action = component.get("c.cExecuteInBackground");
			component._gotResponse = false;
			action.setCallback(this, function() {
				component._gotResponse = true;
			});
			$A.test.enqueueAction(action, true);
		}, function(component) {
		
			$A.test.addWaitFor(true, function() {
				return component._gotResponse;
			});
		}, function(component) {
			$A.test.assertTrue(component._gotResponse, "Background Client Side Action was not called after enqueue.");
		}]
	}

	/**
	 * Framework just logs the controller error.  No visible error message.
	 */
        //	FIXME: uncomment when client side creation is fixed.
//	testClientActionJavascriptError : {
//		test : [ function(cmp) {
//			var message, error;
//			$A.test.addFunctionHandler($A, "warning", function(msg, err) {
//				message = msg;
//				error = err;
//			});
//			$A.run(function() {
//				$A.enqueueAction(cmp.get("c.error"));
//			});
//			$A.test.assertEquals("Action failed: markup://actionsTest:clientAction -> error", message);
//		} ]
//	}
})
