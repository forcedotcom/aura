({
    init: function (component, event, helper) {
        helper.bootstrapPerfFramework(component);
    },
    /**
     * Action executed after app shell has done Rendering
     */
    doneRendering: function (component, event, helper) {
        var config = helper.getDescriptorFromUrl(),
            def    = config && config.componentDef;

        if (def) {
            // Add a data attribute(data-app-rendered-component) to know when the app provided in the url have done rendering.
            $A.util.setDataAttribute(component.getElement(), 'app-rendered-component', def.substr(def.lastIndexOf(':') + 1));
        }
    },

    locationChange: function (component, event, helper) {
        var descriptor = helper.getDescriptorFromUrl(),
            callback   = function (newCmp) {
                $A.log("Start rendering component: " + JSON.stringify(descriptor));

                // Wait 300ms to stabilize the browser
                $A.PERFCORE.later(300, function (t) {
                    // Create the context for Aura
                    $A.run(function () {

                        // Start timming 
                        $A.PERFCORE.mark('START:cmpRender');
                        helper.renderComponent(component.find('container'), newCmp);

                        // Use RAF to wait till the browser updates and paints
                        $A.PERFCORE.raf(function (t) {
                            $A.PERFCORE.mark('END:cmpRender');
                        });
                    });
                });
                
            };

        if (descriptor) {
            //$A.log("Loading component for " + JSON.stringify(descriptor));
            helper.createComponent(descriptor.componentDef, descriptor.attributes && descriptor.attributes.values, callback);
        } else {
            //$A.log('No component specified, listing components');
            helper.createComponent('perf:registeredComponents', {}, callback);
        }
    }
})