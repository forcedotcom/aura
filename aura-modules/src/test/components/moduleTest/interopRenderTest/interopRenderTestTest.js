({
    browsers: ['GOOGLECHROME'],

    // this test verifies that connectedCallback of a module component (interop) is called after its parent aura component is rendered
    // a custom event is dispatched in connectedCallback and handled by parent aura component to set the attribute to true.
    testConnectedCallbackDispatchEventHappenedAfterContainerComponentRendered: {
        test: [
            function(cmp) {
                $A.test.assertTrue(cmp.find('nav').get('v.isRegistered')); 
            }
        ]
    }
})