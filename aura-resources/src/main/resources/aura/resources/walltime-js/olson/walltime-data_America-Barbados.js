(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Barb":[{"name":"Barb","_from":"1977","_to":"only","type":"-","in":"Jun","on":"12","at":"2:00","_save":"1:00","letter":"D"},{"name":"Barb","_from":"1977","_to":"1978","type":"-","in":"Oct","on":"Sun>=1","at":"2:00","_save":"0","letter":"S"},{"name":"Barb","_from":"1978","_to":"1980","type":"-","in":"Apr","on":"Sun>=15","at":"2:00","_save":"1:00","letter":"D"},{"name":"Barb","_from":"1979","_to":"only","type":"-","in":"Sep","on":"30","at":"2:00","_save":"0","letter":"S"},{"name":"Barb","_from":"1980","_to":"only","type":"-","in":"Sep","on":"25","at":"2:00","_save":"0","letter":"S"}]},
        zones: {"America/Barbados":[{"name":"America/Barbados","_offset":"-3:58:28","_rule":"-","format":"LMT","_until":"1924"},{"name":"America/Barbados","_offset":"-3:58:28","_rule":"-","format":"BMT","_until":"1932"},{"name":"America/Barbados","_offset":"-4:00","_rule":"Barb","format":"A%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);