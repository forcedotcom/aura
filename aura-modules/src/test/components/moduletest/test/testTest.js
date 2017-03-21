({
    /**
     * Verify creating a module whose definition is fetched from the server.
     */
    testFetchNewDefFromServer: {
        test: [
            function (cmp) {
                var actionComplete = false;
                $A.createComponent("moduletest:text", {text: cmp.getReference("v.str3")}, function (newCmp) {
                    var body = cmp.get("v.body");
                    body.push(newCmp);
                    cmp.set("v.body", body);
                    actionComplete = true;
                });

                $A.test.addWaitFor(true, function () {
                    return actionComplete;
                }, function () {
                    var textCmp = cmp.get("v.body")[0];
                    $A.test.assertEquals(cmp.get("v.str3"), textCmp.get("v.text"), "Failed to pass attribute values to created component");
                });
            }
        ]
    },

    /**
     * Verify creation of component that contains a module.
     */
    testFetchNewComposedDefFromServer: {
        test: [
            function (cmp) {
                var actionComplete = false;
                $A.createComponent("moduletest:composed", {str: cmp.getReference("v.str3")}, function (newCmp) {
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
                    $A.test.assertEquals(cmp.get("v.str3"), text.get("v.text"), "Failed to pass attribute values to created component");
                });
            }
        ]
    }
})