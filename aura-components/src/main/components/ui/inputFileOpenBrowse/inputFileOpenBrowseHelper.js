({
    createHTMLElement : function (cmp) {
        cmp.set('v.inputFileHtmlElement',this.createInputFileElementAndSetListener(cmp));
    },
    createInputFileElementAndSetListener : function (cmp) {
        var fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('multiple', cmp.get('v.multiple'));
        fileSelector.setAttribute('accept',   cmp.get('v.accept'));

        // setting listen input change event
        setTimeout(function () {
            fileSelector.addEventListener('change', this.handleChangeEvent.bind(this,cmp));
        }.bind(this),0);

        return fileSelector;
    },
    handleChangeEvent : function (cmp, event) {
        var files = event.target.files;

        if (this._meetsSizeConditions(cmp, files)) {
            cmp.getEvent('change').setParams({
                files: files
            }).fire();
        }
    },
    _meetsSizeConditions : function (cmp, files) {
        var size = cmp.get('v.maxSizeAllowed') || Infinity;
        return this._getFilesArr(files).every(function (file) {
            return file.size <= size;
        })
    },
    _getFilesArr : function (files) {
        return Object.keys(files).map(function (index) {
            return files[index];
        })
    }
})