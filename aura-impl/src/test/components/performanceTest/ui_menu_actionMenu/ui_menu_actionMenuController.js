
/**
 * UI Component test for ui:button
 * 
 * @author tina luo
 * 
 */
({
    updateTriggerLabel: function(cmp, event) {
        var triggerCmp = cmp.find("trigger");
        if (triggerCmp) {
            var source = event.getSource();
            var label = source.get("v.label");
            triggerCmp.setValue("v.label", label);
        }
    }
})
