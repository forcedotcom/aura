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
        rules: {"US":[{"name":"US","_from":"1918","_to":"1919","type":"-","in":"Mar","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"1918","_to":"1919","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"US","_from":"1942","_to":"only","type":"-","in":"Feb","on":"9","at":"2:00","_save":"1:00","letter":"W"},{"name":"US","_from":"1945","_to":"only","type":"-","in":"Aug","on":"14","at":"23:00u","_save":"1:00","letter":"P"},{"name":"US","_from":"1945","_to":"only","type":"-","in":"Sep","on":"30","at":"2:00","_save":"0","letter":"S"},{"name":"US","_from":"1967","_to":"2006","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"US","_from":"1967","_to":"1973","type":"-","in":"Apr","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"1974","_to":"only","type":"-","in":"Jan","on":"6","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"1975","_to":"only","type":"-","in":"Feb","on":"23","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"1976","_to":"1986","type":"-","in":"Apr","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"1987","_to":"2006","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"2007","_to":"max","type":"-","in":"Mar","on":"Sun>=8","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"2007","_to":"max","type":"-","in":"Nov","on":"Sun>=1","at":"2:00","_save":"0","letter":"S"}],"Indianapolis":[{"name":"Indianapolis","_from":"1941","_to":"only","type":"-","in":"Jun","on":"22","at":"2:00","_save":"1:00","letter":"D"},{"name":"Indianapolis","_from":"1941","_to":"1954","type":"-","in":"Sep","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"Indianapolis","_from":"1946","_to":"1954","type":"-","in":"Apr","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"}]},
        zones: {"America/Indiana/Indianapolis":[{"name":"America/Indiana/Indianapolis","_offset":"-5:44:38","_rule":"-","format":"LMT","_until":"1883 Nov 18 12:15:22"},{"name":"America/Indiana/Indianapolis","_offset":"-6:00","_rule":"US","format":"C%sT","_until":"1920"},{"name":"America/Indiana/Indianapolis","_offset":"-6:00","_rule":"Indianapolis","format":"C%sT","_until":"1942"},{"name":"America/Indiana/Indianapolis","_offset":"-6:00","_rule":"US","format":"C%sT","_until":"1946"},{"name":"America/Indiana/Indianapolis","_offset":"-6:00","_rule":"Indianapolis","format":"C%sT","_until":"1955 Apr 24 2:00"},{"name":"America/Indiana/Indianapolis","_offset":"-5:00","_rule":"-","format":"EST","_until":"1957 Sep 29 2:00"},{"name":"America/Indiana/Indianapolis","_offset":"-6:00","_rule":"-","format":"CST","_until":"1958 Apr 27 2:00"},{"name":"America/Indiana/Indianapolis","_offset":"-5:00","_rule":"-","format":"EST","_until":"1969"},{"name":"America/Indiana/Indianapolis","_offset":"-5:00","_rule":"US","format":"E%sT","_until":"1971"},{"name":"America/Indiana/Indianapolis","_offset":"-5:00","_rule":"-","format":"EST","_until":"2006"},{"name":"America/Indiana/Indianapolis","_offset":"-5:00","_rule":"US","format":"E%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);