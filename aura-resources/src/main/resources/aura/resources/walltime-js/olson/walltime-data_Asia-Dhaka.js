(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Dhaka":[{"name":"Dhaka","_from":"2009","_to":"only","type":"-","in":"Jun","on":"19","at":"23:00","_save":"1:00","letter":"S"},{"name":"Dhaka","_from":"2009","_to":"only","type":"-","in":"Dec","on":"31","at":"23:59","_save":"0","letter":"-"}]},
        zones: {"Asia/Dhaka":[{"name":"Asia/Dhaka","_offset":"6:01:40","_rule":"-","format":"LMT","_until":"1890"},{"name":"Asia/Dhaka","_offset":"5:53:20","_rule":"-","format":"HMT","_until":"1941 Oct"},{"name":"Asia/Dhaka","_offset":"6:30","_rule":"-","format":"BURT","_until":"1942 May 15"},{"name":"Asia/Dhaka","_offset":"5:30","_rule":"-","format":"IST","_until":"1942 Sep"},{"name":"Asia/Dhaka","_offset":"6:30","_rule":"-","format":"BURT","_until":"1951 Sep 30"},{"name":"Asia/Dhaka","_offset":"6:00","_rule":"-","format":"DACT","_until":"1971 Mar 26"},{"name":"Asia/Dhaka","_offset":"6:00","_rule":"-","format":"BDT","_until":"2009"},{"name":"Asia/Dhaka","_offset":"6:00","_rule":"Dhaka","format":"BD%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);