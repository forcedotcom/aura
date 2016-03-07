({
    setElementOverStyleClass : function (cmp) {
        this.setDropZoneClassList(cmp,['drag-over',cmp.get('v.classOver')]);
    },
    removeElementOverStyleClass : function (cmp) {
        this.setDropZoneClassList(cmp);
    },
    setDropZoneClassList : function (cmp, obj) {
        var classnames = this.lib.classnames;
        var classAttr  = cmp.get('v.class');
        cmp.set('v.dropZoneClassList',classnames.ObjectToString({
            'droppable-zone' : true
        }, classAttr, obj));
    },
    thereAreFiles : function (dragEvent) {
        return dragEvent.dataTransfer.files.length > 0;
    },
    filesAreValid : function (cmp, event) {
        return this.meetsMultipleConditions(cmp,event) &&
               this.meetsAcceptAndSizeConditions(cmp, event);
    },
    meetsMultipleConditions : function (cmp, event) {
        var multiple = cmp.get('v.multiple');
        return multiple ? multiple : event.dataTransfer.files.length === 1;
    },
    meetsAcceptAndSizeConditions : function (cmp, event) {
        var ContentType = this.ct.contentType;
        var accept = cmp.get('v.accept');
        var size   = Number(cmp.get('v.maxSizeAllowed')) || Infinity;
        var myContentType = new ContentType(accept);
        return  this._getFileArr(event).every(function (file) {
            return myContentType.accept(file) && this._fileMeetsSize(file,size);
        }.bind(this));
    },
    _getFileArr : function (dragEvent) {
        return Object.keys(dragEvent.dataTransfer.files).map(function (index) {
            return dragEvent.dataTransfer.files[index];
        });
    },
    _fileMeetsSize : function (file, size) {
        return file.size <= size;
    },
    fireDropEvent : function (cmp, event) {
        cmp.getEvent('change').setParams({
            files : event.dataTransfer.files
        }).fire();
    }
});