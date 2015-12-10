({

    /**
     * When trying to get a non-existent action, we should fail fast by displaying an error to the user (via $A.error),
     * and throwing a Javascript exception, since $A.error will only display a message and does not stop execution.
     */
    testGetNonExistentAction : {
        test : function(cmp) {
            var errorMsg = "Cannot read property '$getActionDef$' of undefined";
            try {
                var action = cmp.get("c.notHereCaptain");
                $A.test.fail("Attemping to get a non-existent client side controller action should have thrown error.");
            } catch (e) {
                $A.test.assertEquals(errorMsg, e.message);
            }
        }
    }
})
