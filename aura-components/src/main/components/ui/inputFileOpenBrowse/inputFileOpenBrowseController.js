({
    init : function (cmp, event, helper) {
        helper.createHTMLElement(cmp);
    },
    handleOpenClick : function (cmp,event, helper) {
        cmp.get('v.inputFileHtmlElement').click();
    }
})