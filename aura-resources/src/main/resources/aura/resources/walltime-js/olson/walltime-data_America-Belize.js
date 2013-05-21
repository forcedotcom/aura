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
        rules: {"Belize":[{"name":"Belize","_from":"1918","_to":"1942","type":"-","in":"Oct","on":"Sun>=2","at":"0:00","_save":"0:30","letter":"HD"},{"name":"Belize","_from":"1919","_to":"1943","type":"-","in":"Feb","on":"Sun>=9","at":"0:00","_save":"0","letter":"S"},{"name":"Belize","_from":"1973","_to":"only","type":"-","in":"Dec","on":"5","at":"0:00","_save":"1:00","letter":"D"},{"name":"Belize","_from":"1974","_to":"only","type":"-","in":"Feb","on":"9","at":"0:00","_save":"0","letter":"S"},{"name":"Belize","_from":"1982","_to":"only","type":"-","in":"Dec","on":"18","at":"0:00","_save":"1:00","letter":"D"},{"name":"Belize","_from":"1983","_to":"only","type":"-","in":"Feb","on":"12","at":"0:00","_save":"0","letter":"S"}]},
        zones: {"America/Belize":[{"name":"America/Belize","_offset":"-5:52:48","_rule":"-","format":"LMT","_until":"1912 Apr"},{"name":"America/Belize","_offset":"-6:00","_rule":"Belize","format":"C%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);