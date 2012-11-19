({
	resetCounters:function(cmp, _testName){
		var a = cmp.get('c.resetCounter');
		a.setParams({
			testName: _testName
		}),
		a.setExclusive();
		a.runAfter(a);
	},
	executeAction:function(cmp, actionName, actionParam, additionalProperties){
		var a = cmp.get(actionName);
		if(actionParam) a.setParams(actionParam);
		a.setCallback(cmp, function(a){
			var returnValue = a.getReturnValue();
			cmp.getDef().getHelper().findAndSetText(cmp, "staticCounter", returnValue.Counter); 
			cmp.getDef().getHelper().findAndSetText(cmp, "responseData", returnValue.Data);
			cmp.getDef().getHelper().findAndSetText(cmp, "isFromStorage", a.isFromStorage());
		});
		if(additionalProperties){
			additionalProperties(a);
		}
		a.runAfter(a);
	},
	findAndSetText:function(cmp, targetCmpId, msg){
		cmp.find(targetCmpId).getElement().innerHTML = msg;
	}
})