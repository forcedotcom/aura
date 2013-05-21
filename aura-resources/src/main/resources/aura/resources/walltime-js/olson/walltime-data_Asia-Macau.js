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
        rules: {"Macau":[{"name":"Macau","_from":"1961","_to":"1962","type":"-","in":"Mar","on":"Sun>=16","at":"3:30","_save":"1:00","letter":"S"},{"name":"Macau","_from":"1961","_to":"1964","type":"-","in":"Nov","on":"Sun>=1","at":"3:30","_save":"0","letter":"-"},{"name":"Macau","_from":"1963","_to":"only","type":"-","in":"Mar","on":"Sun>=16","at":"0:00","_save":"1:00","letter":"S"},{"name":"Macau","_from":"1964","_to":"only","type":"-","in":"Mar","on":"Sun>=16","at":"3:30","_save":"1:00","letter":"S"},{"name":"Macau","_from":"1965","_to":"only","type":"-","in":"Mar","on":"Sun>=16","at":"0:00","_save":"1:00","letter":"S"},{"name":"Macau","_from":"1965","_to":"only","type":"-","in":"Oct","on":"31","at":"0:00","_save":"0","letter":"-"},{"name":"Macau","_from":"1966","_to":"1971","type":"-","in":"Apr","on":"Sun>=16","at":"3:30","_save":"1:00","letter":"S"},{"name":"Macau","_from":"1966","_to":"1971","type":"-","in":"Oct","on":"Sun>=16","at":"3:30","_save":"0","letter":"-"},{"name":"Macau","_from":"1972","_to":"1974","type":"-","in":"Apr","on":"Sun>=15","at":"0:00","_save":"1:00","letter":"S"},{"name":"Macau","_from":"1972","_to":"1973","type":"-","in":"Oct","on":"Sun>=15","at":"0:00","_save":"0","letter":"-"},{"name":"Macau","_from":"1974","_to":"1977","type":"-","in":"Oct","on":"Sun>=15","at":"3:30","_save":"0","letter":"-"},{"name":"Macau","_from":"1975","_to":"1977","type":"-","in":"Apr","on":"Sun>=15","at":"3:30","_save":"1:00","letter":"S"},{"name":"Macau","_from":"1978","_to":"1980","type":"-","in":"Apr","on":"Sun>=15","at":"0:00","_save":"1:00","letter":"S"},{"name":"Macau","_from":"1978","_to":"1980","type":"-","in":"Oct","on":"Sun>=15","at":"0:00","_save":"0","letter":"-"}],"PRC":[{"name":"PRC","_from":"1986","_to":"only","type":"-","in":"May","on":"4","at":"0:00","_save":"1:00","letter":"D"},{"name":"PRC","_from":"1986","_to":"1991","type":"-","in":"Sep","on":"Sun>=11","at":"0:00","_save":"0","letter":"S"},{"name":"PRC","_from":"1987","_to":"1991","type":"-","in":"Apr","on":"Sun>=10","at":"0:00","_save":"1:00","letter":"D"}]},
        zones: {"Asia/Macau":[{"name":"Asia/Macau","_offset":"7:34:20","_rule":"-","format":"LMT","_until":"1912"},{"name":"Asia/Macau","_offset":"8:00","_rule":"Macau","format":"MO%sT","_until":"1999 Dec 20"},{"name":"Asia/Macau","_offset":"8:00","_rule":"PRC","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);