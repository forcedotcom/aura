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
        rules: {},
        zones: {"Atlantic/Cape_Verde":[{"name":"Atlantic/Cape_Verde","_offset":"-1:34:04","_rule":"-","format":"LMT","_until":"1907"},{"name":"Atlantic/Cape_Verde","_offset":"-2:00","_rule":"-","format":"CVT","_until":"1942 Sep"},{"name":"Atlantic/Cape_Verde","_offset":"-2:00","_rule":"1:00","format":"CVST","_until":"1945 Oct 15"},{"name":"Atlantic/Cape_Verde","_offset":"-2:00","_rule":"-","format":"CVT","_until":"1975 Nov 25 2:00"},{"name":"Atlantic/Cape_Verde","_offset":"-1:00","_rule":"-","format":"CVT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);