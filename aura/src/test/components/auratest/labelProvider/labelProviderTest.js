({
    testAsyncLabelProvider: {
        test: function(cmp) {

            var action = $A.get("c.aura://LabelController.getLabel");

            action.setParams({
                name: "task_mode_today",
                section: "bob"
            });

            $A.log(action);

            action.setCallback(this, function(a){
                var value = a.getReturnValue();
                $A.test.assertEquals(value, "Today", "$Label.*.task_mode_today should be 'Today' for en_US");
            });

            $A.test.callServerAction(action);
        }
    }
})