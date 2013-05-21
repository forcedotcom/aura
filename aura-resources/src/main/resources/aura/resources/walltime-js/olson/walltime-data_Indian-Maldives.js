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
        zones: {"Indian/Maldives":[{"name":"Indian/Maldives","_offset":"4:54:00","_rule":"-","format":"LMT","_until":"1880"},{"name":"Indian/Maldives","_offset":"4:54:00","_rule":"-","format":"MMT","_until":"1960"},{"name":"Indian/Maldives","_offset":"5:00","_rule":"-","format":"MVT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);