({
    render: function(cmp) {
    	$A.get("$Label" + ".Related_Lists" + ".task_mode_today", function(label) { cmp.set("v.simplevalue1", label) });
    	$A.get("$Label.DOESNT.EXIST", function(label) { cmp.set("v.simplevalue2", label) });
    	$A.get("$Label.Related_Lists.DOESNTEXIST", function(label) { cmp.set("v.simplevalue3", label) });

        // Both section and name are required. This request will return undefined and no action is requested.
        cmp.set("v.simplevalue4", $A.get("$Label.DOESNTEXIST"));

        // These requests are here to test that there are no multiple action requests for the same $Label
        // See LabelValueProviderUITest.java
        for (var i = 0; i < 5; i++) {
	        $A.get("$Label.Related_Lists." + "task_mode_today");
        }
        
        return this.superRender();
    }
})
