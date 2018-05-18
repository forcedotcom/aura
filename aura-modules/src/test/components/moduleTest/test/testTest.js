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
                $A.createComponent("moduleTest:fromServer", {text: cmp.getReference("v.str3")}, function (newCmp) {
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
     * Verify creating a module whose definition is fetched from the server *and* there is an Aura component equivalent
     * to the module. There is a good amount of branching logic on the server that forks between Aura and modules, we should
     * make sure wires aren't crossed when both exist.
     */
    testFetchNewDefFromServerWithAuraEquivalent: {
        labels : ["UnAdaptableTest"],
        browsers : [ 'GOOGLECHROME', 'FIREFOX' ],
        test: [
            function (cmp) {
                var actionComplete = false;
                $A.createComponent("moduleTest:fromServerWithAuraEquivalent", {text: cmp.getReference("v.str3")}, function (newCmp) {
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
    },
    testPassingDateObject: {
        test: [
            function (cmp) {
                cmp.set('v.date', new Date());
            },
            function (cmp) {
                var el = cmp.getElement();
                var dateInstance = cmp.get('v.date');
                var expected = dateInstance.toString();
                var actual = el.querySelector('.date-container').textContent;
                var errorMsg = 'Date instance should be pass through a module cmp';

                $A.test.assertEquals(expected, actual, errorMsg);
            }
        ]
    },

    testModuleAsLibrary: {
        test: [
            function(cmp) {
                var simpleLib = cmp.find("simple-lib");
                var method = simpleLib["log"];
                $A.test.assertTrue(typeof method === "function");
            }
        ]
    },

    testHasModule: {
        test: [
            function(cmp) {
                var simpleLib = cmp.find("simple-lib");
                $A.test.assertTrue(simpleLib.hasModuleDefinition("aura"), "'aura' module definition should be available");
                $A.test.assertTrue(simpleLib.hasModuleDefinition("markup://moduleTest:simpleCmp"), "'markup://moduleTest:simpleCmp' module definition as descriptor should exist");
                $A.test.assertTrue(simpleLib.hasModuleDefinition("moduletest-simple-cmp"), "'moduletest-simple-cmp' module definition as module naming should exist");
                $A.test.assertFalse(simpleLib.hasModuleDefinition("nonexistent-module-name"), "nonexistent module definition should not exist");
                $A.test.assertFalse(simpleLib.hasModuleDefinition("markup://aura:component"), "aura definition should not exist in module registry");
            }
        ]
    }
})
