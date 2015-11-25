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
                var type = " - Success!";
                if (newCmp.getDef().getDescriptor().getQualifiedName().indexOf("placeholder") !== -1) {
                    type = " - Placeholder";
                }
                cmp.set("v.status", "Done Creating Component" + type);
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
     * Update attribute on component with contents of the component def storage whenever it's modified.
     */
    storageModified: function(cmp) {
        $A.storageService.getStorage("ComponentDefStorage").getAll()
        .then(function(items) {
            var storageContents  = [];
            for (var i = 0; i < items.length; i++) {
                storageContents.push(items[i]["key"]);
            }
            cmp.set("v.defStorageContents", storageContents);
        });
    }
})