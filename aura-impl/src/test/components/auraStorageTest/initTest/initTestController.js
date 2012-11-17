({
	
	forceActionAtServer: function(cmp, evt, helper){
		var _testName = cmp._testName;
		var actionName = 'c.fetchDataRecord';
		var param = {
			testName: (!_testName?'fetchCounterValue':_testName)
		};
		var actionCallback =function(a){
			var returnValue = a.getReturnValue();
			cmp.find("staticCounter").getElement().innerHTML = returnValue.Counter;
			cmp.find("responseData").getElement().innerHTML = returnValue.Data;
			cmp.find("isFromStorage").getElement().innerHTML = a.isFromStorage();
		};
		helper.executeAction(cmp, actionName, param, actionCallback);
	}, 
	runActionAtServerAndStore:function(cmp, evt, helper){
		var _testName = cmp._testName;
		var actionName = 'c.fetchDataRecord';
		var param = {
				testName: (!_testName?'fetchCounterValue':_testName)
		};
		var actionCallback = function(a){
			var returnValue = a.getReturnValue();
			cmp.find("staticCounter").getElement().innerHTML = returnValue.Counter;
			cmp.find("responseData").getElement().innerHTML = returnValue.Data;
			cmp.find("isFromStorage").getElement().innerHTML = a.isFromStorage();
		};
		var additionalProperties = function(a){
			a.setStoreable();
		}
		helper.executeAction(cmp, actionName, param, actionCallback, additionalProperties);
	},
	fetchActionFromStorage:function(cmp,evt,helper){
		var _testName = cmp._testName;
		var actionName = 'c.fetchDataRecord';
		var param = {
				testName: (!_testName?'fetchCounterValue':_testName)
		};
		var actionCallback = function(a){
			var returnValue = a.getReturnValue();
			cmp.find("staticCounter").getElement().innerHTML = returnValue.Counter;
			cmp.find("responseData").getElement().innerHTML = returnValue.Data;
			cmp.find("isFromStorage").getElement().innerHTML = a.isFromStorage();
		};
		var additionalProperties = function(a){
			a.setStoreable({"ignoreExisting":false,"refresh":5});
		}
		helper.executeAction(cmp, actionName, param, actionCallback, additionalProperties);
	},
	resetCounters:function(cmp, evt, helper){
		helper.resetCounters(cmp);
	},
	waiting:function(cmp){
		cmp.find('waiting').getElement().innerHTML = 'waiting';
		cmp.find('doneWaiting').getElement().innerHTML = '';
	},
	doneWaiting:function(cmp){
		cmp.find('waiting').getElement().innerHTML = '';
		cmp.find('doneWaiting').getElement().innerHTML = 'doneWaiting';
	},
	refreshBegin:function(cmp){
		cmp.find('refreshBegin').getElement().innerHTML = 'refreshBegin';
		cmp.find('refreshEnd').getElement().innerHTML = '';
	},
	refreshEnd:function(cmp){
		cmp.find('refreshBegin').getElement().innerHTML = '';
		cmp.find('refreshEnd').getElement().innerHTML = 'refreshEnd';
	},
	storageModified:function(cmp){
		cmp.find('storageModified').getElement().innerHTML = new Date().getTime();
	}
})