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
        rules: {"Aus":[{"name":"Aus","_from":"1917","_to":"only","type":"-","in":"Jan","on":"1","at":"0:01","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1917","_to":"only","type":"-","in":"Mar","on":"25","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Jan","on":"1","at":"2:00","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Mar","on":"29","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Sep","on":"27","at":"2:00","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1943","_to":"1944","type":"-","in":"Mar","on":"lastSun","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1943","_to":"only","type":"-","in":"Oct","on":"3","at":"2:00","_save":"1:00","letter":"-"}],"AW":[{"name":"AW","_from":"1974","_to":"only","type":"-","in":"Oct","on":"lastSun","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AW","_from":"1975","_to":"only","type":"-","in":"Mar","on":"Sun>=1","at":"2:00s","_save":"0","letter":"-"},{"name":"AW","_from":"1983","_to":"only","type":"-","in":"Oct","on":"lastSun","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AW","_from":"1984","_to":"only","type":"-","in":"Mar","on":"Sun>=1","at":"2:00s","_save":"0","letter":"-"},{"name":"AW","_from":"1991","_to":"only","type":"-","in":"Nov","on":"17","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AW","_from":"1992","_to":"only","type":"-","in":"Mar","on":"Sun>=1","at":"2:00s","_save":"0","letter":"-"},{"name":"AW","_from":"2006","_to":"only","type":"-","in":"Dec","on":"3","at":"2:00s","_save":"1:00","letter":"-"},{"name":"AW","_from":"2007","_to":"2009","type":"-","in":"Mar","on":"lastSun","at":"2:00s","_save":"0","letter":"-"},{"name":"AW","_from":"2007","_to":"2008","type":"-","in":"Oct","on":"lastSun","at":"2:00s","_save":"1:00","letter":"-"}]},
        zones: {"Australia/Eucla":[{"name":"Australia/Eucla","_offset":"8:35:28","_rule":"-","format":"LMT","_until":"1895 Dec"},{"name":"Australia/Eucla","_offset":"8:45","_rule":"Aus","format":"CWST","_until":"1943 Jul"},{"name":"Australia/Eucla","_offset":"8:45","_rule":"AW","format":"CWST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);