({
    testDynamicComponentCreationWithGetReference: {
        test: [function(cmp) {
            cmp.createInteropWithGetReference();
            $A.test.addWaitForWithFailureMessage(true, function() {
                return !!document.querySelector('moduletest-simple-cmp');
            }, "Dynamically created Interop component never present in DOM");
        },
        function(cmp) {
            document.querySelector('moduletest-simple-cmp').click();
            $A.test.assertTrue(cmp.get("v.actionCalled"), "Action referenced via cmp.getReference() not called");
        }]
    }
})
