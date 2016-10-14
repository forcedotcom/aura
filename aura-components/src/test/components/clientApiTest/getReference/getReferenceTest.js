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
                    true,
                    function() {
                        // wait for placeholder to be replaced
                        return cmp.get("v.labelAttr") !== "[test.task_mode_today]";
                    },
                    "Label reference never replaced original value",
                    function() {
                        var labelText = $A.util.getText(document.getElementById("output"));
                        // if server does not have label we get back 'does not exist' message
                        $A.test.assertTrue(labelText === "Today" || labelText === "$Label.test.task_mode_today does not exist.");
                    }
            );
        }
    }
})
