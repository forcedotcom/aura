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
        zones: {"Asia/Kuala_Lumpur":[{"name":"Asia/Kuala_Lumpur","_offset":"6:46:46","_rule":"-","format":"LMT","_until":"1901 Jan 1"},{"name":"Asia/Kuala_Lumpur","_offset":"6:55:25","_rule":"-","format":"SMT","_until":"1905 Jun 1"},{"name":"Asia/Kuala_Lumpur","_offset":"7:00","_rule":"-","format":"MALT","_until":"1933 Jan 1"},{"name":"Asia/Kuala_Lumpur","_offset":"7:00","_rule":"0:20","format":"MALST","_until":"1936 Jan 1"},{"name":"Asia/Kuala_Lumpur","_offset":"7:20","_rule":"-","format":"MALT","_until":"1941 Sep 1"},{"name":"Asia/Kuala_Lumpur","_offset":"7:30","_rule":"-","format":"MALT","_until":"1942 Feb 16"},{"name":"Asia/Kuala_Lumpur","_offset":"9:00","_rule":"-","format":"JST","_until":"1945 Sep 12"},{"name":"Asia/Kuala_Lumpur","_offset":"7:30","_rule":"-","format":"MALT","_until":"1982 Jan 1"},{"name":"Asia/Kuala_Lumpur","_offset":"8:00","_rule":"-","format":"MYT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);