({
	
	forceActionAtServer: function(cmp, evt, helper){
		var _testName = cmp._testName;
		var actionName = "c.fetchDataRecord";
		var param = {
			testName: (!_testName?"fetchCounterValue":_testName)
		};
		helper.executeAction(cmp, actionName, param);
	}, 
	runActionAtServerAndStore:function(cmp, evt, helper){
		var _testName = cmp._testName;
		var actionName = "c.fetchDataRecord";
		var param = {
				testName: (!_testName?"fetchCounterValue":_testName)
		};
		var additionalProperties = function(a){
			a.setStoreable();
		}
		helper.executeAction(cmp, actionName, param, additionalProperties);
	},
	fetchActionFromStorage:function(cmp,evt,helper){
		var _testName = cmp._testName;
		var actionName = "c.fetchDataRecord";
		var param = {
				testName: (!_testName?"fetchCounterValue":_testName)
		};
		var additionalProperties = function(a){
			a.setStoreable({"ignoreExisting":false,"refresh":5});
		}
		helper.executeAction(cmp, actionName, param, additionalProperties);
	},
	resetCounters:function(cmp, evt, helper){
		helper.resetCounters(cmp);
	},
	waiting:function(cmp, evt, helper){
		helper.findAndSetText(cmp, "waiting", "waiting"); 
		helper.findAndSetText(cmp, "doneWaiting", "");
	},
	doneWaiting:function(cmp, evt, helper){
		helper.findAndSetText(cmp, "waiting", ""); 
		helper.findAndSetText(cmp, "doneWaiting", "doneWaiting");
	},
	refreshBegin:function(cmp, evt, helper){
		helper.findAndSetText(cmp, "refreshBegin", "refreshBegin"); 
		helper.findAndSetText(cmp, "refreshEnd", "");
	},
	refreshEnd:function(cmp, evt, helper){
		helper.findAndSetText(cmp, "refreshBegin", ""); 
		helper.findAndSetText(cmp, "refreshEnd", "refreshEnd");
	},
	storageModified:function(cmp, evt, helper){
		helper.findAndSetText(cmp, "storageModified", new Date().getTime());
	}
})