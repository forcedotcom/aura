(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"CR":[{"name":"CR","_from":"1979","_to":"1980","type":"-","in":"Feb","on":"lastSun","at":"0:00","_save":"1:00","letter":"D"},{"name":"CR","_from":"1979","_to":"1980","type":"-","in":"Jun","on":"Sun>=1","at":"0:00","_save":"0","letter":"S"},{"name":"CR","_from":"1991","_to":"1992","type":"-","in":"Jan","on":"Sat>=15","at":"0:00","_save":"1:00","letter":"D"},{"name":"CR","_from":"1991","_to":"only","type":"-","in":"Jul","on":"1","at":"0:00","_save":"0","letter":"S"},{"name":"CR","_from":"1992","_to":"only","type":"-","in":"Mar","on":"15","at":"0:00","_save":"0","letter":"S"}]},
        zones: {"America/Costa_Rica":[{"name":"America/Costa_Rica","_offset":"-5:36:20","_rule":"-","format":"LMT","_until":"1890"},{"name":"America/Costa_Rica","_offset":"-5:36:20","_rule":"-","format":"SJMT","_until":"1921 Jan 15"},{"name":"America/Costa_Rica","_offset":"-6:00","_rule":"CR","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);