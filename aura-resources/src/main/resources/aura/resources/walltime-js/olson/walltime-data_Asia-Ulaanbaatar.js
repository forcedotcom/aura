(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Mongol":[{"name":"Mongol","_from":"1983","_to":"1984","type":"-","in":"Apr","on":"1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Mongol","_from":"1983","_to":"only","type":"-","in":"Oct","on":"1","at":"0:00","_save":"0","letter":"-"},{"name":"Mongol","_from":"1985","_to":"1998","type":"-","in":"Mar","on":"lastSun","at":"0:00","_save":"1:00","letter":"S"},{"name":"Mongol","_from":"1984","_to":"1998","type":"-","in":"Sep","on":"lastSun","at":"0:00","_save":"0","letter":"-"},{"name":"Mongol","_from":"2001","_to":"only","type":"-","in":"Apr","on":"lastSat","at":"2:00","_save":"1:00","letter":"S"},{"name":"Mongol","_from":"2001","_to":"2006","type":"-","in":"Sep","on":"lastSat","at":"2:00","_save":"0","letter":"-"},{"name":"Mongol","_from":"2002","_to":"2006","type":"-","in":"Mar","on":"lastSat","at":"2:00","_save":"1:00","letter":"S"}]},
        zones: {"Asia/Ulaanbaatar":[{"name":"Asia/Ulaanbaatar","_offset":"7:07:32","_rule":"-","format":"LMT","_until":"1905 Aug"},{"name":"Asia/Ulaanbaatar","_offset":"7:00","_rule":"-","format":"ULAT","_until":"1978"},{"name":"Asia/Ulaanbaatar","_offset":"8:00","_rule":"Mongol","format":"ULA%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);