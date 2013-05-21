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
        rules: {"Mauritius":[{"name":"Mauritius","_from":"1982","_to":"only","type":"-","in":"Oct","on":"10","at":"0:00","_save":"1:00","letter":"S"},{"name":"Mauritius","_from":"1983","_to":"only","type":"-","in":"Mar","on":"21","at":"0:00","_save":"0","letter":"-"},{"name":"Mauritius","_from":"2008","_to":"only","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"1:00","letter":"S"},{"name":"Mauritius","_from":"2009","_to":"only","type":"-","in":"Mar","on":"lastSun","at":"2:00","_save":"0","letter":"-"}]},
        zones: {"Indian/Mauritius":[{"name":"Indian/Mauritius","_offset":"3:50:00","_rule":"-","format":"LMT","_until":"1907"},{"name":"Indian/Mauritius","_offset":"4:00","_rule":"Mauritius","format":"MU%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);