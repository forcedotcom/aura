(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Mauritius":[{"name":"Mauritius","_from":"1982","_to":"only","type":"-","in":"Oct","on":"10","at":"0:00","_save":"1:00","letter":"S"},{"name":"Mauritius","_from":"1983","_to":"only","type":"-","in":"Mar","on":"21","at":"0:00","_save":"0","letter":"-"},{"name":"Mauritius","_from":"2008","_to":"only","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"1:00","letter":"S"},{"name":"Mauritius","_from":"2009","_to":"only","type":"-","in":"Mar","on":"lastSun","at":"2:00","_save":"0","letter":"-"}]},
        zones: {"Indian/Mauritius":[{"name":"Indian/Mauritius","_offset":"3:50:00","_rule":"-","format":"LMT","_until":"1907"},{"name":"Indian/Mauritius","_offset":"4:00","_rule":"Mauritius","format":"MU%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);