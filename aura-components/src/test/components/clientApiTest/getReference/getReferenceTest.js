({
    testGetGlobalReference: {
        test: function(cmp) {
            var expression = "$Browser";
            var browserRef = $A.getReference(expression);
            $A.test.assertTrue($A.util.isExpression(browserRef), "$A.getReference should return a PropertyReferenceValue");
            $A.test.assertEquals(expression, browserRef.getExpression(), "Unexpected return from getExpression()");
            $A.test.assertEquals($A.get(expression), browserRef.evaluate(), "evaluate() should return same object as $A.get()");
        }
    },

    testGetNewLabelEvaluation: {
        test: function(cmp) {
            // use string concatenation so framework does not parse the source and pre-fetch the label
            var labelRef = $A.getReference("$Label.test." + "task_mode_today");
            cmp.set("v.labelAttr", labelRef);
            // framework will make a network request for the label so need to wait
            $A.test.addWaitForWithFailureMessage(
                    "Today",
                    function() {
                        return cmp.get("v.labelAttr");
                    },
                    "Label reference never returns expected label",
                    function() {
                        $A.test.assertEquals("Today", $A.util.getText(document.getElementById("output")));
                    }
            );
        }
    }
})
