(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"PRC":[{"name":"PRC","_from":"1986","_to":"only","type":"-","in":"May","on":"4","at":"0:00","_save":"1:00","letter":"D"},{"name":"PRC","_from":"1986","_to":"1991","type":"-","in":"Sep","on":"Sun>=11","at":"0:00","_save":"0","letter":"S"},{"name":"PRC","_from":"1987","_to":"1991","type":"-","in":"Apr","on":"Sun>=10","at":"0:00","_save":"1:00","letter":"D"}]},
        zones: {"Asia/Kashgar":[{"name":"Asia/Kashgar","_offset":"5:03:56","_rule":"-","format":"LMT","_until":"1928"},{"name":"Asia/Kashgar","_offset":"5:30","_rule":"-","format":"KAST","_until":"1940"},{"name":"Asia/Kashgar","_offset":"5:00","_rule":"-","format":"KAST","_until":"1980 May"},{"name":"Asia/Kashgar","_offset":"8:00","_rule":"PRC","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);