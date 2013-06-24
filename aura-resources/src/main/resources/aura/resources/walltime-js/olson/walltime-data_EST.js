(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {},
        zones: {"EST":[{"name":"EST","_offset":"-5:00","_rule":"-","format":"EST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);