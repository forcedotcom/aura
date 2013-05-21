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
        rules: {"Tonga":[{"name":"Tonga","_from":"1999","_to":"only","type":"-","in":"Oct","on":"7","at":"2:00s","_save":"1:00","letter":"S"},{"name":"Tonga","_from":"2000","_to":"only","type":"-","in":"Mar","on":"19","at":"2:00s","_save":"0","letter":"-"},{"name":"Tonga","_from":"2000","_to":"2001","type":"-","in":"Nov","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"S"},{"name":"Tonga","_from":"2001","_to":"2002","type":"-","in":"Jan","on":"lastSun","at":"2:00","_save":"0","letter":"-"}]},
        zones: {"Pacific/Tongatapu":[{"name":"Pacific/Tongatapu","_offset":"12:19:20","_rule":"-","format":"LMT","_until":"1901"},{"name":"Pacific/Tongatapu","_offset":"12:20","_rule":"-","format":"TOT","_until":"1941"},{"name":"Pacific/Tongatapu","_offset":"13:00","_rule":"-","format":"TOT","_until":"1999"},{"name":"Pacific/Tongatapu","_offset":"13:00","_rule":"Tonga","format":"TO%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);