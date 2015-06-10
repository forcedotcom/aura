({
    resetCounters:function(cmp, _testName){
        var a = cmp.get('c.resetCounter');
        a.setParams({
            testName: _testName
        }),
        a.setExclusive();
        $A.test.enqueueAction(a);
    },

    executeAction:function(cmp, actionName, actionParam, additionalProperties, extraCallback){
        var a = cmp.get(actionName);
        var that = this;
        if(actionParam) a.setParams(actionParam);
        a.setCallback(cmp, function(a){
            var returnValue = a.getReturnValue();
            that.findAndSetText(cmp, "staticCounter", returnValue.Counter); 
            that.findAndSetText(cmp, "responseData", returnValue.Data);
            that.findAndSetText(cmp, "isFromStorage", a.isFromStorage());
            that.findAndSetText(cmp, "callbackCounter", parseInt(cmp.find("callbackCounter").getElement().innerHTML,10)+1);
            if (extraCallback) {
                extraCallback(a);
            }
        });
        if(additionalProperties){
            additionalProperties(a);
        }
        $A.enqueueAction(a);
        return a;
    },

    findAndSetText:function(cmp, targetCmpId, msg){
        cmp.find(targetCmpId).getElement().innerHTML = msg;
    }
})
