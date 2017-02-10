({
    collectExposedApis: function(map, name, api) {
        map[name] = {};
        var methods = Object.getOwnPropertyNames(api);
        map[name] = methods;
    }
})
