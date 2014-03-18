({
	init: function (component, event, helper) {
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    },
    
    fetchData : function(component, callback, helper) {
        var result,
        	dataSize = (Math.floor(Math.random() * (2 - 0 + 1)) + 0),
        	act = component.get("c.getItems"),
        	actionCallback = function(action){
        		var dom = [],
        			divItem;
            	if (action.getState() === "SUCCESS") {
            		result = action.getReturnValue();
            		if(result == null){
            			dom = [];//fails if dom=[] gives gack on the UI
            		}
            		for(var i in result){
            			divItem = document.createElement('div');
            			divItem.textContent = result[i].label;
            			divItem.id = result[i].value;
            			divItem.className = "item";
            	    	dom.push(divItem);
            		}
            		$A.log(result);
            		callback(null, dom);
            	}
            	else {
                    $A.log("Fail: " + action.getError()[0].message);
                }
            };
        //debugger;
        act.setParams({"size":dataSize});
        act.setCallback(component, actionCallback);
        $A.run(function(){
        	$A.enqueueAction(act);
        });
    }
})