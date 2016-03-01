({
    handleOpenBrowseChange : function (cmp, event, helper) {
        var files = event.getParam('files');
        cmp.set('v.files', files);
    }
})