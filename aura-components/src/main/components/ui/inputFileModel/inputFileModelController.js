({
    init : function (cmp, event, helper) {
        helper.setDefaultModelProps(cmp);
    },
    openDialog : function (cmp, event, helper) {
        var inputFileElement = cmp.get('v.model').inputFileElement;
        inputFileElement.click();
    }
})