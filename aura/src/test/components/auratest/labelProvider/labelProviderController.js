({
    updateLabel: function(cmp, helper) {
        var action = $A.get("c.aura://LabelController.getLabel");

        action.setParams({
            name: "task_mode_today",
            section: "bob"
        });

        action.setCallback(this, function(a){

            var textAttr = cmp.getValue("v.text");

            if(a.getState()  ) {
                var value = a.getReturnValue();
                textAttr.setValue(value);
            } else {
                textAttr.setValue("Missing $Label");
            }

        });

        action.runAfter(action);
    }
,

testLabel: function(cmp, helper) {
	cmp.getValue("v.sv").setValue($A.expressionService.getValue(cmp,"$Label" + ".bob" + ".task_mode_today"));
	}
})