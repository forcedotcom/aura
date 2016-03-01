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
               this.meetsAcceptConditions(cmp, event);
    },
    meetsMultipleConditions : function (cmp, event) {
        var multiple = cmp.get('v.multiple');
        return multiple ? multiple : event.dataTransfer.files.length === 1;
    },
    meetsAcceptConditions : function (cmp, event) {
        var accept = cmp.get('v.accept');

    },
    fireDropEvent : function (cmp, event) {
        debugger;
    }
})