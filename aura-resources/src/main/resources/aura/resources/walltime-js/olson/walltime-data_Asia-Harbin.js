(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"PRC":[{"name":"PRC","_from":"1986","_to":"only","type":"-","in":"May","on":"4","at":"0:00","_save":"1:00","letter":"D"},{"name":"PRC","_from":"1986","_to":"1991","type":"-","in":"Sep","on":"Sun>=11","at":"0:00","_save":"0","letter":"S"},{"name":"PRC","_from":"1987","_to":"1991","type":"-","in":"Apr","on":"Sun>=10","at":"0:00","_save":"1:00","letter":"D"}]},
        zones: {"Asia/Harbin":[{"name":"Asia/Harbin","_offset":"8:26:44","_rule":"-","format":"LMT","_until":"1928"},{"name":"Asia/Harbin","_offset":"8:30","_rule":"-","format":"CHAT","_until":"1932 Mar"},{"name":"Asia/Harbin","_offset":"8:00","_rule":"-","format":"CST","_until":"1940"},{"name":"Asia/Harbin","_offset":"9:00","_rule":"-","format":"CHAT","_until":"1966 May"},{"name":"Asia/Harbin","_offset":"8:30","_rule":"-","format":"CHAT","_until":"1980 May"},{"name":"Asia/Harbin","_offset":"8:00","_rule":"PRC","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);