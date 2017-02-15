({
    getEventDefinitionWithoutAccess: function(cmp) {
        var descriptor = "e.auratest:accessInternalEvent";

        $A.getDefinition(descriptor, function(definition){
            // using null string for UI tests.
            var name = definition===null? "null":definition.getDescriptor().getQualifiedName();
            cmp.set("v.definitionNames", [name]);
            cmp.set("v.complete", true);
        });
    },

    getComponentDefinitionWithoutAccess: function(cmp) {
        var descriptor = "auratest:accessInternalComponent";
        $A.getDefinition(descriptor, function(definition){
            var name = definition===null? "null":definition.getDescriptor().getQualifiedName();
            cmp.set("v.definitionNames", [name]);
            cmp.set("v.complete", true);
        });
    },

    getDefinitionsWithoutAccess: function(cmp) {
        var descriptors = ["e.auratest:accessInternalEvent",
                           "auratest:accessInternalComponent"];

        $A.getDefinitions(descriptors, function(definitions){
            var definitionNames = [];
            var definition;
            var name;

            for(var i = 0, len = definitions.length; i < len; i++) {
                definition = definitions[i];
                name = definition===null? "null":definition.getDescriptor().getQualifiedName();
                definitionNames.push(name);
            }

            cmp.set("v.definitionNames", definitionNames);
            cmp.set("v.complete", true);
        });
    }
})
