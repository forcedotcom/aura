(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {},
        zones: {"Etc/UTC":[{"name":"Etc/UTC","_offset":"0","_rule":"-","format":"UTC","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);