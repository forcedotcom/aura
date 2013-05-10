({
    render: function(cmp) {
        var gvp = $A.getGlobalValueProviders();

        cmp.getValue("v.simplevalue1").setValue(gvp.getValue("$Label" + ".Related_Lists" + ".task_mode_today", cmp));
        cmp.getValue("v.simplevalue2").setValue(gvp.getValue("$Label.DOESNT.EXIST", cmp));
        cmp.getValue("v.simplevalue3").setValue(gvp.getValue("$Label.Related_Lists.DOESNTEXIST", cmp));
        cmp.getValue("v.simplevalue4").setValue(gvp.getValue("$Label.DOESNTEXIST", cmp));
        return this.superRender();
    }
})