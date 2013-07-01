(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"EU":[{"name":"EU","_from":"1977","_to":"1980","type":"-","in":"Apr","on":"Sun>=1","at":"1:00u","_save":"1:00","letter":"S"},{"name":"EU","_from":"1977","_to":"only","type":"-","in":"Sep","on":"lastSun","at":"1:00u","_save":"0","letter":"-"},{"name":"EU","_from":"1978","_to":"only","type":"-","in":"Oct","on":"1","at":"1:00u","_save":"0","letter":"-"},{"name":"EU","_from":"1979","_to":"1995","type":"-","in":"Sep","on":"lastSun","at":"1:00u","_save":"0","letter":"-"},{"name":"EU","_from":"1981","_to":"max","type":"-","in":"Mar","on":"lastSun","at":"1:00u","_save":"1:00","letter":"S"},{"name":"EU","_from":"1996","_to":"max","type":"-","in":"Oct","on":"lastSun","at":"1:00u","_save":"0","letter":"-"}]},
        zones: {"America/Godthab":[{"name":"America/Godthab","_offset":"-3:26:56","_rule":"-","format":"LMT","_until":"1916 Jul 28"},{"name":"America/Godthab","_offset":"-3:00","_rule":"-","format":"WGT","_until":"1980 Apr 6 2:00"},{"name":"America/Godthab","_offset":"-3:00","_rule":"EU","format":"WG%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);