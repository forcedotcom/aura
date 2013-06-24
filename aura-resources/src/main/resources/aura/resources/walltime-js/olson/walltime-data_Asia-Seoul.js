(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"ROK":[{"name":"ROK","_from":"1960","_to":"only","type":"-","in":"May","on":"15","at":"0:00","_save":"1:00","letter":"D"},{"name":"ROK","_from":"1960","_to":"only","type":"-","in":"Sep","on":"13","at":"0:00","_save":"0","letter":"S"},{"name":"ROK","_from":"1987","_to":"1988","type":"-","in":"May","on":"Sun>=8","at":"0:00","_save":"1:00","letter":"D"},{"name":"ROK","_from":"1987","_to":"1988","type":"-","in":"Oct","on":"Sun>=8","at":"0:00","_save":"0","letter":"S"}]},
        zones: {"Asia/Seoul":[{"name":"Asia/Seoul","_offset":"8:27:52","_rule":"-","format":"LMT","_until":"1890"},{"name":"Asia/Seoul","_offset":"8:30","_rule":"-","format":"KST","_until":"1904 Dec"},{"name":"Asia/Seoul","_offset":"9:00","_rule":"-","format":"KST","_until":"1928"},{"name":"Asia/Seoul","_offset":"8:30","_rule":"-","format":"KST","_until":"1932"},{"name":"Asia/Seoul","_offset":"9:00","_rule":"-","format":"KST","_until":"1954 Mar 21"},{"name":"Asia/Seoul","_offset":"8:00","_rule":"ROK","format":"K%sT","_until":"1961 Aug 10"},{"name":"Asia/Seoul","_offset":"8:30","_rule":"-","format":"KST","_until":"1968 Oct"},{"name":"Asia/Seoul","_offset":"9:00","_rule":"ROK","format":"K%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);