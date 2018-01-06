({
    resetCounters : function(cmp, _testName) {
        var a = cmp.get('c.resetCounter');
        a.setParams({
            testName : _testName
        });
        $A.test.enqueueAction(a);
    },

    executeAction : function(cmp, actionName, actionParam, additionalProperties, extraCallback) {
        var a = cmp.get(actionName);
        var that = this;
        if (actionParam) {
            a.setParams(actionParam);
        }
        a.setCallback(cmp, function(a) {
            var returnValue = a.getReturnValue();
            that.findAndSetText(cmp, "staticCounter", returnValue.Counter);
            that.findAndSetText(cmp, "responseData", returnValue.Data);
            that.findAndSetText(cmp, "isFromStorage", a.isFromStorage());
            var callbackCounter = parseInt($A.util.getText(cmp.find("callbackCounter").getElement()), 10);
            that.findAndSetText(cmp, "callbackCounter", callbackCounter + 1);
            if (extraCallback) {
                extraCallback(a);
            }
        });
        if (additionalProperties) {
            additionalProperties(a);
        }
        $A.enqueueAction(a);
        return a;
    },

    findAndSetText : function(cmp, targetCmpId, msg) {
        $A.util.setText(cmp.find(targetCmpId).getElement(), msg);
    }
})
