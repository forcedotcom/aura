(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Ghana":[{"name":"Ghana","_from":"1936","_to":"1942","type":"-","in":"Sep","on":"1","at":"0:00","_save":"0:20","letter":"GHST"},{"name":"Ghana","_from":"1936","_to":"1942","type":"-","in":"Dec","on":"31","at":"0:00","_save":"0","letter":"GMT"}]},
        zones: {"Africa/Accra":[{"name":"Africa/Accra","_offset":"-0:00:52","_rule":"-","format":"LMT","_until":"1918"},{"name":"Africa/Accra","_offset":"0:00","_rule":"Ghana","format":"%s","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);