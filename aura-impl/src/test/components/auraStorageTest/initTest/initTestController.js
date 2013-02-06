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
			a.setStorable();
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
			a.setStorable({"ignoreExisting":false,"refresh":5});
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
	},
    setHost : function(component, event, helper) {
        $A.clientService.initHost(component.get("v.host"));
    },
    testConnection: function(component, event, helper) {
        component.getValue("v.actionStatus").setValue("");
        var a = component.get("c.getInt");
        a.setParams({ param : 66 });
        a.setCallback(this, function(action){
            component.getValue("v.actionStatus").setValue(action.getState());
        });
        a.runAfter(a);
    },
})