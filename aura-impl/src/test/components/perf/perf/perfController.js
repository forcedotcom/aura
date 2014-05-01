({
    /**
     * component init handler.
     */
    doneRendering: function (component, event, helper) {
        var config = helper.getDescriptorFromUrl();
        if (config && config.componentDef) {
            var def = config.componentDef;
            // add a data attribute(data-rendered-component) to know when a component provided in the url have done rendering.
            // Used by webdriver tests to wait for component rendering.
            $A.util.setDataAttribute(component.getElement(), 'rendered-component', def.substr(def.lastIndexOf(':') + 1));
        }
    },

    locationChange: function (component, event, helper) {
        var descriptor = helper.getDescriptorFromUrl();
        var callback = function (newCmp) {
            helper.renderComponent(component.find('container'), newCmp);
        };
        $A.log("Loading component for " + JSON.stringify(descriptor));

        if (descriptor) {
            helper.createComponent(descriptor.componentDef, descriptor.attributes && descriptor.attributes.values, callback);
        }
        else {
            // If no component descriptor specified, list all registered components.
            helper.createComponent('perf:registeredComponents', {}, callback);
        }
    }
})