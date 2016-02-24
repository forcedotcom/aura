({
    /**
     * Verify server action state is Incomplete when the XHR timed out.
     */
    testActionIsIncompleteStateWhenXHRTimedout: {
        test: function(cmp) {
            var timeout = 1;
            $A.clientService.setXHRTimeout(timeout);

            var action = cmp.get("c.delayAction");
            action.setParams({delayMs: timeout * 100});
            $A.enqueueAction(action);

            $A.test.addWaitFor(true,
                function(){ return $A.test.areActionsComplete([action]); },
                function() {
                    $A.test.assertEquals("INCOMPLETE", action.getState());
                });
        }
    },

    /**
     * Verify Aura switches into offline when an XHR timed out.
     */
    testSwitchingToOfflineWhenXHRTimedout: {
        test: function(cmp) {
            var timeout = 1;
            // make sure it's online before XHR timed out
            $A.clientService.setConnected(true);
            $A.test.addCleanup(function(){
                    // set connection state back
                    $A.clientService.setConnected(true);
                });
            $A.clientService.setXHRTimeout(timeout);

            var action = cmp.get("c.delayAction");
            action.setParams({delayMs: timeout * 100});
            $A.enqueueAction(action);

            $A.test.addWaitFor(true,
                function(){ return $A.test.areActionsComplete([action]); },
                function() {
                    $A.test.assertFalse($A.clientService.isConnected());
                });
        }
    },

    /**
     * Verify server action run successfully if the XHR does NOT time out,
     * when XHR timeout value is set.
     */
    testActionSucceedsIfXHRNotTimedout: {
        test: function(cmp) {
            // set timeout as much larger than delay to prevent flapping
            // if the server is slow or the network is slow.
            $A.clientService.setXHRTimeout(90000);

            var action = cmp.get("c.delayAction");
            action.setParams({delayMs: (1)});
            $A.enqueueAction(action);

            $A.test.addWaitFor(true,
                function(){ return $A.test.areActionsComplete([action]); },
                function() {
                    $A.test.assertEquals("SUCCESS", action.getState());
                    $A.test.assertEquals(true, action.getReturnValue());
                });
        }
    }
})
