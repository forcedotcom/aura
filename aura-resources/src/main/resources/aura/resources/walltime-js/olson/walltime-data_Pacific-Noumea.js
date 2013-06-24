(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"NC":[{"name":"NC","_from":"1977","_to":"1978","type":"-","in":"Dec","on":"Sun>=1","at":"0:00","_save":"1:00","letter":"S"},{"name":"NC","_from":"1978","_to":"1979","type":"-","in":"Feb","on":"27","at":"0:00","_save":"0","letter":"-"},{"name":"NC","_from":"1996","_to":"only","type":"-","in":"Dec","on":"1","at":"2:00s","_save":"1:00","letter":"S"},{"name":"NC","_from":"1997","_to":"only","type":"-","in":"Mar","on":"2","at":"2:00s","_save":"0","letter":"-"}]},
        zones: {"Pacific/Noumea":[{"name":"Pacific/Noumea","_offset":"11:05:48","_rule":"-","format":"LMT","_until":"1912 Jan 13"},{"name":"Pacific/Noumea","_offset":"11:00","_rule":"NC","format":"NC%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);