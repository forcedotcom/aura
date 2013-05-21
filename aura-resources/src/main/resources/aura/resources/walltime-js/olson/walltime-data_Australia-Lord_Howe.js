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
        rules: {"LH":[{"name":"LH","_from":"1981","_to":"1984","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"1:00","letter":"-"},{"name":"LH","_from":"1982","_to":"1985","type":"-","in":"Mar","on":"Sun>=1","at":"2:00","_save":"0","letter":"-"},{"name":"LH","_from":"1985","_to":"only","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0:30","letter":"-"},{"name":"LH","_from":"1986","_to":"1989","type":"-","in":"Mar","on":"Sun>=15","at":"2:00","_save":"0","letter":"-"},{"name":"LH","_from":"1986","_to":"only","type":"-","in":"Oct","on":"19","at":"2:00","_save":"0:30","letter":"-"},{"name":"LH","_from":"1987","_to":"1999","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0:30","letter":"-"},{"name":"LH","_from":"1990","_to":"1995","type":"-","in":"Mar","on":"Sun>=1","at":"2:00","_save":"0","letter":"-"},{"name":"LH","_from":"1996","_to":"2005","type":"-","in":"Mar","on":"lastSun","at":"2:00","_save":"0","letter":"-"},{"name":"LH","_from":"2000","_to":"only","type":"-","in":"Aug","on":"lastSun","at":"2:00","_save":"0:30","letter":"-"},{"name":"LH","_from":"2001","_to":"2007","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0:30","letter":"-"},{"name":"LH","_from":"2006","_to":"only","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"0","letter":"-"},{"name":"LH","_from":"2007","_to":"only","type":"-","in":"Mar","on":"lastSun","at":"2:00","_save":"0","letter":"-"},{"name":"LH","_from":"2008","_to":"max","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"0","letter":"-"},{"name":"LH","_from":"2008","_to":"max","type":"-","in":"Oct","on":"Sun>=1","at":"2:00","_save":"0:30","letter":"-"}]},
        zones: {"Australia/Lord_Howe":[{"name":"Australia/Lord_Howe","_offset":"10:36:20","_rule":"-","format":"LMT","_until":"1895 Feb"},{"name":"Australia/Lord_Howe","_offset":"10:00","_rule":"-","format":"EST","_until":"1981 Mar"},{"name":"Australia/Lord_Howe","_offset":"10:30","_rule":"LH","format":"LHST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);