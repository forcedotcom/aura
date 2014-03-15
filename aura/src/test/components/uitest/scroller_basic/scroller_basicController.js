({
	init: function (component, event, helper) {
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    },
    
    fetchData : function(component, callback, helper) {
        var result,
        	act = component.get("c.getItems");
        	var foo=function(action){
            	if (action.getState() === "SUCCESS") {
            		result = action.getReturnValue();
            		$A.log(result);
            		var timestamp = new Date().getTime();
            		callback(null,"<p>some data from server</p> "+timestamp);
            	}
            	else {
                    $A.log("Fail: " + action.getError()[0].message);
                }
            }
        	
        act.setParams({'keyboard':""});
        act.setCallback(component, foo);
        $A.run(function(){
        	$A.enqueueAction(act);
        });
        
    }
})