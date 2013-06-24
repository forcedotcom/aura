(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"EU":[{"name":"EU","_from":"1977","_to":"1980","type":"-","in":"Apr","on":"Sun>=1","at":"1:00u","_save":"1:00","letter":"S"},{"name":"EU","_from":"1977","_to":"only","type":"-","in":"Sep","on":"lastSun","at":"1:00u","_save":"0","letter":"-"},{"name":"EU","_from":"1978","_to":"only","type":"-","in":"Oct","on":"1","at":"1:00u","_save":"0","letter":"-"},{"name":"EU","_from":"1979","_to":"1995","type":"-","in":"Sep","on":"lastSun","at":"1:00u","_save":"0","letter":"-"},{"name":"EU","_from":"1981","_to":"max","type":"-","in":"Mar","on":"lastSun","at":"1:00u","_save":"1:00","letter":"S"},{"name":"EU","_from":"1996","_to":"max","type":"-","in":"Oct","on":"lastSun","at":"1:00u","_save":"0","letter":"-"}]},
        zones: {"Atlantic/Canary":[{"name":"Atlantic/Canary","_offset":"-1:01:36","_rule":"-","format":"LMT","_until":"1922 Mar"},{"name":"Atlantic/Canary","_offset":"-1:00","_rule":"-","format":"CANT","_until":"1946 Sep 30 1:00"},{"name":"Atlantic/Canary","_offset":"0:00","_rule":"-","format":"WET","_until":"1980 Apr 6 0:00s"},{"name":"Atlantic/Canary","_offset":"0:00","_rule":"1:00","format":"WEST","_until":"1980 Sep 28 0:00s"},{"name":"Atlantic/Canary","_offset":"0:00","_rule":"EU","format":"WE%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);