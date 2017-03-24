({
    testGetNonExistentAction : {
        test : function(cmp) {
            var errorMsg = "Unknown controller action 'notHereCaptain'";
            try {
                var action = cmp.get("c.notHereCaptain");
                $A.test.fail("Attemping to get a non-existent client side controller action should have thrown error.");
            } catch (e) {
                $A.test.assertEquals(errorMsg, e.message);
            }
        }
    }
})
