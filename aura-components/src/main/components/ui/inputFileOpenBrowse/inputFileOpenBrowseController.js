({
    init : function (cmp, event, helper) {
        helper.createHTMLElement(cmp);
    },
    handleOpenClick : function (cmp) {
        cmp.get('v.inputFileHtmlElement').click();
    }
});