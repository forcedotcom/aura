({
    testLoggableActionParams: {
        attributes: { "expectedParam": "testParam"},
        test: function(cmp) {
            $A.test.addWaitFor(cmp.get("v.expectedParam"), function() {
                return cmp.get("v.actualParam");
            });
        }
    }
})
