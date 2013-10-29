({
    render: function(cmp) {
        var gvp = $A.getGlobalValueProviders();

        gvp.setValue("$Label.Related_Lists.task_mode_today", cmp.getValue("v.simplevalue1"));
        gvp.setValue("$Label.DOESNT.EXIST", cmp.getValue("v.simplevalue2"));
        gvp.setValue("$Label.Related_Lists.DOESNTEXIST", cmp.getValue("v.simplevalue3"));

        // Both section and name are required. This request will return undefined and no action is requested.
        gvp.getValue("$Label.DOESNTEXIST", cmp);

        // These requests are here to test that there are no multiple action requests for the same $Label
        // See LabelValueProviderUITest.java
        gvp.getValue("$Label.Related_Lists.task_mode_today", cmp);
        gvp.getValue("$Label.Related_Lists.task_mode_today", cmp);
        gvp.getValue("$Label.Related_Lists.task_mode_today", cmp);
        gvp.getValue("$Label.Related_Lists.task_mode_today", cmp);
        gvp.getValue("$Label.Related_Lists.task_mode_today", cmp);

        return this.superRender();
    }
})