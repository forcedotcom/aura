({
    getSecureAura: function(cmp) {
        cmp.set("v.log", $A);
    },

    getSecureComponent: function(cmp) {
        cmp.set("v.log", cmp);
    },
    
    dynamicallyCreateCmpsDifferentNamespace: function(cmp) {
        $A.createComponents([
                 ["aura:text",{value:'FirstText'}],
                 ["aura:text",{value:'SecondText'}], 
                 ["aura:text",{value:'ThirdText'}]],
                 function(components, status, statusMessagesList){
                     if (newCmp.toString().indexOf("SecureComponentRef") !== 0) {
                         throw new Error("Created components (via $A.createComponents) should be of type SecureComponentRef");
                     }
                     cmp.set("v.dynamicCmps", components);
                 }
         );
    },

    dynamicallyCreateCmpSameNamespace: function(cmp) {
        $A.createComponent("lockerTest:secureWindowTest", {},
                 function(newCmp, status, statusMessagesList){
                    if (newCmp.toString().indexOf("SecureComponent") !== 0) {
                        throw new Error("Created component (via $A.createComponent) should be of type SecureComponent");
                    }
                     cmp.set("v.dynamicCmps", [newCmp]);
                 }
         );
    },

    callEnqueueAction: function(cmp) {
        var action = $A.get("c.aura://ComponentController.getComponent");
        action.setParams({name: "markup://aura:text"});
        action.setCallback(this, function (action) {
            if (action.getState() === "SUCCESS") {
            } else {
            }
        });
        $A.enqueueAction(action);
    },

    callGetCallback: function(cmp) {
        var that = cmp;
        window.setTimeout($A.getCallback(function(){
            that.set("v.log", [this, window, document]);
        }), 0);
    },

    getGVP: function(cmp) {
        cmp.set("v.log", $A.get("$Browser"));
    },
    
    callGetComponentDifferentNamespace: function(cmp) {
        var globalId = cmp.find("textCmp").getGlobalId();
        var component = $A.getComponent(globalId);
        cmp.set("v.log", component);
    },
    
    callGetComponentSameNamespace: function(cmp) {
        var globalId = cmp.find("lockerCmp").getGlobalId();
        var component = $A.getComponent(globalId);
        cmp.set("v.log", component);
    }
})