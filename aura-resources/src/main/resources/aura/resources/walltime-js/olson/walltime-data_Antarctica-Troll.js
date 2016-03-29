(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Troll":[{"name":"Troll","_from":"2005","_to":"max","type":"-","in":"Mar","on":"lastSun","at":"1:00u","_save":"2:00","letter":"CEST"},{"name":"Troll","_from":"2004","_to":"max","type":"-","in":"Oct","on":"lastSun","at":"1:00u","_save":"0:00","letter":"UTC"}]},
        zones: {"Antarctica/Troll":[{"name":"Antarctica/Troll","_offset":"0","_rule":"-","format":"zzz","_until":"2005 Feb 12"},{"name":"Antarctica/Troll","_offset":"0:00","_rule":"Troll","format":"%s","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);
