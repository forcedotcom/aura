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
        rules: {"NT_YK":[{"name":"NT_YK","_from":"1918","_to":"only","type":"-","in":"Apr","on":"14","at":"2:00","_save":"1:00","letter":"D"},{"name":"NT_YK","_from":"1918","_to":"only","type":"-","in":"Oct","on":"27","at":"2:00","_save":"0","letter":"S"},{"name":"NT_YK","_from":"1919","_to":"only","type":"-","in":"May","on":"25","at":"2:00","_save":"1:00","letter":"D"},{"name":"NT_YK","_from":"1919","_to":"only","type":"-","in":"Nov","on":"1","at":"0:00","_save":"0","letter":"S"},{"name":"NT_YK","_from":"1942","_to":"only","type":"-","in":"Feb","on":"9","at":"2:00","_save":"1:00","letter":"W"},{"name":"NT_YK","_from":"1945","_to":"only","type":"-","in":"Aug","on":"14","at":"23:00u","_save":"1:00","letter":"P"},{"name":"NT_YK","_from":"1945","_to":"only","type":"-","in":"Sep","on":"30","at":"2:00","_save":"0","letter":"S"},{"name":"NT_YK","_from":"1965","_to":"only","type":"-","in":"Apr","on":"lastSun","at":"0:00","_save":"2:00","letter":"DD"},{"name":"NT_YK","_from":"1965","_to":"only","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"NT_YK","_from":"1980","_to":"1986","type":"-","in":"Apr","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"NT_YK","_from":"1980","_to":"2006","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"NT_YK","_from":"1987","_to":"2006","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"}],"Canada":[{"name":"Canada","_from":"1918","_to":"only","type":"-","in":"Apr","on":"14","at":"2:00","_save":"1:00","letter":"D"},{"name":"Canada","_from":"1918","_to":"only","type":"-","in":"Oct","on":"27","at":"2:00","_save":"0","letter":"S"},{"name":"Canada","_from":"1942","_to":"only","type":"-","in":"Feb","on":"9","at":"2:00","_save":"1:00","letter":"W"},{"name":"Canada","_from":"1945","_to":"only","type":"-","in":"Aug","on":"14","at":"23:00u","_save":"1:00","letter":"P"},{"name":"Canada","_from":"1945","_to":"only","type":"-","in":"Sep","on":"30","at":"2:00","_save":"0","letter":"S"},{"name":"Canada","_from":"1974","_to":"1986","type":"-","in":"Apr","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"Canada","_from":"1974","_to":"2006","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"Canada","_from":"1987","_to":"2006","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"Canada","_from":"2007","_to":"max","type":"-","in":"Mar","on":"Sun>=8","at":"2:00","_save":"1:00","letter":"D"},{"name":"Canada","_from":"2007","_to":"max","type":"-","in":"Nov","on":"Sun>=1","at":"2:00","_save":"0","letter":"S"}]},
        zones: {"America/Rankin_Inlet":[{"name":"America/Rankin_Inlet","_offset":"0","_rule":"-","format":"zzz","_until":"1957"},{"name":"America/Rankin_Inlet","_offset":"-6:00","_rule":"NT_YK","format":"C%sT","_until":"2000 Oct 29 2:00"},{"name":"America/Rankin_Inlet","_offset":"-5:00","_rule":"-","format":"EST","_until":"2001 Apr 1 3:00"},{"name":"America/Rankin_Inlet","_offset":"-6:00","_rule":"Canada","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);