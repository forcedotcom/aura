/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ 
(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"Iceland":[{"name":"Iceland","_from":"1917","_to":"1918","type":"-","in":"Feb","on":"19","at":"23:00","_save":"1:00","letter":"S"},{"name":"Iceland","_from":"1917","_to":"only","type":"-","in":"Oct","on":"21","at":"1:00","_save":"0","letter":"-"},{"name":"Iceland","_from":"1918","_to":"only","type":"-","in":"Nov","on":"16","at":"1:00","_save":"0","letter":"-"},{"name":"Iceland","_from":"1939","_to":"only","type":"-","in":"Apr","on":"29","at":"23:00","_save":"1:00","letter":"S"},{"name":"Iceland","_from":"1939","_to":"only","type":"-","in":"Nov","on":"29","at":"2:00","_save":"0","letter":"-"},{"name":"Iceland","_from":"1940","_to":"only","type":"-","in":"Feb","on":"25","at":"2:00","_save":"1:00","letter":"S"},{"name":"Iceland","_from":"1940","_to":"only","type":"-","in":"Nov","on":"3","at":"2:00","_save":"0","letter":"-"},{"name":"Iceland","_from":"1941","_to":"only","type":"-","in":"Mar","on":"2","at":"1:00s","_save":"1:00","letter":"S"},{"name":"Iceland","_from":"1941","_to":"only","type":"-","in":"Nov","on":"2","at":"1:00s","_save":"0","letter":"-"},{"name":"Iceland","_from":"1942","_to":"only","type":"-","in":"Mar","on":"8","at":"1:00s","_save":"1:00","letter":"S"},{"name":"Iceland","_from":"1942","_to":"only","type":"-","in":"Oct","on":"25","at":"1:00s","_save":"0","letter":"-"},{"name":"Iceland","_from":"1943","_to":"1946","type":"-","in":"Mar","on":"Sun>=1","at":"1:00s","_save":"1:00","letter":"S"},{"name":"Iceland","_from":"1943","_to":"1948","type":"-","in":"Oct","on":"Sun>=22","at":"1:00s","_save":"0","letter":"-"},{"name":"Iceland","_from":"1947","_to":"1967","type":"-","in":"Apr","on":"Sun>=1","at":"1:00s","_save":"1:00","letter":"S"},{"name":"Iceland","_from":"1949","_to":"only","type":"-","in":"Oct","on":"30","at":"1:00s","_save":"0","letter":"-"},{"name":"Iceland","_from":"1950","_to":"1966","type":"-","in":"Oct","on":"Sun>=22","at":"1:00s","_save":"0","letter":"-"},{"name":"Iceland","_from":"1967","_to":"only","type":"-","in":"Oct","on":"29","at":"1:00s","_save":"0","letter":"-"}]},
        zones: {"Atlantic/Reykjavik":[{"name":"Atlantic/Reykjavik","_offset":"-1:27:24","_rule":"-","format":"LMT","_until":"1837"},{"name":"Atlantic/Reykjavik","_offset":"-1:27:48","_rule":"-","format":"RMT","_until":"1908"},{"name":"Atlantic/Reykjavik","_offset":"-1:00","_rule":"Iceland","format":"IS%sT","_until":"1968 Apr 7 1:00s"},{"name":"Atlantic/Reykjavik","_offset":"0:00","_rule":"-","format":"GMT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);