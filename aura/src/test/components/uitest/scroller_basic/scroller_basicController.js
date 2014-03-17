({
	init: function (component, event, helper) {
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    },
    
    fetchData : function(component, callback, helper) {
        var result,
        	dataSize = (Math.floor(Math.random() * (2 - 0 + 1)) + 0),
        	act = component.get("c.getItems"),
        	actionCallback = function(action){
        		var dom = [];
            	if (action.getState() === "SUCCESS") {
            		result = action.getReturnValue();
            		if(result == null){
            			dom = null;//fails if dom=[] gives gack on the UI
            		}
            		for(var i in result){
            			li = document.createElement('li');
            	    	li.textContent = result[i].label;
            	    	li.id = result[i].value;
            	    	dom.push(li);
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