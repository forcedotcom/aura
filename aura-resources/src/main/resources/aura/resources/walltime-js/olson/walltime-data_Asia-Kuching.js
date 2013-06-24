(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"NBorneo":[{"name":"NBorneo","_from":"1935","_to":"1941","type":"-","in":"Sep","on":"14","at":"0:00","_save":"0:20","letter":"TS"},{"name":"NBorneo","_from":"1935","_to":"1941","type":"-","in":"Dec","on":"14","at":"0:00","_save":"0","letter":"-"}]},
        zones: {"Asia/Kuching":[{"name":"Asia/Kuching","_offset":"7:21:20","_rule":"-","format":"LMT","_until":"1926 Mar"},{"name":"Asia/Kuching","_offset":"7:30","_rule":"-","format":"BORT","_until":"1933"},{"name":"Asia/Kuching","_offset":"8:00","_rule":"NBorneo","format":"BOR%sT","_until":"1942 Feb 16"},{"name":"Asia/Kuching","_offset":"9:00","_rule":"-","format":"JST","_until":"1945 Sep 12"},{"name":"Asia/Kuching","_offset":"8:00","_rule":"-","format":"BORT","_until":"1982 Jan 1"},{"name":"Asia/Kuching","_offset":"8:00","_rule":"-","format":"MYT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);