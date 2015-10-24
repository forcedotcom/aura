({
    /**
     * Tests for ComponentServiceMetricsPlugin.js
     */

    /**
     * Verify the method the plugin binds to is accessible.
     */
    testMethodAccessible: {
        test: function(cmp) {
            $A.test.assertDefined($A.componentService["newComponentDeprecated"]);
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
            var withoutPlugin = $A.componentService.newComponentDeprecated(config);

            $A.metricsService.enablePlugin("componentService");
            var withPlugin = $A.componentService.newComponentDeprecated(config);

            $A.test.assertEquals(expected, withoutPlugin.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals(expected, withPlugin.getDef().getDescriptor().getQualifiedName());
        }
    },

    testConfigAsString: {
        test: function(cmp) {
            var expected = "markup://aura:text";

            $A.metricsService.disablePlugin("componentService");
            var withoutPlugin = $A.componentService.newComponentDeprecated(expected);

            $A.metricsService.enablePlugin("componentService");
            var withPlugin = $A.componentService.newComponentDeprecated(expected);

            $A.test.assertEquals(expected, withoutPlugin.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals(expected, withPlugin.getDef().getDescriptor().getQualifiedName());
        }
    }
})