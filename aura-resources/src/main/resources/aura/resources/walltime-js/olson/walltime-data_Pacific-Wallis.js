(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {},
        zones: {"Pacific/Wallis":[{"name":"Pacific/Wallis","_offset":"12:15:20","_rule":"-","format":"LMT","_until":"1901"},{"name":"Pacific/Wallis","_offset":"12:00","_rule":"-","format":"WFT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);