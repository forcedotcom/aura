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
        zones: {"America/Creston":[{"name":"America/Creston","_offset":"-7:46:04","_rule":"-","format":"LMT","_until":"1884"},{"name":"America/Creston","_offset":"-7:00","_rule":"-","format":"MST","_until":"1916 Oct 1"},{"name":"America/Creston","_offset":"-8:00","_rule":"-","format":"PST","_until":"1918 Jun 2"},{"name":"America/Creston","_offset":"-7:00","_rule":"-","format":"MST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);