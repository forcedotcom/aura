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
        zones: {"Asia/Brunei":[{"name":"Asia/Brunei","_offset":"7:39:40","_rule":"-","format":"LMT","_until":"1926 Mar"},{"name":"Asia/Brunei","_offset":"7:30","_rule":"-","format":"BNT","_until":"1933"},{"name":"Asia/Brunei","_offset":"8:00","_rule":"-","format":"BNT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);