(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"CO":[{"name":"CO","_from":"1992","_to":"only","type":"-","in":"May","on":"3","at":"0:00","_save":"1:00","letter":"S"},{"name":"CO","_from":"1993","_to":"only","type":"-","in":"Apr","on":"4","at":"0:00","_save":"0","letter":"-"}]},
        zones: {"America/Bogota":[{"name":"America/Bogota","_offset":"-4:56:20","_rule":"-","format":"LMT","_until":"1884 Mar 13"},{"name":"America/Bogota","_offset":"-4:56:20","_rule":"-","format":"BMT","_until":"1914 Nov 23"},{"name":"America/Bogota","_offset":"-5:00","_rule":"CO","format":"CO%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);