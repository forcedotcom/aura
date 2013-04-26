({
    render: function(cmp) {
        cmp.getValue("v.simplevalue1").setValue($A.labelValueProvider.getValue("$Label" + ".Related_Lists" + ".task_mode_today", cmp));
        cmp.getValue("v.simplevalue2").setValue($A.labelValueProvider.getValue("$Label.DOESNT.EXIST", cmp));
        cmp.getValue("v.simplevalue3").setValue($A.labelValueProvider.getValue("$Label.Related_Lists.DOESNTEXIST", cmp));
        return this.superRender();
    }
})