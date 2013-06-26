(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"PRC":[{"name":"PRC","_from":"1986","_to":"only","type":"-","in":"May","on":"4","at":"0:00","_save":"1:00","letter":"D"},{"name":"PRC","_from":"1986","_to":"1991","type":"-","in":"Sep","on":"Sun>=11","at":"0:00","_save":"0","letter":"S"},{"name":"PRC","_from":"1987","_to":"1991","type":"-","in":"Apr","on":"Sun>=10","at":"0:00","_save":"1:00","letter":"D"}]},
        zones: {"Asia/Chongqing":[{"name":"Asia/Chongqing","_offset":"7:06:20","_rule":"-","format":"LMT","_until":"1928"},{"name":"Asia/Chongqing","_offset":"7:00","_rule":"-","format":"LONT","_until":"1980 May"},{"name":"Asia/Chongqing","_offset":"8:00","_rule":"PRC","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);