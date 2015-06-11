({
    /**
     * verify version value provider can be used correctly in expression
     */
    testGetRequiredVersionInLogicExpression: {
        test: function(cmp) {
            var button = cmp.find("versionInExp");
            $A.test.clickOrTouch(button.getElement());

            var actual = cmp.get("v.requestVersion");
            $A.test.assertEquals("2.0", actual);
        }
    },

   /**
     * Verify required version can be retrieved in client controller
     */
    testGetRequiredVersionInController: {
        test: function(cmp) {
            var button = cmp.find("versionInCntlr");
            $A.test.clickOrTouch(button.getElement());

            var actual = cmp.get("v.requestVersion");
            $A.test.assertEquals("2.0", actual);
        }
    },

    /**
     * verify required version can be retrieved by version value provider
     */
    testGetRequiredVersionInControllerByVersionValueProvier: {
        test: function(cmp) {
            var button = cmp.find("versionByValProvider");
            $A.test.clickOrTouch(button.getElement());

            var actual = cmp.get("v.requestVersion");
            $A.test.assertEquals("2.0", actual);
        }
    },

    testGetVersionInDynamicallyCreatedComponent: {
        test: function(cmp) {
            var button = cmp.find("versionInCreatedCmp");
            $A.test.clickOrTouch(button.getElement());

            $A.test.addWaitForWithFailureMessage(true,
                    function() {
                        var actual = cmp.get("v.requestVersion");
                        return actual === "2.0";
                    },
                    "Failed to get requested version from created component."
            );
        }
    },

    /**
     * Verify getting component required version from samespace component.
     * Since it's not allowed to require version for same namespace, this
     * should always act same as no required version declared.
     */
    testGetRequiredVersionInSameNamespaceComponent: {
        test: function(cmp) {
            var button = cmp.find("versionInSameNsCmp");
            $A.test.clickOrTouch(button.getElement());

            var actual = cmp.get("v.requestVersion");
            $A.test.assertUndefinedOrNull(actual);
        }
    },

    /**
     * verify getting version from no required version namespace component
     */
    testGetVersionFromNoRequiredVersionComponent: {
        test: function(cmp) {
            var button = cmp.find("versionInNoRequireCmp");
            $A.test.clickOrTouch(button.getElement());

            var actual = cmp.get("v.requestVersion");
            $A.test.assertUndefinedOrNull(actual);
        }
    },

    /**
     * Verify getting required version in super component
     */
    testGetVersionInSuperComponent: {
        test: function(cmp) {
            var button = cmp.find("versionInSuperCmp");
            $A.test.clickOrTouch(button.getElement());
            $A.test.assertUndefinedOrNull(cmp.get("v.requestVersionInSuper"));
        }
    },

    /**
     * Verify grandchild component's version depends on its parent required version
     */
    testGetVersionInGrandchildComponent: {
        test: function(cmp) {
            var button = cmp.find("versionInGchildCmp");
            $A.test.clickOrTouch(button.getElement());

            var actual = cmp.get("v.requestVersion");
            $A.test.assertEquals("3.0", actual);
        }
    },

    /**
     * Verify getVersion when a component as attribute in different namespace
     * components.
     */
    testGetVersionInCmpWithMultiParent: {
        test: function(cmp) {
            var button = cmp.find("versionInMultiParentCmp");
            $A.test.clickOrTouch(button.getElement());

            $A.test.addWaitForWithFailureMessage(true,
                    function() {
                        var versionInAuraTestCmp = cmp.find("auratestHolder").get("v.requestVersionInChild");
                        return versionInAuraTestCmp === "3.0";
                    },
                    "Failed to get requested version when the component is an attribute of in different" +
                    "namespace components: parent component under 'auratest' namespace."
            );
            $A.test.addWaitForWithFailureMessage(true,
                    function() {
                        var versionInTestCmp = cmp.find("testHolder").get("v.requestVersionInChild");
                        return versionInTestCmp === "1.5";
                    },
                    "Failed to get requested version when the component is an attribute of in different" +
                    "namespace components: parent component under 'test' namespace."
            );

        }
    }
})

