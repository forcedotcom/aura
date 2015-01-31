({
    testLabelAsAttribute: {
        test : function(cmp) {
            $A.test.assertEquals("Today", cmp.find('LabelAsAttribute').get('v.class'));
        }
    },

    testLabelAsExpressionComponent: {
        test : function(cmp) {
            $A.test.assertEquals("Today + Overdue", $A.test.getTextByComponent(cmp.find('LabelAsExpressionComponent')));
        }
    },

    testInnerLabelsLoaded: {
        test: function(cmp) {
            $A.test.assertEquals("Tomorrow", $A.test.getTextByComponent(cmp.find("innerCmp")),
                    "Label on inner component not properly displayed");
            $A.test.assertEquals("Tomorrow", $A.get("$Label.Section1.task_mode_tomorrow"));
        }
    },

    testDependencyLabelsLoaded: {
        test: function(cmp) {
            // These labels on dependency are not displayed, just verify they are loaded on client.
            $A.test.assertEquals("Controller", $A.get("$Label.Section1.controller"));
            $A.test.assertEquals("Helper", $A.get("$Label.Section1.helper"));
            $A.test.assertEquals("Provider", $A.get("$Label.Section1.provider"));
            $A.test.assertEquals("Renderer", $A.get("$Label.Section1.renderer"));
        }
    }
})