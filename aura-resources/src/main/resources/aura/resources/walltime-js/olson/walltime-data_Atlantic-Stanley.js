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
        rules: {"Falk":[{"name":"Falk","_from":"1937","_to":"1938","type":"-","in":"Sep","on":"lastSun","at":"0:00","_save":"1:00","letter":"S"},{"name":"Falk","_from":"1938","_to":"1942","type":"-","in":"Mar","on":"Sun>=19","at":"0:00","_save":"0","letter":"-"},{"name":"Falk","_from":"1939","_to":"only","type":"-","in":"Oct","on":"1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Falk","_from":"1940","_to":"1942","type":"-","in":"Sep","on":"lastSun","at":"0:00","_save":"1:00","letter":"S"},{"name":"Falk","_from":"1943","_to":"only","type":"-","in":"Jan","on":"1","at":"0:00","_save":"0","letter":"-"},{"name":"Falk","_from":"1983","_to":"only","type":"-","in":"Sep","on":"lastSun","at":"0:00","_save":"1:00","letter":"S"},{"name":"Falk","_from":"1984","_to":"1985","type":"-","in":"Apr","on":"lastSun","at":"0:00","_save":"0","letter":"-"},{"name":"Falk","_from":"1984","_to":"only","type":"-","in":"Sep","on":"16","at":"0:00","_save":"1:00","letter":"S"},{"name":"Falk","_from":"1985","_to":"2000","type":"-","in":"Sep","on":"Sun>=9","at":"0:00","_save":"1:00","letter":"S"},{"name":"Falk","_from":"1986","_to":"2000","type":"-","in":"Apr","on":"Sun>=16","at":"0:00","_save":"0","letter":"-"},{"name":"Falk","_from":"2001","_to":"2010","type":"-","in":"Apr","on":"Sun>=15","at":"2:00","_save":"0","letter":"-"},{"name":"Falk","_from":"2001","_to":"2010","type":"-","in":"Sep","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"S"}]},
        zones: {"Atlantic/Stanley":[{"name":"Atlantic/Stanley","_offset":"-3:51:24","_rule":"-","format":"LMT","_until":"1890"},{"name":"Atlantic/Stanley","_offset":"-3:51:24","_rule":"-","format":"SMT","_until":"1912 Mar 12"},{"name":"Atlantic/Stanley","_offset":"-4:00","_rule":"Falk","format":"FK%sT","_until":"1983 May"},{"name":"Atlantic/Stanley","_offset":"-3:00","_rule":"Falk","format":"FK%sT","_until":"1985 Sep 15"},{"name":"Atlantic/Stanley","_offset":"-4:00","_rule":"Falk","format":"FK%sT","_until":"2010 Sep 5 02:00"},{"name":"Atlantic/Stanley","_offset":"-3:00","_rule":"-","format":"FKST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);