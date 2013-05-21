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
        zones: {"America/Paramaribo":[{"name":"America/Paramaribo","_offset":"-3:40:40","_rule":"-","format":"LMT","_until":"1911"},{"name":"America/Paramaribo","_offset":"-3:40:52","_rule":"-","format":"PMT","_until":"1935"},{"name":"America/Paramaribo","_offset":"-3:40:36","_rule":"-","format":"PMT","_until":"1945 Oct"},{"name":"America/Paramaribo","_offset":"-3:30","_rule":"-","format":"NEGT","_until":"1975 Nov 20"},{"name":"America/Paramaribo","_offset":"-3:30","_rule":"-","format":"SRT","_until":"1984 Oct"},{"name":"America/Paramaribo","_offset":"-3:00","_rule":"-","format":"SRT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);