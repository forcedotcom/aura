({
    LOCAL_STORAGE_KEY: "auraStorageTest:componentDefStorage",

    restoreLog: function(cmp) {
        try {
            var log = window.localStorage[this.LOCAL_STORAGE_KEY];
            if (log) {
                this.log(cmp, log);
                this.log(cmp, "\nRestored Log");
            }
        } catch (e) { /* noop */ }
    },

    saveLog: function(cmp) {
        try {
            var now = new Date().toJSON();
            var log = cmp.get("v.log") + "== " + now + " ==\n";
            window.localStorage[this.LOCAL_STORAGE_KEY] = log;
            this.log(cmp, "\nSaved Log");
        } catch (e) { /* noop */ }
    },

    setStatus: function(cmp, status) {
        cmp.set("v.status", status);
        this.log(cmp, "\nStatus update: " + status);
    },

    log: function(cmp, log) {
        var l = cmp.get("v.log");
        l += log + "\n";
        cmp.set("v.log", l);
    },

    logDefs: function(cmp) {
        this.log(cmp, "$A.getContext().loaded = " + Object.keys($A.getContext().loaded).sort().join(", "));

        // this is for debugging. tests don't rely on this.
        // plus it won't work in prod mode. but it's a life saver when you're debugging.
        var registry = $A.componentService.$componentDefRegistry$ || {};
        var configs = $A.componentService.$savedComponentConfigs$ || {};

        var defs = Object.keys(registry).concat(Object.keys(configs)).sort();
        this.log(cmp, "Defs on client = " + defs.join(", "));
    },

    logComponentDefStorage: function(cmp) {
        var that = this;
        // def store does not exist until a dynamic def is received
        var defs = $A.storageService.getStorage("ComponentDefStorage");
        if (!defs) {
            return;
        }

        this.log(cmp, "ComponentDefStorage changed, fetching contents");
        defs.getAll([], true).then($A.getCallback(function(items) {

            // collect the defs
            var content = Object.keys(items).sort().join(", ");

            // only log if the value has changed
            if (cmp._ComponentDefStorage !== content) {
                that.log(cmp, "ComponentDefStorage content: " + content);
                cmp._ComponentDefStorage = content;
            }
        }));
    },

    clearActionAndDefStorage: function(cmp) {
        // def store is not created until a dynamic def is received. if it doesn't exist
        // in aura storage service then create it, clear it (to clear the underlying persistent
        // store), then remove it.
        var defs = $A.storageService.getStorage("ComponentDefStorage");
        var defsCreated = false;
        if (!defs) {
            defsCreated = true;
            defs = $A.storageService.initStorage({
                name: "ComponentDefStorage",
                persistent: true,
                secure: false,
                maxSize: 442368,
                expiration: 10886400,
                debugLogging: true,
                clearOnInit: false
            });
        }

        return Promise.all([$A.storageService.getStorage("actions").clear(), defs.clear()])
            .then(
                function() {
                    if (defsCreated) {
                        $A.storageService.deleteStorage("ComponentDefStorage");
                    }
                }
            );
    },

    reset: function(cmp) {
        delete window.localStorage[this.LOCAL_STORAGE_KEY];
        return this.clearActionAndDefStorage(cmp);
    }
})
