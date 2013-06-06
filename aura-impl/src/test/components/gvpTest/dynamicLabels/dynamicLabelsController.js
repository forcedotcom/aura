({
    getComponentWithLabelInBody:function(cmp){
        var a = $A.get("c.aura://ComponentController.getComponent");
        a.setParams({
            "name" : 'gvpTest:newLabels'
        });
        a.setCallback(cmp,function(a){
            $A.componentService.newComponentAsync(
                this,
                function(newCmp){
                    cmp.find("container").getValue('v.body').push(newCmp);
                },
                a.getReturnValue()
            );
        });
        a.runAfter(a);
    }
})