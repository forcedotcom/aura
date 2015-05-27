({
    testAttributeAccess: function(cmp, event, helper) {
        var attrName = event.getParam("arguments").attrName;
        var attribute = cmp.get("v." + attrName);
        cmp.set("v.output", attribute);
    }
})