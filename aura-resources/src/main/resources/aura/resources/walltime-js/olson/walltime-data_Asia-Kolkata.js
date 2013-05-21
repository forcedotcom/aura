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
        zones: {"Asia/Kolkata":[{"name":"Asia/Kolkata","_offset":"5:53:28","_rule":"-","format":"LMT","_until":"1880"},{"name":"Asia/Kolkata","_offset":"5:53:20","_rule":"-","format":"HMT","_until":"1941 Oct"},{"name":"Asia/Kolkata","_offset":"6:30","_rule":"-","format":"BURT","_until":"1942 May 15"},{"name":"Asia/Kolkata","_offset":"5:30","_rule":"-","format":"IST","_until":"1942 Sep"},{"name":"Asia/Kolkata","_offset":"5:30","_rule":"1:00","format":"IST","_until":"1945 Oct 15"},{"name":"Asia/Kolkata","_offset":"5:30","_rule":"-","format":"IST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);