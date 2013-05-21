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
        zones: {"Asia/Pyongyang":[{"name":"Asia/Pyongyang","_offset":"8:23:00","_rule":"-","format":"LMT","_until":"1890"},{"name":"Asia/Pyongyang","_offset":"8:30","_rule":"-","format":"KST","_until":"1904 Dec"},{"name":"Asia/Pyongyang","_offset":"9:00","_rule":"-","format":"KST","_until":"1928"},{"name":"Asia/Pyongyang","_offset":"8:30","_rule":"-","format":"KST","_until":"1932"},{"name":"Asia/Pyongyang","_offset":"9:00","_rule":"-","format":"KST","_until":"1954 Mar 21"},{"name":"Asia/Pyongyang","_offset":"8:00","_rule":"-","format":"KST","_until":"1961 Aug 10"},{"name":"Asia/Pyongyang","_offset":"9:00","_rule":"-","format":"KST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);