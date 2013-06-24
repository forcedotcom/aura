(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Fiji":[{"name":"Fiji","_from":"1998","_to":"1999","type":"-","in":"Nov","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"S"},{"name":"Fiji","_from":"1999","_to":"2000","type":"-","in":"Feb","on":"lastSun","at":"3:00","_save":"0","letter":"-"},{"name":"Fiji","_from":"2009","_to":"only","type":"-","in":"Nov","on":"29","at":"2:00","_save":"1:00","letter":"S"},{"name":"Fiji","_from":"2010","_to":"only","type":"-","in":"Mar","on":"lastSun","at":"3:00","_save":"0","letter":"-"},{"name":"Fiji","_from":"2010","_to":"max","type":"-","in":"Oct","on":"Sun>=18","at":"2:00","_save":"1:00","letter":"S"},{"name":"Fiji","_from":"2011","_to":"only","type":"-","in":"Mar","on":"Sun>=1","at":"3:00","_save":"0","letter":"-"},{"name":"Fiji","_from":"2012","_to":"max","type":"-","in":"Jan","on":"Sun>=18","at":"3:00","_save":"0","letter":"-"}]},
        zones: {"Pacific/Fiji":[{"name":"Pacific/Fiji","_offset":"11:53:40","_rule":"-","format":"LMT","_until":"1915 Oct 26"},{"name":"Pacific/Fiji","_offset":"12:00","_rule":"Fiji","format":"FJ%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);