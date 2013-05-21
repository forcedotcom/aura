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
        rules: {"Mexico":[{"name":"Mexico","_from":"1939","_to":"only","type":"-","in":"Feb","on":"5","at":"0:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"1939","_to":"only","type":"-","in":"Jun","on":"25","at":"0:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"1940","_to":"only","type":"-","in":"Dec","on":"9","at":"0:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"1941","_to":"only","type":"-","in":"Apr","on":"1","at":"0:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"1943","_to":"only","type":"-","in":"Dec","on":"16","at":"0:00","_save":"1:00","letter":"W"},{"name":"Mexico","_from":"1944","_to":"only","type":"-","in":"May","on":"1","at":"0:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"1950","_to":"only","type":"-","in":"Feb","on":"12","at":"0:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"1950","_to":"only","type":"-","in":"Jul","on":"30","at":"0:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"1996","_to":"2000","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"1996","_to":"2000","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"2001","_to":"only","type":"-","in":"May","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"2001","_to":"only","type":"-","in":"Sep","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"2002","_to":"max","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"2002","_to":"max","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"}]},
        zones: {"America/Merida":[{"name":"America/Merida","_offset":"-5:58:28","_rule":"-","format":"LMT","_until":"1922 Jan 1 0:01:32"},{"name":"America/Merida","_offset":"-6:00","_rule":"-","format":"CST","_until":"1981 Dec 23"},{"name":"America/Merida","_offset":"-5:00","_rule":"-","format":"EST","_until":"1982 Dec 2"},{"name":"America/Merida","_offset":"-6:00","_rule":"Mexico","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);