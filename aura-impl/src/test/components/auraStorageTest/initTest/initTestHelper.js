({
	resetCounters:function(cmp, _testName){
		var a = cmp.get('c.resetCounter');
		a.setParams({
			testName: _testName
		}),
		a.setExclusive();
		a.runAfter(a);
	},
	executeAction:function(cmp, actionName, actionParam, callback, additionalProperties){
		var a = cmp.get(actionName);
		if(actionParam) a.setParams(actionParam);
		a.setCallback(cmp, callback);
		if(additionalProperties){
			additionalProperties(a);
		}
		a.runAfter(a);
	}
})