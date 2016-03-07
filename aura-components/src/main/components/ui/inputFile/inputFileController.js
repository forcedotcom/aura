({
    handleChange : function (cmp, event, helper) {
        var files = event.getParam('files');
        helper.updateInputFile(cmp,files);
        helper.updateFilesAttr(cmp,files);
    }
})