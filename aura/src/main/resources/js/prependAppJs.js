// This code is hardcoded in AppJs.java.
// Is here just to make it easier to minify when changed
typeof Aura === "undefined" && (Aura = {});
Aura.bootstrap || (Aura.bootstrap = {});

if (!Aura.frameworkJsReady) {
    Aura.ApplicationDefs = { cmpExporter : {}, libExporter : {} };

    $A = { componentService : {
        addComponent: function (d, e) { Aura.ApplicationDefs.cmpExporter[d] = e; },
        addLibraryExporter: function (d, e) { Aura.ApplicationDefs.libExporter[d] = e; },
        initEventDefs: function (e) { Aura.ApplicationDefs.eventDefs = e; },
        initLibraryDefs: function (e) { Aura.ApplicationDefs.libraryDefs = e; },
        initControllerDefs: function (e) { Aura.ApplicationDefs.controllerDefs = e; },
        initModuleDefs: function (e) { Aura.ApplicationDefs.moduleDefs = e; }
    }};
}