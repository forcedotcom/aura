(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {},
        zones: {"Pacific/Midway":[{"name":"Pacific/Midway","_offset":"-11:49:28","_rule":"-","format":"LMT","_until":"1901"},{"name":"Pacific/Midway","_offset":"-11:00","_rule":"-","format":"NST","_until":"1956 Jun 3"},{"name":"Pacific/Midway","_offset":"-11:00","_rule":"1:00","format":"NDT","_until":"1956 Sep 2"},{"name":"Pacific/Midway","_offset":"-11:00","_rule":"-","format":"NST","_until":"1967 Apr"},{"name":"Pacific/Midway","_offset":"-11:00","_rule":"-","format":"BST","_until":"1983 Nov 30"},{"name":"Pacific/Midway","_offset":"-11:00","_rule":"-","format":"SST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);