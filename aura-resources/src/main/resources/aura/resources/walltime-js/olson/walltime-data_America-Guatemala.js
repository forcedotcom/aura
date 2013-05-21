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
        rules: {"Guat":[{"name":"Guat","_from":"1973","_to":"only","type":"-","in":"Nov","on":"25","at":"0:00","_save":"1:00","letter":"D"},{"name":"Guat","_from":"1974","_to":"only","type":"-","in":"Feb","on":"24","at":"0:00","_save":"0","letter":"S"},{"name":"Guat","_from":"1983","_to":"only","type":"-","in":"May","on":"21","at":"0:00","_save":"1:00","letter":"D"},{"name":"Guat","_from":"1983","_to":"only","type":"-","in":"Sep","on":"22","at":"0:00","_save":"0","letter":"S"},{"name":"Guat","_from":"1991","_to":"only","type":"-","in":"Mar","on":"23","at":"0:00","_save":"1:00","letter":"D"},{"name":"Guat","_from":"1991","_to":"only","type":"-","in":"Sep","on":"7","at":"0:00","_save":"0","letter":"S"},{"name":"Guat","_from":"2006","_to":"only","type":"-","in":"Apr","on":"30","at":"0:00","_save":"1:00","letter":"D"},{"name":"Guat","_from":"2006","_to":"only","type":"-","in":"Oct","on":"1","at":"0:00","_save":"0","letter":"S"}]},
        zones: {"America/Guatemala":[{"name":"America/Guatemala","_offset":"-6:02:04","_rule":"-","format":"LMT","_until":"1918 Oct 5"},{"name":"America/Guatemala","_offset":"-6:00","_rule":"Guat","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);