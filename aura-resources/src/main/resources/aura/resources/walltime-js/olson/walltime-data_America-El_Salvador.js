(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Salv":[{"name":"Salv","_from":"1987","_to":"1988","type":"-","in":"May","on":"Sun>=1","at":"0:00","_save":"1:00","letter":"D"},{"name":"Salv","_from":"1987","_to":"1988","type":"-","in":"Sep","on":"lastSun","at":"0:00","_save":"0","letter":"S"}]},
        zones: {"America/El_Salvador":[{"name":"America/El_Salvador","_offset":"-5:56:48","_rule":"-","format":"LMT","_until":"1921"},{"name":"America/El_Salvador","_offset":"-6:00","_rule":"Salv","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);