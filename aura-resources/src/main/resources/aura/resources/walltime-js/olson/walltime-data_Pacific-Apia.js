(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"WS":[{"name":"WS","_from":"2010","_to":"only","type":"-","in":"Sep","on":"lastSun","at":"0:00","_save":"1","letter":"D"},{"name":"WS","_from":"2011","_to":"only","type":"-","in":"Apr","on":"Sat>=1","at":"4:00","_save":"0","letter":"S"},{"name":"WS","_from":"2011","_to":"only","type":"-","in":"Sep","on":"lastSat","at":"3:00","_save":"1","letter":"D"},{"name":"WS","_from":"2012","_to":"max","type":"-","in":"Apr","on":"Sun>=1","at":"4:00","_save":"0","letter":"S"},{"name":"WS","_from":"2012","_to":"max","type":"-","in":"Sep","on":"lastSun","at":"3:00","_save":"1","letter":"D"}]},
        zones: {"Pacific/Apia":[{"name":"Pacific/Apia","_offset":"12:33:04","_rule":"-","format":"LMT","_until":"1879 Jul 5"},{"name":"Pacific/Apia","_offset":"-11:26:56","_rule":"-","format":"LMT","_until":"1911"},{"name":"Pacific/Apia","_offset":"-11:30","_rule":"-","format":"WSST","_until":"1950"},{"name":"Pacific/Apia","_offset":"-11:00","_rule":"WS","format":"S%sT","_until":"2011 Dec 29 24:00"},{"name":"Pacific/Apia","_offset":"13:00","_rule":"WS","format":"WS%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);
