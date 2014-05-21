({
	init: function (component, event, helper) {
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    },
    
    infiniteLoad : function(component, callback,helper) {
    	console.log("method called");
    	var result,
    	dom,
    	act = component.get("c.getItemsInfinite"),
    	actionCallback = function(action){
    		
        	if (action.getState() === "SUCCESS") {
        		result = action.getReturnValue();
        		dom = helper.makeDOM(result, "onINF");
        		$A.log(result);
        		callback(null, dom);
        	}
        	else {
                $A.log("Fail: " + action.getError()[0].message);
            }
        };
    
    act.setParams({"size":4});
    act.setCallback(component, actionCallback);
    $A.run(function () {
    $A.enqueueAction(act);
    });
}
})