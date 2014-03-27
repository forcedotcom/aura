({
    render: function(cmp) {
        var gvp = $A.getGlobalValueProviders();

        cmp.set("v.simplevalue1", gvp.getValue("$Label" + ".Related_Lists" + ".task_mode_today", cmp));
        cmp.set("v.simplevalue2", gvp.getValue("$Label.DOESNT.EXIST", cmp));
        cmp.set("v.simplevalue3", gvp.getValue("$Label.Related_Lists.DOESNTEXIST", cmp));

        // Both section and name are required. This request will return undefined and no action is requested.
        cmp.set("v.simplevalue4", gvp.getValue("$Label.DOESNTEXIST", cmp));

        // These requests are here to test that there are no multiple action requests for the same $Label
        // See LabelValueProviderUITest.java
        var tmt = gvp.getValue("$Label.Related_Lists.task_mode_today", cmp);
        tmt = gvp.getValue("$Label.Related_Lists.task_mode_today", cmp);
        tmt = gvp.getValue("$Label.Related_Lists.task_mode_today", cmp);
        tmt = gvp.getValue("$Label.Related_Lists.task_mode_today", cmp);
        tmt = gvp.getValue("$Label.Related_Lists.task_mode_today", cmp);

        return this.superRender();
    }
})