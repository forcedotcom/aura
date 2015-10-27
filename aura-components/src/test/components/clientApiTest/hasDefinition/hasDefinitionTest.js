({
    /*
     * Verify hasDefinition with short component descriptor returns true
     * when definition is on client
     */
    testHasComponentDefinitionWithShortDescriptor:{
        test: function(){
            var actual = $A.hasDefinition("aura:text");
            $A.test.assertTrue(actual);
        }
    },

    /*
     * Verify hasDefinition with full component descriptor returns true
     * when definition is on client
     */
    testHasComponentDefinitionWithFullDescriptor:{
        test: function(){
            var actual = $A.hasDefinition("markup://aura:text");
            $A.test.assertTrue(actual);
        }
    },

    /*
     * Verify hasDefinition with short event descriptor returns true
     * when definition is on client
     */
    testHasEventDefinitionWithShortDescriptor:{
        test: function(){
            var actual = $A.hasDefinition("e.aura:valueChange");
            $A.test.assertTrue(actual);
        }
    },

    /*
     * Verify hasDefinition with full event descriptor returns true
     * when definition is on client
     */
    testHasEventDefinitionWithFullDescriptor:{
        test: function(){
            var actual = $A.hasDefinition("markup://e.aura:valueChange");
            $A.test.assertTrue(actual);
        }
    },

    /*
     * Verify hasDefinition returns false when component definition is NOT on client
     */
    testHasDefinitionWhenComponentDefNotOnClient:{
        test: function(){
            var actual = $A.hasDefinition("ui:button");
            $A.test.assertFalse(actual);
        }
    },

    /*
     * Verify hasDefinition returns false when event definition is NOT on client
     */
    testHasDefinitionWhenEventDefNotOnClient:{
        test: function(){
            var actual = $A.hasDefinition("e.clientApiTest:getDefinitionTestEvent");
            $A.test.assertFalse(actual);
        }
    },

    /*
     * Verify hasDefinition returns false when component doesn't exist
     */
    testHasDefinitionWithUnkownComponent:{
        test: function(){
            var actual = $A.hasDefinition("unknown:unknown");
            $A.test.assertFalse(actual);
        }
    },

    /*
     * Verify hasDefinition returns false when event doesn't exist
     */
    testHasDefinitionWithUnkownEvent:{
        test: function(){
            var actual = $A.hasDefinition("e.unknown:unknown");
            $A.test.assertFalse(actual);
        }
    }
})
