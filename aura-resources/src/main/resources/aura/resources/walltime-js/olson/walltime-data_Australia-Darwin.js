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
        rules: {"Aus":[{"name":"Aus","_from":"1917","_to":"only","type":"-","in":"Jan","on":"1","at":"0:01","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1917","_to":"only","type":"-","in":"Mar","on":"25","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Jan","on":"1","at":"2:00","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Mar","on":"29","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1942","_to":"only","type":"-","in":"Sep","on":"27","at":"2:00","_save":"1:00","letter":"-"},{"name":"Aus","_from":"1943","_to":"1944","type":"-","in":"Mar","on":"lastSun","at":"2:00","_save":"0","letter":"-"},{"name":"Aus","_from":"1943","_to":"only","type":"-","in":"Oct","on":"3","at":"2:00","_save":"1:00","letter":"-"}]},
        zones: {"Australia/Darwin":[{"name":"Australia/Darwin","_offset":"8:43:20","_rule":"-","format":"LMT","_until":"1895 Feb"},{"name":"Australia/Darwin","_offset":"9:00","_rule":"-","format":"CST","_until":"1899 May"},{"name":"Australia/Darwin","_offset":"9:30","_rule":"Aus","format":"CST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);