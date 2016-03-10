({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */


    testCannotAccessDocumentBodyFromHelper: {
        test: function(cmp) {
            cmp.helper.accessDocumentBody(cmp);
            var wrapped = cmp.get("v.log");
            $A.test.assertStartsWith("SecureThing", wrapped.toString(), "Expected document.body passed to helper"
                    + " to be an SecureThing");
        }
    },

    testAlertExposed: {
        test: function(cmp) {
            cmp.getAlert();
            var alert = cmp.get("v.log");
            // the string starts with line break in IE
            alert = alert.trim();
            $A.test.assertStartsWith("function alert() {", alert, "alert() not exposed");
        }
    },

    testAuraLockerInController: {
        test: function(cmp) {
            cmp.getWrappersFromController();
            var wrapped = cmp.get("v.log")["$A"];
            $A.test.assertStartsWith("SecureAura", wrapped.toString(), "Expected $A passed to controller"
                    + " to be a SecureAura");
        }
    },

    testAuraLockerInHelper: {
        test: function(cmp) {
            var wrapped = cmp.helper.getWrappersFromHelper()["$A"];
            var wrapped = cmp.get("v.log")["$A"];
            $A.test.assertStartsWith("SecureAura", wrapped.toString(), "Expected $A passed to helper"
                    + " to be a SecureAura");
        }
    },

    testAuraLockerInRenderer: {
        test: function(cmp) {
            var wrapped = cmp.get("v.log")["$A"];
            $A.test.assertStartsWith("SecureAura", wrapped.toString(), "Expected component passed to renderer"
                    + " to be a SecureAura");
        }
    },

    testComponentLockerInController: {
        test: function(cmp) {
            cmp.getWrappersFromController();
            var wrapped = cmp.get("v.log")["cmp"];
            $A.test.assertStartsWith("SecureComponent", wrapped.toString(), "Expected component passed to controller"
                    + " to be a SecureComponent");
        }
    },

    testComponentLockerInRenderer: {
        test: function(cmp) {
            var wrapped = cmp.get("v.log")["cmp"];
            $A.test.assertStartsWith("SecureComponent", wrapped.toString(), "Expected component passed to renderer"
                    + " to be a SecureComponent");
        }
    },

    testDocumentLockerInController: {
        test: function(cmp) {
            cmp.getWrappersFromController();
            var wrapped = cmp.get("v.log")["document"];
            $A.test.assertStartsWith("SecureDocument", wrapped.toString(), "Expected document passed to controller"
                    + " to be a SecureDocument");
        }
    },

    testDocumentLockerInHelper: {
        test: function(cmp) {
            var wrapped = cmp.helper.getWrappersFromHelper()["document"];
            $A.test.assertStartsWith("SecureDocument", wrapped.toString(), "Expected document passed to helper"
                    + " to be a SecureDocument");
        }
    },

    testDocumentLockerInRenderer: {
        test: function(cmp) {
            var wrapped = cmp.get("v.log")["document"];
            $A.test.assertStartsWith("SecureDocument", wrapped.toString(), "Expected document accessed from renderer"
                    + " to be a SecureDocument");
        }
    },

    testWindowLockerInController: {
        test: function(cmp) {
            cmp.getWrappersFromController();
            var wrapped = cmp.get("v.log")["window"];
            $A.test.assertStartsWith("SecureWindow", wrapped.toString(), "Expected window passed to controller"
                    + " to be a SecureWindow");
        }
    },

    testWindowLockerInHelper: {
        test: function(cmp) {
            var wrapped = cmp.helper.getWrappersFromHelper()["window"];
            $A.test.assertStartsWith("SecureWindow", wrapped.toString(), "Expected window passed to helper"
                    + " to be a SecureWindow");
        }
    },

    testWindowLockerInRenderer: {
        test: function(cmp) {
            var wrapped = cmp.get("v.log")["window"];
            $A.test.assertStartsWith("SecureWindow", wrapped.toString(), "Expected window accessed from renderer"
                    + " to be a SecureWindow");
        }
    },

    testSecureElementFrozenAfterCreation_DynamicallyCreated: {
        test: function(cmp) {
            cmp.helper.getSecureElementDynamically(cmp);
            var div = cmp.get("v.log");
            this.doTestSecureElementFrozenAfterCreation(div);
        }
    },

    testSecureElementFrozenAfterCreation_FromMarkup: {
        test: function(cmp) {
            cmp.getSecureElementFromMarkup();
            var div = cmp.get("v.log");
            this.doTestSecureElementFrozenAfterCreation(div);
        }
    },

    doTestSecureElementFrozenAfterCreation : function(div) {
        $A.test.assertStartsWith("SecureElement", div.toString(), "Unexpected object returned from helper");
        $A.test.assertTrue(Object.isFrozen(div), "SecureElement should be frozen");

        div.onclick = function(event) {};
        $A.test.assertUndefined(div.onclick, "Should not be able to define a property on SecureElement");

        try {
            Object.defineProperty(div, "onclick", {});
            $A.test.fail("Should not be able to define a new property via Object.defineProperty on SecureElement");
        } catch(e) {
            if (e.toString().indexOf("TypeError: Cannot define property:onclick, object is not extensible") < 0) {
                $A.test.fail("Unexpected exception: " + e.toString());
            }
        }
        $A.test.assertUndefined(div.onclick, "Should not be able to define a property on SecureElement");

        div.className = "fancypants";
        delete div.className;
        $A.test.assertEquals("fancypants", div.className, "Attemping to delete a property on the frozen SecureElement"
                + " should be a no-op");
    },

    testAppendDynamicallyCreatedDivToMarkup: {
        test: function(cmp) {
            cmp.appendDiv();
            var div = cmp.find("content").getElement();
            var appendedDiv = div.getElementsByTagName("div")[0];
            $A.test.assertEquals("myId", appendedDiv.id);
            $A.test.assertEquals("fancypants", appendedDiv.className);
        }
    },

    testAttemptToEvalToWindow: {
        test: function(cmp) {
        	cmp.testEvalBlocking($A.test);

        	// DCHASMAN TOOD Port these to cmp.testEvalBlocking()

            // eval attempts that result in an error
            /*try {
                var symbol = "toString.constructor.prototype";
                cmp.testSymbol(symbol);
                $A.test.fail("eval'ing [" + symbol + "] should throw an error");
            } catch(e) {
                var error = e.toString();
                $A.test.assertStartsWith("TypeError: Cannot read property 'constructor' of undefined", error);
            }

            try {
                var symbol = "''.substring.call.call(({})[\"constructor\"].getOwnPropertyDescriptor(''.substring.__pro"
                    + "to__, \"constructor\").value, null, \"return this;\")()"
                cmp.testSymbol(symbol);
                $A.test.fail("eval'ing [" + symbol + "] should throw an error");
            } catch(e) {
                var error = e.toString();
                $A.test.assertStartsWith("Error: Security violation: use of __proto__", error);
            }*/
        }
    }
})
