({
    changeBkgColor:function(cmp){
        if(cmp.get("v.color") === "white"){
            cmp.getAttributes().setValue("color", "grey");
        }else{
            cmp.getAttributes().setValue("color", "white");
        }
    },
    by2:function(cmp){
        cmp.getAttributes().setValue("end", 10)
    },
    simpleServerAction:function(cmp){
        $A.mark("XHR call time: Simple Server Controller");
        var a = cmp.get('c.getString');
        a.setExclusive(); //So that it does not get batches with other requests
        a.setCallback(cmp,function(a){
            $A.endMark("XHR call time: Simple Server Controller");
        });
        $A.enqueueAction(a);
    },
    getComponent:function(cmp){
        $A.mark("XHR call time: Server Controller, New Component & Resolve Refs");
        var a = $A.get("c.aura://ComponentController.getApplication");
        a.setParams({
            "name" : 'performanceTest:perfApp'
        });
        a.setExclusive(); //So that it does not get batches with other requests
        a.setCallback(cmp,function(a){
            //If you want to explore adding new components on the page
            //var c = $A.newCmpDeprecated(a.getReturnValue());
            //cmp.find('new').getValue('v.body').push(c);
            $A.endMark("XHR call time: Server Controller, New Component & Resolve Refs");
        });
        $A.enqueueAction(a);
    },
    changeLayout:function(cmp){
        //This can be done using $A.layoutService too, but that does not utilize built in Jiffy marks.
        $A.historyService.set('basketBall');
    },
    revertLayout:function(cmp){
        $A.historyService.back();

    },
    pushComponent:function(cmp){
        var a = $A.get("c.aura://ComponentController.getApplication");
        a.setParams({
            "name" : 'performanceTest:perfApp',
            "attributes" : {'start': 5 }
        });
        a.setCallback(cmp,function(a){
            var c = $A.newCmpDeprecated(a.getReturnValue());
            cmp.find('placeHolder').getValue('v.body').push(c);
        });
        $A.enqueueAction(a);
    },
    destroyComponent:function(cmp){
        $A.mark("Component.destroy");
        var toDestroy = cmp.find('placeHolder').getValue('v.body');
        if(toDestroy.isEmpty()){
            alert("Nothing to delete in the placeholder! Press the 'Push component to page' button");
        }else{
            toDestroy.get(0).destroy();
        }
        $A.endMark("Component.destroy");
    },
    removeElement:function(cmp){
        var toDestroy = cmp.find('placeHolder').getValue('v.body');
        if(toDestroy.isEmpty()){
            alert("Nothing to delete in the placeholder! Press the 'Push component to page' button");
        }else{
            $A.util.removeElement(cmp.find('placeHolder').getElement());
        }
    }
})
