({
    testGetHelperReturnsAnObjectWhenNoHelperDefined: {
        test: function(cmp) {
            var helper = cmp.getDef().getHelper();

            $A.test.assertNotUndefinedOrNull(helper);
            $A.test.assertTrue($A.util.isEmpty(helper),
                    "getHelper should return an empty object");
        }
    },

    testGetRendererReturnsUndefineWhenNoCustomClientRenderer: {
        test: function(cmp) {
            var renderer = cmp.getRenderer();
            $A.test.assertUndefined(renderer,
                    "getRenderer shoud return undefined when no custom client renderer");
        }
    }
})
