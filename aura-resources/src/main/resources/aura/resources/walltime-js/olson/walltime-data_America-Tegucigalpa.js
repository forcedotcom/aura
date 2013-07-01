(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Hond":[{"name":"Hond","_from":"1987","_to":"1988","type":"-","in":"May","on":"Sun>=1","at":"0:00","_save":"1:00","letter":"D"},{"name":"Hond","_from":"1987","_to":"1988","type":"-","in":"Sep","on":"lastSun","at":"0:00","_save":"0","letter":"S"},{"name":"Hond","_from":"2006","_to":"only","type":"-","in":"May","on":"Sun>=1","at":"0:00","_save":"1:00","letter":"D"},{"name":"Hond","_from":"2006","_to":"only","type":"-","in":"Aug","on":"Mon>=1","at":"0:00","_save":"0","letter":"S"}]},
        zones: {"America/Tegucigalpa":[{"name":"America/Tegucigalpa","_offset":"-5:48:52","_rule":"-","format":"LMT","_until":"1921 Apr"},{"name":"America/Tegucigalpa","_offset":"-6:00","_rule":"Hond","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);