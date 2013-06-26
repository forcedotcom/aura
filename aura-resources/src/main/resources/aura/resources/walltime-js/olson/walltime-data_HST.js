(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {},
        zones: {"HST":[{"name":"HST","_offset":"-10:00","_rule":"-","format":"HST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);