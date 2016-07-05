({
    map: {
        componentDefs : []
    },
    getWhitelist: function (cmp) {
        var whitelist = {};
        if (cmp.get('v.cmpFilter')) whitelist.COMPONENT = true;
        if (cmp.get('v.intfFilter')) whitelist.INTERFACE = true;
        if (cmp.get('v.eventFilter')) whitelist.EVENT = true;
        if (cmp.get('v.libFilter')) whitelist.LIBRARY = true;

        return whitelist;
    },
    retrieveDeps: function (cmp, def, whitelist,  callback) {
        whitelist = whitelist || {};

        var action = cmp.get("c.getDependencies");
        var map = this.map;

        action.setParams({ component: def });
        action.setCallback(this, function () {
            var result = action.getReturnValue();
            result.dependencies = result.dependencies.filter(function (d) {
                var type = d.split('@')[1];
                return d.indexOf('aura:') === -1 && d.indexOf('auradev:') === -1 && type in whitelist
            });

            console.log('Retrieved %s dependencies for %s: ', result.dependencies.length, def);

            callback(result);
        });

        $A.enqueueAction(action);
    },
    dependencyList: function (cmp, list, whitelist, callback) {
        var depList = [];
        var self = this;

        function fetch(head, list, dl) {
            console.log('>>> Fetching: %s (%s remaining)', head, list.length);
            self.retrieveDeps(cmp, head, whitelist, function (res) {
                dl.push(res);
                if (list.length) {
                    setTimeout($A.getCallback(function () {
                        fetch(list.pop(), list, dl);
                    }, 0));
                    
                } else {
                    return callback(depList);
                }
            });
        }

        fetch(list.pop(), list, depList);
    }
})