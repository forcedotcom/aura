({
    render: function(cmp) {
        cmp.getValue("v.simplevalue1").setValue($A.expressionService.getValue(cmp, "$Label" + ".Related_Lists" + ".task_mode_today"));
        cmp.getValue("v.simplevalue2").setValue($A.expressionService.getValue(cmp, "$Label.DOESNT.EXIST"));
        return this.superRender();
    }
})