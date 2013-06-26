(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"SA":[{"name":"SA","_from":"1942","_to":"1943","type":"-","in":"Sep","on":"Sun>=15","at":"2:00","_save":"1:00","letter":"-"},{"name":"SA","_from":"1943","_to":"1944","type":"-","in":"Mar","on":"Sun>=15","at":"2:00","_save":"0","letter":"-"}]},
        zones: {"Africa/Johannesburg":[{"name":"Africa/Johannesburg","_offset":"1:52:00","_rule":"-","format":"LMT","_until":"1892 Feb 8"},{"name":"Africa/Johannesburg","_offset":"1:30","_rule":"-","format":"SAST","_until":"1903 Mar"},{"name":"Africa/Johannesburg","_offset":"2:00","_rule":"SA","format":"SAST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);