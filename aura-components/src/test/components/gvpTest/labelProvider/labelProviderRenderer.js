({
    render: function(cmp) {
        $A.get("$Label" + ".Related_Lists" + ".task_mode_today",function(value){cmp.set("v.simplevalue1",value)});
        $A.get("$Label" + ".DOESNT.EXIST",function(value){cmp.set("v.simplevalue2",value)});
        $A.get("$Label" + ".Related_Lists.DOESNTEXIST",function(value){cmp.set("v.simplevalue3",value)});
        // Both section and name are required. This request will return undefined and no action is requested.
        $A.get("$Label.DOESNTEXIST",function(value){cmp.set("v.simplevalue4",value)});

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
