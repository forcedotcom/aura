({
    fetchCmp: function(cmp) {
        cmp.set("v.status", "Fetching");
        var action = $A.get("c.aura://ComponentController.getComponent");
        action.setParams({
            name: cmp.get('v.load')
        });
        action.setStorable();

        action.setCallback(this, function (action) {
            if (action.getState() === "SUCCESS") {
                cmp.set("v.status", "Done Fetching");
            } else {
                cmp.set("v.status", "Error: " + action.getError().toString());
            }
        });

        $A.enqueueAction(action);
    },

    createComponentDeprecated: function(cmp) {
        cmp.set("v.status", "Creating Component");
        var load = cmp.get("v.load");
        try {
            var newCmp = $A.newCmpDeprecated(load);
            if (newCmp) {
                cmp.set("v.status", "Done Creating Component");
                cmp.set("v.output", newCmp);
            }
        } catch (e) {
            cmp.set("v.status", "Error: " + e);
        }
    },

    clearActionAndDefStorage: function(cmp) {
        cmp.set("v.status", "Clearing Action and Def Storage");
        $A.storageService.getStorage('ComponentDefStorage').clear()
        .then(function() {
            return $A.storageService.getStorage('actions').clear();
        })
        .then(function() {
            cmp.set("v.status", "Done Clearing Action and Def Storage");
        })
        ['catch'](function(error) { cmp.set("v.status", "Error: " + error); });
    },
    
    verifyDefsRestored: function(cmp) {
        cmp.set("v.status", "Verifying Defs Restored");
        $A.storageService.getStorage('ComponentDefStorage').getAll()
        .then(function(items) {
            if (items.length > 0) {
                cmp.set("v.status", "Done Verifying Defs Restored");
            } else {
                cmp.set("v.status", "Defs Not Restored");
            }
        })
        ['catch'](function(error) { cmp.set("v.status", "Error: " + error.toString()); });
    },

    /**
     * Listen to Aura logs for things being added to the component def storage and save to attribute for test to
     * monitor and wait on.
     */
    setupLogListener: function(cmp) {
        var logListener = function(level, message, error) {
            var putLogLine = "'ComponentDefStorage' [indexeddb] : put() - key: ";
            var index = message.indexOf(putLogLine)
            if (index !== -1) {
                var storedCmp = message.substring(index + putLogLine.length, message.length -1);
                var putLogAttr = cmp.get("v.putLog");
                putLogAttr.push(storedCmp);
                cmp.set("v.putLog", putLogAttr);
            }
        }
        $A.logger.subscribe("INFO", logListener);
    }
})