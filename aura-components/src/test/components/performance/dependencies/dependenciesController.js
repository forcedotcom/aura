({
    init: function (cmp, event, helper) {
        var def = cmp.get('v.def');
        if (def) {

            helper.dependencyList(cmp, [def], function (dependencyList) {
                console.log('Dependencies: ', dependencyList[0]);
            });    
        }

        $A.dependencies =  {
            list: $A.getCallback(function (dep, callback) {
                if (typeof dep === 'string') {
                    dep = [dep];
                }

                if (!callback) {
                    callback = function (deps) { 
                        if (deps.length === 1) {
                            console.log(deps[0].dependencies); 
                        } else {
                            console.lgo(deps);
                        }
                        
                    }
                }

                helper.dependencyList(cmp, dep, callback);
            })
        };
    },

    getAllCmpDescriptors: function (cmp, event, helper) {
        var action = cmp.get("c.getAllDescriptors");

        if (helper.map.componentDefs.length) {
            return;
        }

        action.setCallback(this, function () {
            var defs = action.getReturnValue() || [];

            defs = defs.filter(function (d) { return d.indexOf('test') === -1 && d.indexOf('Test') === -1  });
            defs.sort();

            helper.map.componentDefs = defs.map(function (d, index) {
                return { def: d, dependencies: [], index: index, isOpen: false };
            });


            console.log('Found: ', helper.map.componentDefs.length);
            cmp.set('v.items', helper.map.componentDefs);
        });

        $A.enqueueAction(action);
    },
    getCmpDependencies: function (cmp, event, helper) {
        var defs = helper.map.componentDefs.map(function (d) { return d.def });

        if (defs.length) {
            helper.dependencyList(cmp, defs, function (dependencyList) {
                console.log('Dependencies: ', dependencyList);
            });    
        }
    },
    getCmpDependency: function (cmp, event, helper) {
        var index = parseInt(event.getParam('domEvent').templateElement.dataset.index);
        var cmpDef = helper.map.componentDefs[index];
        var descriptor = cmpDef && cmpDef.def;
        var item = cmp.get('v.items')[index];
        var vl = cmp.find('list');

        if (descriptor) {
            window.history.replaceState({}, descriptor, window.location.origin + window.location.pathname + '?def=' + descriptor);

            if (!cmpDef.dependencies.length) {
                helper.dependencyList(cmp, [descriptor], function (result) {
                    console.log('Dependencies: ', result[0]);
                    cmpDef.isOpen = true;
                    cmpDef.dependencies = result[0].dependencies;
                    vl.updateItem(cmpDef, index);
                });
            } else {
                cmpDef.isOpen = !cmpDef.isOpen;
                vl.updateItem(cmpDef, index);
            }
        }
    }
})