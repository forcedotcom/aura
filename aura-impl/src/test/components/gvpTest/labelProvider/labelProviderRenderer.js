({
    render: function(cmp) {
        var gvp = $A.getGlobalValueProviders();

        cmp.getValue("v.simplevalue1").setValue(gvp.getValue("$Label" + ".Related_Lists" + ".task_mode_today", cmp));
        cmp.getValue("v.simplevalue2").setValue(gvp.getValue("$Label.DOESNT.EXIST", cmp));
        cmp.getValue("v.simplevalue3").setValue(gvp.getValue("$Label.Related_Lists.DOESNTEXIST", cmp));

        // Both section and name are required. This request will return undefined and no action is requested.
        cmp.getValue("v.simplevalue4").setValue(gvp.getValue("$Label.DOESNTEXIST", cmp));

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