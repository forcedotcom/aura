({
    /**
     * Verify creating a module whose definition is fetched from the server.
     */
    testFetchNewDefFromServer: {
        labels : ["UnAdaptableTest"],
        browsers : [ 'GOOGLECHROME', 'FIREFOX' ],
        test: [
            function (cmp) {
                var actionComplete = false;
                $A.createComponent("moduleTest:textCmp", {text: cmp.getReference("v.str3")}, function (newCmp) {
                    var body = cmp.get("v.body");
                    body.push(newCmp);
                    cmp.set("v.body", body);
                    actionComplete = true;
                });

                $A.test.addWaitFor(true, function () {
                    return actionComplete;
                }, function () {
                    var textCmp = cmp.get("v.body")[0];
                    $A.test.assertTrue(!!textCmp["interopClass"], "Should be InteropComponent for modules");
                    $A.test.assertEquals(cmp.get("v.str3"), textCmp.get("v.text"), "Failed to pass attribute values to created component");
                });
            }
        ]
    },

    /**
     * Verify creation of component that contains a module.
     */
    testFetchNewComposedDefFromServer: {
        labels : ["UnAdaptableTest"],
        browsers : [ 'GOOGLECHROME', 'FIREFOX' ],
        test: [
            function (cmp) {
                var actionComplete = false;
                $A.createComponent("moduleTest:composed", {str: cmp.getReference("v.str3")}, function (newCmp) {
                    var body = cmp.get("v.body");
                    body.push(newCmp);
                    cmp.set("v.body", body);
                    actionComplete = true;
                });

                $A.test.addWaitFor(true, function () {
                    return actionComplete;
                }, function () {
                    var composed = cmp.get("v.body")[0];
                    var text = composed.find("module-text");
                    $A.test.assertTrue(!!text["interopClass"], "Should be InteropComponent for modules");
                    $A.test.assertEquals(cmp.get("v.str3"), text.get("v.text"), "Failed to pass attribute values to created component");
                });
            }
        ]
    }
})