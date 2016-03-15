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
                     cmp.set("v.dynamicCmps", components);
                 }
         );
    },
    
    dynamicallyCreateCmpSameNamespace: function(cmp) {
        console.log(window);
        $A.createComponent("lockerTest:secureWindowTest", {},
                 function(newCmp, status, statusMessagesList){
                    debugger;
                    console.log(this);
                    console.log(window);
                     cmp.set("v.dynamicCmps", [newCmp]);
                 }
         );
    }
})