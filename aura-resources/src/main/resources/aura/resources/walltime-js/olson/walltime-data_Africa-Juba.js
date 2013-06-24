(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Sudan":[{"name":"Sudan","_from":"1970","_to":"only","type":"-","in":"May","on":"1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Sudan","_from":"1970","_to":"1985","type":"-","in":"Oct","on":"15","at":"0:00","_save":"0","letter":"-"},{"name":"Sudan","_from":"1971","_to":"only","type":"-","in":"Apr","on":"30","at":"0:00","_save":"1:00","letter":"S"},{"name":"Sudan","_from":"1972","_to":"1985","type":"-","in":"Apr","on":"lastSun","at":"0:00","_save":"1:00","letter":"S"}]},
        zones: {"Africa/Juba":[{"name":"Africa/Juba","_offset":"2:06:24","_rule":"-","format":"LMT","_until":"1931"},{"name":"Africa/Juba","_offset":"2:00","_rule":"Sudan","format":"CA%sT","_until":"2000 Jan 15 12:00"},{"name":"Africa/Juba","_offset":"3:00","_rule":"-","format":"EAT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);