(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"TC":[{"name":"TC","_from":"1979","_to":"1986","type":"-","in":"Apr","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"TC","_from":"1979","_to":"2006","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"TC","_from":"1987","_to":"2006","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"TC","_from":"2007","_to":"max","type":"-","in":"Mar","on":"Sun>=8","at":"2:00","_save":"1:00","letter":"D"},{"name":"TC","_from":"2007","_to":"max","type":"-","in":"Nov","on":"Sun>=1","at":"2:00","_save":"0","letter":"S"}]},
        zones: {"America/Grand_Turk":[{"name":"America/Grand_Turk","_offset":"-4:44:32","_rule":"-","format":"LMT","_until":"1890"},{"name":"America/Grand_Turk","_offset":"-5:07:12","_rule":"-","format":"KMT","_until":"1912 Feb"},{"name":"America/Grand_Turk","_offset":"-5:00","_rule":"TC","format":"E%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);