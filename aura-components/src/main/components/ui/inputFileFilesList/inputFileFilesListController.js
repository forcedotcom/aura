({
    mapFilesToArray : function (cmp, event, helper) {
        var files = cmp.get('v.files');
        var mappedFiles = Object.keys(files).map(function (index) {
            return files[index];
        });
        cmp.set('v.filesArr', mappedFiles);
    }
})