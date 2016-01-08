({
    render : function(cmp, helper) {
        var ret = cmp.superRender();
        var log = {
                'cmp': cmp,
                'helper': helper,
                'document': document,
                'window': window,
                '$A': $A
        };
        cmp.set("v.log", log);
        return ret;
    }
})