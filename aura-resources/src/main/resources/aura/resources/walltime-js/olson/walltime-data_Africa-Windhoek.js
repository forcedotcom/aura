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
        rules: {"Namibia":[{"name":"Namibia","_from":"1994","_to":"max","type":"-","in":"Sep","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"S"},{"name":"Namibia","_from":"1995","_to":"max","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"0","letter":"-"}]},
        zones: {"Africa/Windhoek":[{"name":"Africa/Windhoek","_offset":"1:08:24","_rule":"-","format":"LMT","_until":"1892 Feb 8"},{"name":"Africa/Windhoek","_offset":"1:30","_rule":"-","format":"SWAT","_until":"1903 Mar"},{"name":"Africa/Windhoek","_offset":"2:00","_rule":"-","format":"SAST","_until":"1942 Sep 20 2:00"},{"name":"Africa/Windhoek","_offset":"2:00","_rule":"1:00","format":"SAST","_until":"1943 Mar 21 2:00"},{"name":"Africa/Windhoek","_offset":"2:00","_rule":"-","format":"SAST","_until":"1990 Mar 21"},{"name":"Africa/Windhoek","_offset":"2:00","_rule":"-","format":"CAT","_until":"1994 Apr 3"},{"name":"Africa/Windhoek","_offset":"1:00","_rule":"Namibia","format":"WA%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);