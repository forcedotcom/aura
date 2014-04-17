({
    render: function(cmp) {
        cmp.set("v.simplevalue1", $A.get("$Label" + ".Related_Lists" + ".task_mode_today"));
        cmp.set("v.simplevalue2", $A.get("$Label.DOESNT.EXIST"));
        cmp.set("v.simplevalue3", $A.get("$Label.Related_Lists.DOESNTEXIST"));

        // Both section and name are required. This request will return undefined and no action is requested.
        cmp.set("v.simplevalue4", $A.get("$Label.DOESNTEXIST"));

        // These requests are here to test that there are no multiple action requests for the same $Label
        // See LabelValueProviderUITest.java
        var tmt = $A.get("$Label.Related_Lists.task_mode_today");
        tmt = $A.get("$Label.Related_Lists.task_mode_today");
        tmt = $A.get("$Label.Related_Lists.task_mode_today");
        tmt = $A.get("$Label.Related_Lists.task_mode_today");
        tmt = $A.get("$Label.Related_Lists.task_mode_today");

        return this.superRender();
    }
})