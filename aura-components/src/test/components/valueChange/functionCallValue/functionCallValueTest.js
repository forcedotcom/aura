({

    testBooleanTypeFunctionCallValue: {
        test: function(cmp) {
            // changing the value
            cmp.set("v.color", "red");

            var targetComponent = cmp.find("booleanValueConsumer");
            var result = targetComponent.get("v.result");

            $A.test.assertFalse(result["oldValue"], "The old value from valueChange event should be false");
            $A.test.assertTrue(result["newValue"], "The new value from valueChange event should be true");
        }
    },

    testStringTypeFunctionCallValue: {
        test: function(cmp) {
            // changing the value
            cmp.set("v.color", "red");

            var targetComponent = cmp.find("stringValueConsumer");
            var result = targetComponent.get("v.result");

            $A.test.assertEquals("color: blue", result["oldValue"], "Found unexpected old value from valueChange event");
            $A.test.assertEquals("color: red", result["newValue"], "Found unexpected new value from valueChange event");
        }
    },

    testNumberTypeFunctionCallValue: {
        test: function(cmp) {
            // changing the value
            cmp.set("v.counter", 5);

            var targetComponent = cmp.find("numberValueConsumer");
            var result = targetComponent.get("v.result");

            $A.test.assertEquals(1, result["oldValue"], "Found unexpected old value from valueChange event");
            $A.test.assertEquals(6, result["newValue"], "Found unexpected new value from valueChange event");
        }
    }
})
