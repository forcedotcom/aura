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
        rules: {"Aus":[{"name":"Aus","_from":"1917","_to":"only","type":"-","in":"Jan","on":"1","at":"0:01","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1917","_to":"only","type":"-","in":"Mar","on":"25","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Jan","on":"1","at":"2:00","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Mar","on":"29","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Sep","on":"27","at":"2:00","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1943","_to":"1944","type":"-","in":"Mar","on":"lastSun","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1943","_to":"only","type":"-","in":"Oct","on":"3","at":"2:00","_save":"1:00","letter":"-"}],"AV":[{"name":"AV","_from":"1971","_to":"1985","type":"-","in":"Oct","on":"lastSun","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AV","_from":"1972","_to":"only","type":"-","in":"Feb","on":"lastSun","at":"2:00s","_save":"0","letter":"-"},{"name":"AV","_from":"1973","_to":"1985","type":"-","in":"Mar","on":"Sun>=1","at":"2:00s","_save":"0","letter":"-"},{"name":"AV","_from":"1986","_to":"1990","type":"-","in":"Mar","on":"Sun>=15","at":"2:00s","_save":"0","letter":"-"},{"name":"AV","_from":"1986","_to":"1987","type":"-","in":"Oct","on":"Sun>=15","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AV","_from":"1988","_to":"1999","type":"-","in":"Oct","on":"lastSun","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AV","_from":"1991","_to":"1994","type":"-","in":"Mar","on":"Sun>=1","at":"2:00s","_save":"0","letter":"-"},{"name":"AV","_from":"1995","_to":"2005","type":"-","in":"Mar","on":"lastSun","at":"2:00s","_save":"0","letter":"-"},{"name":"AV","_from":"2000","_to":"only","type":"-","in":"Aug","on":"lastSun","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AV","_from":"2001","_to":"2007","type":"-","in":"Oct","on":"lastSun","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AV","_from":"2006","_to":"only","type":"-","in":"Apr","on":"Sun>=1","at":"2:00s","_save":"0","letter":"-"},{"name":"AV","_from":"2007","_to":"only","type":"-","in":"Mar","on":"lastSun","at":"2:00s","_save":"0","letter":"-"},{"name":"AV","_from":"2008","_to":"max","type":"-","in":"Apr","on":"Sun>=1","at":"2:00s","_save":"0","letter":"-"},{"name":"AV","_from":"2008","_to":"max","type":"-","in":"Oct","on":"Sun>=1","at":"2:00s","_save":"1:00","letter":"-"}]},
        zones: {"Australia/Melbourne":[{"name":"Australia/Melbourne","_offset":"9:39:52","_rule":"-","format":"LMT","_until":"1895 Feb"},{"name":"Australia/Melbourne","_offset":"10:00","_rule":"Aus","format":"EST","_until":"1971"},{"name":"Australia/Melbourne","_offset":"10:00","_rule":"AV","format":"EST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);