({
    testAsyncLabelProvider: {
        test: function(cmp) {

            var a = cmp.get("c.updateLabel");
            a.run();
            $A.eventService.finishFiring();

            $A.test.addWaitFor(
                false,
                $A.test.isActionPending,
                function(){
                    $A.test.assertEquals("Today", cmp.get("v.text"), "Failed to get Label");
                }
            );
        }
    }
})