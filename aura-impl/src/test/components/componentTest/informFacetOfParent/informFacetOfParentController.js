({
    //Inform my facets about me
    doInit: function(component, event, helper) {
        var body = component.getValue("v.body");
        for (var i = 0; i < body.getLength(); i++) {
            var c = body.getValue(i);
            if (c.getDef().getAttributeDefs().getDef("parent")) {
                c.setValue("v.parent", [component]);
            }
        }
    }
})