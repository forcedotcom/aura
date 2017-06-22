({
	labels : ["UnAdaptableTest"],
	
    testCanAccessGlobalAttributeOnBaseComponent: {
        test: function(cmp) {
            cmp.testAttributeAccess("Global");
            $A.test.assertEquals("GLOBAL", cmp.get("v.output"));
        }
    },

    testCanNotAccessPublicAttributeOnBaseComponentFromDifferentNamespace: {
        test: function(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            
            cmp.testAttributeAccess("Public");
            $A.test.assertEquals(undefined, cmp.get("v.output"));
            this.waitForErrorModal(
                    function() {
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AttributeSet.get(): attribute \'Public\' of component \'markup://auratest:accessExtendsGlobalWithAttributes",
                                    "markup://auratest:accessExtendsGlobalWithAttributes");
             });
        }
    },

    testCanAccessInternalAttributeOnBaseComponent: {
        test: function(cmp) {
            cmp.testAttributeAccess("Internal");
            $A.test.assertEquals("INTERNAL", cmp.get("v.output"));
        }
    },

    testCanNotAccessPrivateAttributeOnBaseComponent: {

        test: function(cmp) {
            // One for the final read into v.output
            $A.test.expectAuraError("Access Check Failed!");
            
            cmp.testAttributeAccess("Private");
            $A.test.assertEquals(undefined, cmp.get("v.output"));
            this.waitForErrorModal(
                    function() {
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AttributeSet.get(): attribute \'Private\' of component \'markup://auratest:accessExtendsGlobalWithAttributes",
                                    "markup://auratest:accessExtendsGlobalWithAttributes");
             });
        }
    },

    waitForErrorModal: function(callback) {
        $A.test.addWaitForWithFailureMessage(true,
            function(){
                var element = document.getElementById('auraErrorMask');
                var style = $A.test.getStyle(element, 'display');
                return style === 'block';
            },
            "Error Modal didn't show up.",
            callback);
    }
})
