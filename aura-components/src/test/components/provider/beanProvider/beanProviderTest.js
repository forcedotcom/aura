({
    /**
     * Test case to verify bean providers will provide a simple component
     */
    testSimpleBeanProvider: {
        test: function(cmp) {
            var cmpName = cmp.getDef().getDescriptor().getQualifiedName();
            $A.test.assertEquals("markup://test:text", cmpName, "Bean provider did not provide expected component");
        }
    }
})
