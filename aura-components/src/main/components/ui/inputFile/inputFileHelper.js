({
    updateInputFile : function (cmp, files) {
        cmp.getElement('input.hidden-input-file').files = files;
    },
    updateFilesAttr : function (cmp, files) {
        cmp.set('v.files', files);
    }
})