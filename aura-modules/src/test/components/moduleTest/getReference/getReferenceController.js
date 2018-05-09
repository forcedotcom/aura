({
    createInteropWithGetReference: function(cmp, event, helper) {
        $A.createComponent("moduleTest:simpleCmp", {
            onclick: cmp.getReference("c.foo")
        }, function(newCmp, status, err) {
           cmp.set("v.created", newCmp);
        });
    },

    foo: function(cmp) {
        cmp.set("v.actionCalled", true);
    }
})
