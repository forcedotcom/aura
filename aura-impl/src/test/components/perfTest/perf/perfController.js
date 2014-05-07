({
    init: function (component, event, helper) {
        helper.bootstrapPerfFramework(component);
    },

    locationChange: function (component, event, helper) {
        var descriptor = helper.getDescriptorFromUrl(),
            callback   = function (newCmp) {
                $A.log("Start rendering component: " + JSON.stringify(descriptor));

                // Wait 50ms to stabilize the browser
                $A.PERFCORE.later(50, function (t) {
                    // Create the context for Aura
                    $A.run(function () {
                        // Start timming 
                        $A.PERFCORE.mark('START:cmpRender');
                        helper.renderComponent(component.find('container'), newCmp);

                        // Use RAF to wait till the browser updates and paints
                        $A.PERFCORE.later(300, function (t) {
                            $A.PERFCORE.mark('END:cmpRender');
                            $A.util.setDataAttribute(component.getElement(), 'app-rendered-component', 'true');
                        });
                    });
                });
                
            };

        if (descriptor) {
            //$A.log("Loading component for " + JSON.stringify(descriptor));
            helper.createComponent(descriptor.componentDef, descriptor.attributes && descriptor.attributes.values, callback);
        } else {
            //$A.log('No component specified, listing components');
            helper.createComponent('perfTest:registeredComponents', {}, callback);
        }
    }
})