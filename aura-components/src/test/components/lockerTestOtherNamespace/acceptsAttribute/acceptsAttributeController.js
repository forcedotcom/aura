({
    init: function(cmp) {
        var attribute = cmp.get("v.obj");
        if (attribute) {
	        var cmpRef = attribute.getCmpRef();
	        cmp.set("v.output", cmpRef.toString());
        }
    },
    
    setupTestFilteringProxy: function(cmp, event, helper) {
    	var po = cmp.get("v.obj");
    	helper._po = po;
    }
})