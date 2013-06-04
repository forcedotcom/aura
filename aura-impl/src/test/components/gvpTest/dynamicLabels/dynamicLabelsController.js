({
    getComponentWithLabelInBody:function(cmp){
        var a = $A.get("c.aura://ComponentController.getComponent");
        a.setParams({
            "name" : 'gvpTest:newLabels'
        });
        a.setCallback(cmp,function(a){
            var newCmp = $A.newCmpDeprecated(a.getReturnValue());
    	    cmp.find("container").getValue('v.body').push(newCmp);
        });
        a.runAfter(a);
    }
})