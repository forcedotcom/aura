({
    testCallingHelperFromTestFunction: {
        test: function(cmp) {
            var expected = "Message from Helper Method";
            var actual = cmp.helper.getMessage();

            $A.test.assertEquals(expected, actual);
        }
    },

    testCallingHelperMethodInController: {
        test: function(cmp) {
            var expected = "Message from Helper Method";
            cmp.updateWithMessageFromHelper();

            var actual = cmp.get("v.message");
            $A.test.assertEquals(expected, actual);
        }
    },

    testCallingHelperMethodWithArgument: {
        test: function(cmp) {
            var expected = "Message from Helper Method Argument";
            cmp.updateWithMessageFromHelper(expected);

            var actual = cmp.get("v.message");
            $A.test.assertEquals(expected, actual);
        }
    },

    testCallingInheritedHelperMethod: {
        test: function(cmp) {
            var expected = "Message From Super Component Helper Method";
            var actual = cmp.helper.getMessageFromSuperCmp();

            $A.test.assertEquals(expected, actual);
        }
    },

    testOverridenHelperMethod: {
        test:function(cmp) {
            var expected = "Awesome Message from Helper Method";
            var actual = cmp.helper.getAwesomeMessage();

            $A.test.assertEquals(expected, actual);
        }
    },

    testCallingMultiLevelInheritedHelperMethod: {
        test: function(cmp) {
            var expected = "Message From Super Super Component Helper Method";
            var actual = cmp.helper.getMessageFromSuperSuperCmp();

            $A.test.assertEquals(expected, actual);
        }
    },

    /*
     * Verify calling an inherited method which is overriden in super component.
     * getSuperAwesomeMessage() is defined in helperSuperSuper and also gets overriden
     * in helperSuper.
     */
    testCallingInheritedHelperMethodOverridenInSuperComponent: {
        test: function(cmp) {
            var expected = "Super Awesome Message from Super Component Helper Method";
            var actual = cmp.helper.getSuperAwesomeMessage();

            $A.test.assertEquals(expected, actual);
        }
    },

    testCallingHelperMethodInRender: {
        attributes: { callsHelperMethodInRender: true },
        test: function(cmp) {
            var expected = "Message from Helper Method";
            var actual = cmp.get("v.message");
            $A.test.assertEquals(expected, actual);
        }
    },

    testCallingHelperMethodInAfterRender: {
        attributes: { callsHelperMethodInAfterRender: true },
        test: function(cmp) {
            var expected = "Message from Helper Method";
            var actual = cmp.get("v.message");
            $A.test.assertEquals(expected, actual);
        }
    },

    testCallingHelperMethodInRerender: {
        attributes: { callsHelperMethodInRerender: true },
        test: function(cmp) {
            var expected = "Message from Helper Method";
            cmp.rerender();

            var actual = cmp.get("v.message");
            $A.test.assertEquals(expected, actual);
        }
    },

    testCallingHelperMethodInUnrender: {
        attributes: { callsHelperMethodInRerender: true },
        test: function(cmp) {
            var expected = "Message from Helper Method";
            cmp.unrender();

            var actual = cmp.get("v.message");
            $A.test.assertEquals(expected, actual);
        }
    },

    testCallingContainedCmpHelperMethod: {
        test: function(cmp) {
            var expected = "Message from Contained Component";
            var targetComponent = cmp.find("containedCmp");

            var actual = targetComponent.helper.getMessage();
            $A.test.assertEquals(expected, actual);
        }
    }

})
