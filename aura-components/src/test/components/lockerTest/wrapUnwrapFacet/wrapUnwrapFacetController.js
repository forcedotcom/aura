({
    setValues : function(cmp, event, helper) {
        // This call to get() prior to setting values is necessary to repro the original issue
        var obj = cmp.get('v.obj');
        cmp.set('v.value1', 'Value 1');
        cmp.set('v.value2', 'Value 2'); 
        obj = cmp.get('v.obj');
        obj.value3 = 'Value 3';
        cmp.set('v.obj', obj);
    }
})