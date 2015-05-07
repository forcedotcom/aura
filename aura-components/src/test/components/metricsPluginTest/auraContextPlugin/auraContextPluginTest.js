({
    /**
     * Tests for AuraContextPlugin.js
     */
    
    /**
     * Verify the method the plugin binds to is accessible.
     */
    testMethodAccessible: {
        test: function(cmp) {
            $A.test.assertDefined($A.getContext()["merge"]);
        }
    },

    /**
     * Verify original method called and passed original parameter with plugin enabled.
     */
    testOriginalFunctionCalled: {
        test: function(cmp) {
            var actual;
            $A.metricsService.enablePlugin("defRegistry");
            var mockContext = {"componentDefs": [{"descriptor":"boo"},{"descriptor":"hoo"}]};
            var mockFunction = function(otherContext) {
                actual = otherContext;
            };
            var override = $A.test.overrideFunction($A.getContext(), "merge", mockFunction);
            $A.test.addCleanup(function() { override.restore(); });

            $A.getContext().merge(mockContext);

            $A.test.assertDefined(actual, "Original $A.context.merge function never called");
            $A.test.assertEquals(mockContext, actual, "Did not receive expected parameter to $A.context.merge");
        }
    }
})