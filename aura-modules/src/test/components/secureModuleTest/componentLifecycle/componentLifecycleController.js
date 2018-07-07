({
    componentLifecycleTester: function(cmp, event) {
        var testUtils = cmp.get("v.testUtils");
        var capturingDiv = cmp.find('capturingDiv').getElement();
        var params = event.getParam('arguments');

        var eventTriggered = false;

        capturingDiv.addEventListener('foo', function(ev) {
            testUtils.assertEquals(
                'SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }',
                ev.detail.win.toString(),
                'Mismatch in custom event data for window'
            );
            testUtils.assertEquals(
                'SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }',
                ev.detail.doc.toString(),
                'Mismatch in custom event data for document'
            );
            if (Object.hasOwnProperty('domElement', ev.detail)) {
                testUtils.assertEquals(
                    'SecureElement: [object HTMLParagraphElement]{ key: {"namespace":"secureModuleTest"} }',
                    ev.detail.domElement.toString(),
                    'Mismatch in custom event data for document'
                );
            }
            eventTriggered = true;
        });

        // Making sure that the life cycle hook was indeed invoked and we don't get any false positives
        testUtils.addWaitForWithFailureMessage(true, function(){
            return window[params.testCaseConfirmationFlag];
            },
            "Life cycle hook was not invoked:" + params.testCase);

        if (!['disconnectedCallbackHookCalled', 'constructorHookCalled'].includes(params.testCaseConfirmationFlag)) {
            testUtils.addWaitForWithFailureMessage(
                true,
                function() {
                    return eventTriggered;
                },
                "Event in lifecycle method was not fired"
            );
        }
    }
})
