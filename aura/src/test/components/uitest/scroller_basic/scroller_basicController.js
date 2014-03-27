({
	init: function (component, event, helper) {
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    },
    
    fetchDataPTR : function(component, callback, helper) {
        var result,
        	dom,
        	act = component.get("c.getItems"),
        	actionCallback = function(action){
        		
            	if (action.getState() === "SUCCESS") {
            		result = action.getReturnValue();
            		dom = helper.makeDOM(result, "onPTR");
            		$A.log(result);
            		callback(null, dom);
            	}
            	else {
                    $A.log("Fail: " + action.getError()[0].message);
                }
            };
        
        act.setParams({"size":2});
        act.setCallback(component, actionCallback);
        
        $A.enqueueAction(act);
    },

    fetchDataPTL : function(component, callback, helper) {
        var result,
        	dom,
        	act = component.get("c.getItems"),
        	actionCallback = function(action){
        		
            	if (action.getState() === "SUCCESS") {
            		result = action.getReturnValue();
            		dom = helper.makeDOM(result, "onPTL");
            		$A.log(result);
            		callback(null, dom);
            	}
            	else {
                    $A.log("Fail: " + action.getError()[0].message);
                }
            };
        
        act.setParams({"size":4});
        act.setCallback(component, actionCallback);
        
        $A.enqueueAction(act);
    },
    
    beforeScrollStartHandler: function(component, event, helper){
    	$A.log("Executed fn beforeScrollStartHandler..");
    },
    
    scrollStartHandler: function(component, event, helper){
    	$A.log("Executed fn scrollStartHandler..");
    },
    
    scrollEndHandler: function(component, event, helper){
    	$A.log("Executed fn scrollEndHandler..");
    },
    
    scrollMoveHandler: function(component, event, helper){
    	$A.log("Executed fn scrollMoveHandler..");
    }
    
})