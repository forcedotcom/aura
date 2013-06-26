(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Cook":[{"name":"Cook","_from":"1978","_to":"only","type":"-","in":"Nov","on":"12","at":"0:00","_save":"0:30","letter":"HS"},{"name":"Cook","_from":"1979","_to":"1991","type":"-","in":"Mar","on":"Sun>=1","at":"0:00","_save":"0","letter":"-"},{"name":"Cook","_from":"1979","_to":"1990","type":"-","in":"Oct","on":"lastSun","at":"0:00","_save":"0:30","letter":"HS"}]},
        zones: {"Pacific/Rarotonga":[{"name":"Pacific/Rarotonga","_offset":"-10:39:04","_rule":"-","format":"LMT","_until":"1901"},{"name":"Pacific/Rarotonga","_offset":"-10:30","_rule":"-","format":"CKT","_until":"1978 Nov 12"},{"name":"Pacific/Rarotonga","_offset":"-10:00","_rule":"Cook","format":"CK%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);