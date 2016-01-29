({
    afterRender : function (cmp, helper) {
        var element = helper.getInputElement(cmp);
        this.superAfterRender();
        $A.util.on(element,'focus', function () {
            helper.removeErrors(cmp);
        })
    }
})