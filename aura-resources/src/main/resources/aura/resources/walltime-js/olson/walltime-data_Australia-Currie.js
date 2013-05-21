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
        rules: {"Aus":[{"name":"Aus","_from":"1917","_to":"only","type":"-","in":"Jan","on":"1","at":"0:01","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1917","_to":"only","type":"-","in":"Mar","on":"25","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Jan","on":"1","at":"2:00","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Mar","on":"29","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Sep","on":"27","at":"2:00","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1943","_to":"1944","type":"-","in":"Mar","on":"lastSun","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1943","_to":"only","type":"-","in":"Oct","on":"3","at":"2:00","_save":"1:00","letter":"-"}],"AT":[{"name":"AT","_from":"1967","_to":"only","type":"-","in":"Oct","on":"Sun>=1","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AT","_from":"1968","_to":"only","type":"-","in":"Mar","on":"lastSun","at":"2:00s","_save":"0","letter":"-"},{"name":"AT","_from":"1968","_to":"1985","type":"-","in":"Oct","on":"lastSun","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AT","_from":"1969","_to":"1971","type":"-","in":"Mar","on":"Sun>=8","at":"2:00s","_save":"0","letter":"-"},{"name":"AT","_from":"1972","_to":"only","type":"-","in":"Feb","on":"lastSun","at":"2:00s","_save":"0","letter":"-"},{"name":"AT","_from":"1973","_to":"1981","type":"-","in":"Mar","on":"Sun>=1","at":"2:00s","_save":"0","letter":"-"},{"name":"AT","_from":"1982","_to":"1983","type":"-","in":"Mar","on":"lastSun","at":"2:00s","_save":"0","letter":"-"},{"name":"AT","_from":"1984","_to":"1986","type":"-","in":"Mar","on":"Sun>=1","at":"2:00s","_save":"0","letter":"-"},{"name":"AT","_from":"1986","_to":"only","type":"-","in":"Oct","on":"Sun>=15","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AT","_from":"1987","_to":"1990","type":"-","in":"Mar","on":"Sun>=15","at":"2:00s","_save":"0","letter":"-"},{"name":"AT","_from":"1987","_to":"only","type":"-","in":"Oct","on":"Sun>=22","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AT","_from":"1988","_to":"1990","type":"-","in":"Oct","on":"lastSun","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AT","_from":"1991","_to":"1999","type":"-","in":"Oct","on":"Sun>=1","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AT","_from":"1991","_to":"2005","type":"-","in":"Mar","on":"lastSun","at":"2:00s","_save":"0","letter":"-"},{"name":"AT","_from":"2000","_to":"only","type":"-","in":"Aug","on":"lastSun","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AT","_from":"2001","_to":"max","type":"-","in":"Oct","on":"Sun>=1","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AT","_from":"2006","_to":"only","type":"-","in":"Apr","on":"Sun>=1","at":"2:00s","_save":"0","letter":"-"},{"name":"AT","_from":"2007","_to":"only","type":"-","in":"Mar","on":"lastSun","at":"2:00s","_save":"0","letter":"-"},{"name":"AT","_from":"2008","_to":"max","type":"-","in":"Apr","on":"Sun>=1","at":"2:00s","_save":"0","letter":"-"}]},
        zones: {"Australia/Currie":[{"name":"Australia/Currie","_offset":"9:35:28","_rule":"-","format":"LMT","_until":"1895 Sep"},{"name":"Australia/Currie","_offset":"10:00","_rule":"-","format":"EST","_until":"1916 Oct 1 2:00"},{"name":"Australia/Currie","_offset":"10:00","_rule":"1:00","format":"EST","_until":"1917 Feb"},{"name":"Australia/Currie","_offset":"10:00","_rule":"Aus","format":"EST","_until":"1971 Jul"},{"name":"Australia/Currie","_offset":"10:00","_rule":"AT","format":"EST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);