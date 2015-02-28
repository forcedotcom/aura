({
    /**
     * Tests for ClientServiceMetricsPlugin.js
     */
    
    /**
     * Verify the method the plugin binds to is accessible.
     */
    testMethodAccessible: {
        test: function(cmp) {
            $A.test.assertDefined($A.clientService["init"]);
        }
    }
})