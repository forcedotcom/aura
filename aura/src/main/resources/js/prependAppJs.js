// This code is hardcoded in AppJs.java.
// Is here just to make it easier to minify when changed
if (!(window.Aura || (Aura = {})).frameworkJsReady) {
    Aura.ApplicationDefs = {};
    $A = {
        fn: function(name) {
            return function (items) {
                var defs = Aura.ApplicationDefs;
                var registry = defs[name];
                if (registry) {
                    if (items instanceof Array) {
                        registry.push.apply(registry, items);
                    } else {
                        for (var descriptor in items) {
                            registry[descriptor] = items[descriptor];
                        }
                    }
                } else {
                    defs[name] = items;
                }
            };
        }
    };
    $A.componentService = {
        addComponents: $A.fn('cmpExporter'),
        addLibraryExporters: $A.fn('libExporter'),
        initEventDefs: $A.fn('eventDefs'),
        initLibraryDefs: $A.fn('libraryDefs'),
        initControllerDefs: $A.fn('controllerDefs'),
        initModuleDefs: $A.fn('moduleDefs')
    };
}
