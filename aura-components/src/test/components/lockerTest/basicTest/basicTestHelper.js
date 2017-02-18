({
    testCanAccessDocumentBodyFromHelper: function(testUtils) {
    	this.verifySharedSecureElement(testUtils, "body");
    },

    testCanAccessDocumentHeadFromHelper: function(testUtils) {
    	this.verifySharedSecureElement(testUtils, "head");
    },
    
    testAuraLockerInHelper: function(testUtils) {
        testUtils.assertStartsWith("SecureAura", $A.toString(), "Expected $A in helper to be a SecureAura");
    },
    
    testDocumentLockerInHelper: function(testUtils) {
        testUtils.assertStartsWith("SecureDocument", document.toString(), "Expected document in helper"
                + " to be a SecureDocument");
    },

    testWindowLockerInHelper: function(testUtils) {
        testUtils.assertStartsWith("SecureWindow", window.toString(), "Expected window in helper"
                + " to be a SecureWindow");
    },

    doTestSecureElementFrozenAfterCreation : function(testUtils, div) {
        testUtils.assertStartsWith("SecureElement", div.toString(), "Unexpected object returned from helper");
        testUtils.assertTrue(Object.isSealed(div), "SecureElement should be sealed");

        try {
            div.onclick = function(event) {};
            testUtils.fail("Should not be able to set a new property on SecureElement");
        } catch (e) {
            if (e.toString().indexOf("TypeError") !== 0) {
                testUtils.fail("Unexpected exception: " + e.toString());
            }
            testUtils.assertUndefined(div.onclick, "Should not be able to define a property on SecureElement");
        }

        try {
            Object.defineProperty(div, "onclick", {});
            testUtils.fail("Should not be able to define a new property via Object.defineProperty on SecureElement");
        } catch(e) {
            if (e.toString().indexOf("TypeError") !== 0) {
                testUtils.fail("Unexpected exception: " + e.toString());
            }
            testUtils.assertUndefined(div.onclick, "Should not be able to define a property on SecureElement");
        }
        testUtils.assertUndefined(div.onclick, "Should not be able to define a property on SecureElement");

        // Verify we can still modify whitelisted properties
        div.className = "fancypants";
        testUtils.assertEquals("fancypants", div.className, "Could not set property 'className' on SecureElement");
    },

    testFunction : function() {
        var f = new Function("x", "y", "return x + y");
        if (f(1, 2) !== 3) {
            throw new Error("Unable to use new Function()");
        }
    },

    doTestEvalForUndefined : function(cmp, testCase, testUtils) {
        testUtils.assertStartsWith("Global window via " + testCase.toString() + ": undefined", this.testExpression(testCase));
    },

    doTestEvalForSecureWindow : function(cmp, testCase, testUtils) {
        testUtils.assertStartsWith("Global window via " + testCase.toString() + ": SecureWindow", this.testExpression(testCase));
    },

    doTestEvalForSecureIFrameContentWindow: function(cmp, testCase, testUtils) {
        testUtils.assertStartsWith("Global window via " + testCase.toString() + ": SecureIFrameContentWindow", this.testExpression(testCase));
    },

    testExpression : function(testCase) {
        var result = testCase();
        return "Global window via " + testCase.toString() + ": " + result;
    },
    
    verifySharedSecureElement: function(testUtils, property) {
        var el = document[property];
        testUtils.assertStartsWith("SecureElement", el.toString(), "Expected document.body in helper to be a SecureElement");
        
        try {
        	el.innerHTML = "<div>Should throw an Aura exception</div>";
        	testUtils.fail("Should not be able to set innerHTML property on shared SecureElement: " + property);
    	} catch(e) {
	        testUtils.assertEquals("SecureElement.innerHTML cannot be used with " + property.toUpperCase() + " elements!", e.toString());
    	}
	},

    passCmpViaCreateComponent: function(cmp) {
        var a = {"getCmpRef": function() { return cmp.find("innerCmp"); }};
        $A.createComponent("lockerTestOtherNamespace:acceptsAttribute", { "obj": a },
            function(newCmp, status, error){
                var content = cmp.find("content");
                if (status === "SUCCESS") {
                    content.set("v.body", newCmp);
                } else {
                    content.getElement().textContent = error;
                }
            }
        );
    },
})
