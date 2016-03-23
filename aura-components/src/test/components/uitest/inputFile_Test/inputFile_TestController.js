({
    handleChange : function (cmp, event, helper) {
        cmp.set('v.count',cmp.get('v.count') + 1);
        cmp.set('v.lastChangeEvent', event);
    },
    clear : function (cmp, event, helper) {
        cmp.find('inputFile').reset();
    }
})