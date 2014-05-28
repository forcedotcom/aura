({
    outter: function(cmp, event, helper) {
    	helper.setOutput(cmp, event, "outterEvent");
    },
    
    middle: function(cmp, event, helper) {
    	helper.setOutput(cmp, event, "middleEvent");
    },
    
    inner: function(cmp, event, helper) {
    	helper.setOutput(cmp, event, "innerEvent");
    },
    
    clearOutput: function(cmp, event, helper) {
    	cmp.set("v.outterEvent", "");
    	cmp.set("v.middleEvent", "");
    	cmp.set("v.innerEvent", "");
    }
})