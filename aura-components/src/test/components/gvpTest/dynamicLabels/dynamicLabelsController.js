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
                	var body = cmp.find("container").get('v.body'); 
                    body.push(newCmp);
                    cmp.find("container").set('v.body', body)
                },
                a.getReturnValue()
            );
        });
        $A.enqueueAction(a);
    }
})
