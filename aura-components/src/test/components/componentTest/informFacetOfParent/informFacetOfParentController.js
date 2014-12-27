({
    //Inform my facets about me
    doInit: function(component, event, helper) {
        var body = component.get("v.body");
        for (var i = 0; i < body.length; i++) {
            var c = body[i];
            if (c.getDef().getAttributeDefs().getDef("parent")) {
                c.set("v.parent", [component]);
            }
        }
    }
})