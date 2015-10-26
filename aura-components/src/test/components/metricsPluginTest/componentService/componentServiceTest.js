({
    /**
     * Tests for ComponentServiceMetricsPlugin.js
     */

    /**
     * Verify the method the plugin binds to is accessible.
     */
    testMethodAccessible: {
        test: function(cmp) {
            $A.test.assertDefined($A.componentService["createComponentFromConfig"]);
        }
    },

    testBasicUsage: {
        test: function(cmp) {
            var expected = "markup://aura:text";
            var config = {
                componentDef : { descriptor: expected },
                attributes : { values: { value: "fyiders" } }
            };

            $A.metricsService.disablePlugin("componentService");
            var withoutPlugin = $A.componentService.createComponentFromConfig(config);

            $A.metricsService.enablePlugin("componentService");
            var withPlugin = $A.componentService.createComponentFromConfig(config);

            $A.test.assertEquals(expected, withoutPlugin.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals(expected, withPlugin.getDef().getDescriptor().getQualifiedName());
        }
    }
})