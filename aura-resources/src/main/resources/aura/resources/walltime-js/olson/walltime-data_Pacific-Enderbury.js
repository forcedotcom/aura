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
        zones: {"Pacific/Enderbury":[{"name":"Pacific/Enderbury","_offset":"-11:24:20","_rule":"-","format":"LMT","_until":"1901"},{"name":"Pacific/Enderbury","_offset":"-12:00","_rule":"-","format":"PHOT","_until":"1979 Oct"},{"name":"Pacific/Enderbury","_offset":"-11:00","_rule":"-","format":"PHOT","_until":"1995"},{"name":"Pacific/Enderbury","_offset":"13:00","_rule":"-","format":"PHOT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);