({
    /**
     * Verify that finding after moving the attribute value provider for a component does not return a blank element.
     * 1. Find all the "div" components on the page.
     * 2. move the attribute value provider for one of the divs
     * 3. Destory the div we just moved the value provider for. 
     * 4. Find all the divs again, verify that since we moved value providers, the component get removed from the index and was not attempted to be returned as null
     */
    testFindAfterSetAttributeValueProvider:{
        test:[
            function(cmp){
                var output = cmp.find("output");
                var actual;

                // Find by localId
                var divs = cmp.find("div");
                divs[0].setAttributeValueProvider(output);
                divs[0].destroy();

                actual = cmp.find("div");

                $A.test.assertEquals(1, actual.length, "Too many components were returned");
                $A.test.assertTrue(!!actual[0], "First component should be a component.");
            }
        ]
    }
})