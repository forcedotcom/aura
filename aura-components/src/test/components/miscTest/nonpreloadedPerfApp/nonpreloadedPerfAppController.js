({
    pushComponent:function(cmp){
        var a = $A.get("c.aura://ComponentController.getApplication");
        a.setParams({
            "name" : 'miscTest:perfApp',
            "attributes" : {'start': 5 }
        });
        a.setCallback(cmp,function(a){
        	var c = $A.newCmpDeprecated(a.getReturnValue());
            var body = cmp.find('placeHolder').get("v.body");
            body.push(c);
            cmp.find('placeHolder').set('v.body', body);
        });
        $A.enqueueAction(a);
    }
})
