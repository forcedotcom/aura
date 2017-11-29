({
    /**
     * Verify that finding after moving the attribute value provider for a component does not return a blank element.
     * 1. Find all the "div" components on the page.
     * 2. move the attribute value provider for one of the divs
     * 3. Destory the div we just moved the value provider for. 
     * 4. Find all the divs again, verify that since we moved value providers, the component get removed from the index and was not attempted to be returned as null
     */
    testFindReturningNullsAfterSetAttributeValueProvider:{
        test:[
            function(cmp){
                var output = cmp.find("output");
                var actual;

                // Find by localId
                var divs = cmp.find("div");
                // De-index so it gets cleaned up properly.
                cmp.deIndex(divs[0].getLocalId(), divs[0].getGlobalId());
                divs[0].setAttributeValueProvider(output);
                divs[0].destroy();
                actual = cmp.find("div");

                $A.test.assertTrue($A.util.isComponent(actual[0]), "First component should be a component.");
                $A.test.assertEquals(1, actual.length, "Too many components were returned");
            }
        ]
    },

    /**
     * Verify that after moving the valueProvider for a component, you can cmp.find() on the new value provider and find the component.
     * 1. Find all the "div" components on the page.
     * 2. move the attribute value provider for one of the divs
     * 3. Find the div on the new valueProvider, since its indexed against this new valueProvider, we should be able to find it.
     * 4. Assert we found a div.
     */
    testFindAfterSetAttributeValueProviderOnNewValueProvider:{
        test:[
            function(cmp){
                var output = cmp.find("output");
                var actual;

                // Find by localId
                var divs = cmp.find("div");
                divs[0].setAttributeValueProvider(output);
                actual = output.find("div");

                $A.test.assertTrue($A.util.isComponent(actual), "First component should be a component.");
            }
        ]
    },

    /**
     * Verify that after moving the valueProvider for a component, you can cmp.find() on the new value provider and find the component.
     * In particular trying to verify within PassthroughValues we still are indexing correctly.
     * 1. Find all the "div" components on the page.
     * 2. move the attribute value provider for one of the divs
     * 3. Find the div on the new valueProvider, since its indexed against this new valueProvider, we should be able to find it.
     * 4. Assert we found a div.
     */
    testFindAfterSetAttributeValueProviderOnNewValueProviderInAnIteration:{
        test:[
            function(cmp){
                var output = cmp.find("output2");
                var actual;

                // Find by localId
                var div = cmp.find("div2");
                div.setAttributeValueProvider(output);
                actual = output.find("div2");

                $A.test.assertTrue($A.util.isComponent(actual), "First component should be a component.");
            }
        ]
    }
})