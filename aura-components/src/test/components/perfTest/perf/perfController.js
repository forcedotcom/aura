({
    init: function (component, event, helper) {
        helper.bootstrapPerfFramework(component);
    },

    locationChange: function (component, event, helper) {
        var obj         = helper.parseObjectFromUrl(),
            cmp         = helper.getCmpDef(obj),
            perfConfig  = $A.PERFCORE.setConfig(obj);

        if (!cmp.def) {
            // LOAD DEFAULT PERF COMPONENT TO LIST OTHER COMPONENTS
            helper.createComponent('perfTest:registeredComponents', {}, function (newCmp) {
                component.find('container').set('v.body', newCmp);
            });
        } else {
            // FETCH CMP DEPENDENCIES ON THE SERVER SIDE SUCH AS DEF REFS
            helper.fetchServerSideDependencies(component, cmp, function () {

                // SEPARATE THE EXECUTION FROM THE FRAMEWORK:
                $A.PERFCORE.later(perfConfig.startDelay, function () {

                    // FRAMEWORK RUN:
                    // 1. Create cmp
                    // 2. Render cmp
                    // 3. After render (Paint cmp) (browser)

                    $A.PERFCORE.mark('PERF:start'); // Start!

                    // 1.
                    helper.perfCreateComponent(component, cmp, function (newCmp) {
                        // 2.
                        helper.perfRenderComponent(component, newCmp, function () {
                            // 3.
                            helper.perfAfterRender(component, newCmp, function () {
                                // We are done! let the framework know.
                                $A.util.setDataAttribute(component.getElement(), 'app-rendered-component', 'true');
                           });
                        });
                    });
                });
            });
        }
    }
})