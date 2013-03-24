({
    pushComponent:function(cmp){
        var a = $A.get("c.aura://ComponentController.getApplication");
        a.setParams({
            "name" : 'performanceTest:perfApp',
            "attributes" : {'start': 5 }
        });
        a.setCallback(cmp,function(a){
            var c = $A.newCmp(a.getReturnValue());
            cmp.find('placeHolder').getValue('v.body').push(c);
            $A.endMark("Fetch component");
        });
        $A.mark("Fetch component");
        a.runAfter(a);
    }
})