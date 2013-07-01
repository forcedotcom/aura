(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Namibia":[{"name":"Namibia","_from":"1994","_to":"max","type":"-","in":"Sep","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"S"},{"name":"Namibia","_from":"1995","_to":"max","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"0","letter":"-"}]},
        zones: {"Africa/Windhoek":[{"name":"Africa/Windhoek","_offset":"1:08:24","_rule":"-","format":"LMT","_until":"1892 Feb 8"},{"name":"Africa/Windhoek","_offset":"1:30","_rule":"-","format":"SWAT","_until":"1903 Mar"},{"name":"Africa/Windhoek","_offset":"2:00","_rule":"-","format":"SAST","_until":"1942 Sep 20 2:00"},{"name":"Africa/Windhoek","_offset":"2:00","_rule":"1:00","format":"SAST","_until":"1943 Mar 21 2:00"},{"name":"Africa/Windhoek","_offset":"2:00","_rule":"-","format":"SAST","_until":"1990 Mar 21"},{"name":"Africa/Windhoek","_offset":"2:00","_rule":"-","format":"CAT","_until":"1994 Apr 3"},{"name":"Africa/Windhoek","_offset":"1:00","_rule":"Namibia","format":"WA%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);