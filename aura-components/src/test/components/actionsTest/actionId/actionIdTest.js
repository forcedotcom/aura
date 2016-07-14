({
    /**
     * Verify action's ID contains action instance number.
     *
     * The action Id format is: 'x;a'
     *   x: Action instance number. Each instance of an Action object gets a new number.
     *   a: Denotes action
     */
    testActionIdContainsActionInstanceNumber: {
        test: function(cmp) {
            var actionId = cmp.get("c.createComponentsOnServer").getId();
            var actionCount = parseInt(actionId.split(";")[0]);
            var expected = (actionCount + 1) + ";a";

            var actual = cmp.get("c.retrieveServerComponentGlobalId").getId();
            $A.test.assertEquals(expected, actual);
        }
    },

    testActionIdContainsActionInstanceNumberForSameAction: {
        test: function(cmp) {
            var actionId = cmp.get("c.createComponentsOnServer").getId();
            var actionCount = parseInt(actionId.split(";")[0]);
            var expected = (actionCount + 1) + ";a";

            var actual = cmp.get("c.createComponentsOnServer").getId();
            $A.test.assertEquals(expected, actual);
        }
    }
})
