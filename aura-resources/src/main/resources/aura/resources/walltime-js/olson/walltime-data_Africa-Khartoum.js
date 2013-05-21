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
        rules: {"Sudan":[{"name":"Sudan","_from":"1970","_to":"only","type":"-","in":"May","on":"1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Sudan","_from":"1970","_to":"1985","type":"-","in":"Oct","on":"15","at":"0:00","_save":"0","letter":"-"},{"name":"Sudan","_from":"1971","_to":"only","type":"-","in":"Apr","on":"30","at":"0:00","_save":"1:00","letter":"S"},{"name":"Sudan","_from":"1972","_to":"1985","type":"-","in":"Apr","on":"lastSun","at":"0:00","_save":"1:00","letter":"S"}]},
        zones: {"Africa/Khartoum":[{"name":"Africa/Khartoum","_offset":"2:10:08","_rule":"-","format":"LMT","_until":"1931"},{"name":"Africa/Khartoum","_offset":"2:00","_rule":"Sudan","format":"CA%sT","_until":"2000 Jan 15 12:00"},{"name":"Africa/Khartoum","_offset":"3:00","_rule":"-","format":"EAT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);