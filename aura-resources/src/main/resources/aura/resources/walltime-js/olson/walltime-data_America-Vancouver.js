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
        rules: {"Vanc":[{"name":"Vanc","_from":"1918","_to":"only","type":"-","in":"Apr","on":"14","at":"2:00","_save":"1:00","letter":"D"},{"name":"Vanc","_from":"1918","_to":"only","type":"-","in":"Oct","on":"27","at":"2:00","_save":"0","letter":"S"},{"name":"Vanc","_from":"1942","_to":"only","type":"-","in":"Feb","on":"9","at":"2:00","_save":"1:00","letter":"W"},{"name":"Vanc","_from":"1945","_to":"only","type":"-","in":"Aug","on":"14","at":"23:00u","_save":"1:00","letter":"P"},{"name":"Vanc","_from":"1945","_to":"only","type":"-","in":"Sep","on":"30","at":"2:00","_save":"0","letter":"S"},{"name":"Vanc","_from":"1946","_to":"1986","type":"-","in":"Apr","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"Vanc","_from":"1946","_to":"only","type":"-","in":"Oct","on":"13","at":"2:00","_save":"0","letter":"S"},{"name":"Vanc","_from":"1947","_to":"1961","type":"-","in":"Sep","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"Vanc","_from":"1962","_to":"2006","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"}],"Canada":[{"name":"Canada","_from":"1918","_to":"only","type":"-","in":"Apr","on":"14","at":"2:00","_save":"1:00","letter":"D"},{"name":"Canada","_from":"1918","_to":"only","type":"-","in":"Oct","on":"27","at":"2:00","_save":"0","letter":"S"},{"name":"Canada","_from":"1942","_to":"only","type":"-","in":"Feb","on":"9","at":"2:00","_save":"1:00","letter":"W"},{"name":"Canada","_from":"1945","_to":"only","type":"-","in":"Aug","on":"14","at":"23:00u","_save":"1:00","letter":"P"},{"name":"Canada","_from":"1945","_to":"only","type":"-","in":"Sep","on":"30","at":"2:00","_save":"0","letter":"S"},{"name":"Canada","_from":"1974","_to":"1986","type":"-","in":"Apr","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"Canada","_from":"1974","_to":"2006","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"Canada","_from":"1987","_to":"2006","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"Canada","_from":"2007","_to":"max","type":"-","in":"Mar","on":"Sun>=8","at":"2:00","_save":"1:00","letter":"D"},{"name":"Canada","_from":"2007","_to":"max","type":"-","in":"Nov","on":"Sun>=1","at":"2:00","_save":"0","letter":"S"}]},
        zones: {"America/Vancouver":[{"name":"America/Vancouver","_offset":"-8:12:28","_rule":"-","format":"LMT","_until":"1884"},{"name":"America/Vancouver","_offset":"-8:00","_rule":"Vanc","format":"P%sT","_until":"1987"},{"name":"America/Vancouver","_offset":"-8:00","_rule":"Canada","format":"P%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);