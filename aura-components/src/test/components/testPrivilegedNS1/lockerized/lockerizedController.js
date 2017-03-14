({
    testCreateComponentWithPRV: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var complete = false;
        var prv = cmp.getReference('v.valueByRef');
        $A.createComponent("ui:outputText", {
                value: prv
            },
            function (newCmp, status, error) {
                testUtils.assertTrue(newCmp.toString().indexOf("SecureComponentRef") === 0,
                        "$A.createComponent call should return Lockerized component");
                testUtils.assertEquals("default string", newCmp.get("v.value"), "Unexpected PRV value");
                complete = true;
            }
        );
        testUtils.addWaitForWithFailureMessage(
                true,
                function() { return complete; },
                "$A.createComponent callback never called"
        );
    },

    testCreateComponentWithNestedPRV: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var complete = false;
        var prv = cmp.getReference('v.valueByRef');
        var att = {
                obj: {
                    anotherObj: {
                        someString: "asdf0",
                        someArray: ["adsf1", prv, "asdf2"]
                    },
                    comp: cmp,
                    yetAnotherString: "asdf3"
                }
            };
        $A.createComponent("testPrivilegedNS1:lockerizedFacet", 
            att,
            function (newCmp, status, error) {
                cmp.find("content").set("v.body", newCmp);
                testUtils.assertTrue(newCmp.toString().indexOf("SecureComponent") === 0,
                        "$A.createComponent call should return Lockerized component");
                var obj = newCmp.get("v.obj");
                testUtils.assertTrue(obj.anotherObj.someArray[1].toString().indexOf("SecurePropertyReferenceValue") === 0,
                        "SecurePropertyReferenceValue not found nested in object/array for $A.createComponent call");
                testUtils.assertTrue(att.obj.anotherObj.someArray[1].toString().indexOf("SecurePropertyReferenceValue") === 0,
                        "Original object passed to $A.createComponent should not have values unfiltered");
                complete = true;
            }
        );
        testUtils.addWaitForWithFailureMessage(
                true,
                function() { return complete; },
                "$A.createComponent callback never called"
        );
    },

    testCreateComponents: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var complete = false;
        var prv = cmp.getReference('v.valueByRef');
        $A.createComponents([
             ["testPrivilegedNS1:lockerizedFacet", { obj: { prv: prv, comp: cmp } }],
             ["ui:outputText", { value: prv }],
             ],
            function (components, status, error) {
                testUtils.assertEquals(2, components.length,
                        "Unexpected number of components returned from $A.createComponents");
                testUtils.assertTrue(components[0].get("v.obj").prv.toString().indexOf("SecurePropertyReferenceValue") === 0,
                    "SecurePropertyReferenceValue not found nested in object/array for $A.createComponents call");
                complete = true;
            }
        );
        testUtils.addWaitForWithFailureMessage(
                true,
                function() { return complete; },
                "$A.createComponent callback never called"
        );
    }
})
