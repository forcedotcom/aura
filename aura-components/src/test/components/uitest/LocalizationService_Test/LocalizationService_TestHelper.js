({
    verifyDateAndTime: function(component,testCmpId,expected) {
        var testCmp = component.find(testCmpId);
        $A.test.assertNotNull(testCmp);
        $A.test.addWaitFor(true,
            function() {
                return ($A.test.getText(testCmp.find('span').getElement()).length > 0);
            },
            function() {
                var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
                $A.test.assertEquals(expected,outputDateStr,"get unexpected testDaylightSavingTime for "+testCmpId);
            } );
     }
})
