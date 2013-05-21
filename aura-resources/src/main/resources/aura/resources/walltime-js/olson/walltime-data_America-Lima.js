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
        rules: {"Peru":[{"name":"Peru","_from":"1938","_to":"only","type":"-","in":"Jan","on":"1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Peru","_from":"1938","_to":"only","type":"-","in":"Apr","on":"1","at":"0:00","_save":"0","letter":"-"},{"name":"Peru","_from":"1938","_to":"1939","type":"-","in":"Sep","on":"lastSun","at":"0:00","_save":"1:00","letter":"S"},{"name":"Peru","_from":"1939","_to":"1940","type":"-","in":"Mar","on":"Sun>=24","at":"0:00","_save":"0","letter":"-"},{"name":"Peru","_from":"1986","_to":"1987","type":"-","in":"Jan","on":"1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Peru","_from":"1986","_to":"1987","type":"-","in":"Apr","on":"1","at":"0:00","_save":"0","letter":"-"},{"name":"Peru","_from":"1990","_to":"only","type":"-","in":"Jan","on":"1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Peru","_from":"1990","_to":"only","type":"-","in":"Apr","on":"1","at":"0:00","_save":"0","letter":"-"},{"name":"Peru","_from":"1994","_to":"only","type":"-","in":"Jan","on":"1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Peru","_from":"1994","_to":"only","type":"-","in":"Apr","on":"1","at":"0:00","_save":"0","letter":"-"}]},
        zones: {"America/Lima":[{"name":"America/Lima","_offset":"-5:08:12","_rule":"-","format":"LMT","_until":"1890"},{"name":"America/Lima","_offset":"-5:08:36","_rule":"-","format":"LMT","_until":"1908 Jul 28"},{"name":"America/Lima","_offset":"-5:00","_rule":"Peru","format":"PE%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);