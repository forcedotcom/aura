({
    provide: function(component, event, helper){
        var LISTED_NAMESPACES = ['aura', 'ui', 'force', 'one'];
        var descriptors = $A.componentService.getRegisteredComponentDescriptors();
        var data = [];

        // List only components that are in LISTED_NAMESPACES
        for(var i= 0, len=descriptors.length; i < len; i++) {
            var componentDef = $A.componentService.getDef(descriptors[i]);
            if(LISTED_NAMESPACES.indexOf(componentDef.getDescriptor().getNamespace()) !== -1) {
                data.push(descriptors[i]);
            }
        }

        var dataProvider = component.getConcreteComponent();
        helper.fireDataChangeEvent(dataProvider, data);
    }
})