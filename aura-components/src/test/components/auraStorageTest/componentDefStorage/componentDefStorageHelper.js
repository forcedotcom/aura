({
    LOCAL_STORAGE_KEY: "auraStorageTest:componentDefStorage",

    restoreLog: function(cmp) {
        try {
            var log = window.localStorage[this.LOCAL_STORAGE_KEY];
            if (log) {
                this.log(cmp, log);
                this.log(cmp, "Restored Log");
            }
        } catch (e) { /* noop */ }
    },

    saveLog: function(cmp) {
        try {
            var now = new Date().toJSON();
            var log = cmp.get("v.log") + "== " + now + " ==\n";
            window.localStorage[this.LOCAL_STORAGE_KEY] = log;
            this.log(cmp, "Saved Log");
        } catch (e) { /* noop */ }
    },

    setStatus: function(cmp, status) {
        cmp.set("v.status", status);
        this.log(cmp, "Status update: " + status);
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
        $A.storageService.getStorage("ComponentDefStorage").getAll()
        .then(function(items) {
            var keys  = [];
            for (var i = 0; i < items.length; i++) {
                keys.push(items[i]["key"]);
            }

            var content = keys.sort().join(", ");

            // only log if the value has changed
            if (cmp._ComponentDefStorage !== content) {
                that.log(cmp, "ComponentDefStorage content: " + content);
                cmp._ComponentDefStorage = content;
            }

        });
    },

    clearActionAndDefStorage: function(cmp) {
        var promises = [
            $A.storageService.getStorage('ComponentDefStorage').clear(),
            $A.storageService.getStorage('actions').clear()
        ];
        return Promise.all(promises);
    },

    reset: function(cmp) {
        delete window.localStorage[this.LOCAL_STORAGE_KEY];
        return this.clearActionAndDefStorage(cmp);
    }
})