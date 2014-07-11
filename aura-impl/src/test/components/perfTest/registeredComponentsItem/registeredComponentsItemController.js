({
    init: function(cmp, event, helper) {
        var item = cmp.get("v.item");
        var componentDef = $A.componentService.getDef(item);

        if(componentDef.isAbstract()) {
            cmp.set("v.readonly", true);
        }
    },

    linkClick: function(cmp, event, helper) {
        var cmpName = cmp.get("v.item");

        window.location.hash = encodeURIComponent(JSON.stringify({
            componentDef: cmpName
        }));
    }
})