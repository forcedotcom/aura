({
    getWrapperFromController: function(cmp) {
        cmp.set("v.log", cmp);
    },

    dynamicallyCreateCmps: function(cmp) {
        $A.createComponents([
                 ["aura:text",{value:'FirstText'}],
                 ["aura:text",{value:'SecondText'}], 
                 ["aura:text",{value:'ThirdText'}]],
                 function(components, status, statusMessagesList){
                     cmp.set("v.dynamicCmps", components);
                 }
         );
    },

    getElement: function(cmp) {
        cmp.set("v.log", cmp.getElement());
    },

    getEvent: function(cmp) {
        cmp.set("v.log", cmp.getEvent("press"));
    }
})