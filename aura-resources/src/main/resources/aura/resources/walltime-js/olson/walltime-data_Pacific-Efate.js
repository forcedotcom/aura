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
        rules: {"Vanuatu":[{"name":"Vanuatu","_from":"1983","_to":"only","type":"-","in":"Sep","on":"25","at":"0:00","_save":"1:00","letter":"S"},{"name":"Vanuatu","_from":"1984","_to":"1991","type":"-","in":"Mar","on":"Sun>=23","at":"0:00","_save":"0","letter":"-"},{"name":"Vanuatu","_from":"1984","_to":"only","type":"-","in":"Oct","on":"23","at":"0:00","_save":"1:00","letter":"S"},{"name":"Vanuatu","_from":"1985","_to":"1991","type":"-","in":"Sep","on":"Sun>=23","at":"0:00","_save":"1:00","letter":"S"},{"name":"Vanuatu","_from":"1992","_to":"1993","type":"-","in":"Jan","on":"Sun>=23","at":"0:00","_save":"0","letter":"-"},{"name":"Vanuatu","_from":"1992","_to":"only","type":"-","in":"Oct","on":"Sun>=23","at":"0:00","_save":"1:00","letter":"S"}]},
        zones: {"Pacific/Efate":[{"name":"Pacific/Efate","_offset":"11:13:16","_rule":"-","format":"LMT","_until":"1912 Jan 13"},{"name":"Pacific/Efate","_offset":"11:00","_rule":"Vanuatu","format":"VU%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);