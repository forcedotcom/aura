({
    browsers: ['GOOGLECHROME'],

    testFailingDescriptorForErrorFromInteropComponent: {
        test: [
            function(cmp) {
                $A.test.expectAuraError("Uncaught Error: boom!");
                $A.test.clickOrTouch(cmp.find("main").getElement().querySelector('.boom'));
            },
            function(cmp) {
                var actualComponent = cmp['_auraError']['component'];
                var expectedComponent = 'markup://moduleTest:simpleCmp';
                $A.test.assertEquals(expectedComponent, actualComponent);

                var actualComponentStack = cmp['_auraError']['componentStack'];
                var expectedComponentStack = '[moduleTest:interopErrorTest]';
                $A.test.assertEquals(expectedComponentStack, actualComponentStack);
            }
        ]
    }
})