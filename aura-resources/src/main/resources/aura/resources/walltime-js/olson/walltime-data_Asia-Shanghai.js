(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Shang":[{"name":"Shang","_from":"1940","_to":"only","type":"-","in":"Jun","on":"3","at":"0:00","_save":"1:00","letter":"D"},{"name":"Shang","_from":"1940","_to":"1941","type":"-","in":"Oct","on":"1","at":"0:00","_save":"0","letter":"S"},{"name":"Shang","_from":"1941","_to":"only","type":"-","in":"Mar","on":"16","at":"0:00","_save":"1:00","letter":"D"}],"PRC":[{"name":"PRC","_from":"1986","_to":"only","type":"-","in":"May","on":"4","at":"0:00","_save":"1:00","letter":"D"},{"name":"PRC","_from":"1986","_to":"1991","type":"-","in":"Sep","on":"Sun>=11","at":"0:00","_save":"0","letter":"S"},{"name":"PRC","_from":"1987","_to":"1991","type":"-","in":"Apr","on":"Sun>=10","at":"0:00","_save":"1:00","letter":"D"}]},
        zones: {"Asia/Shanghai":[{"name":"Asia/Shanghai","_offset":"8:05:52","_rule":"-","format":"LMT","_until":"1928"},{"name":"Asia/Shanghai","_offset":"8:00","_rule":"Shang","format":"C%sT","_until":"1949"},{"name":"Asia/Shanghai","_offset":"8:00","_rule":"PRC","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);