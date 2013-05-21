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
        zones: {"Asia/Colombo":[{"name":"Asia/Colombo","_offset":"5:19:24","_rule":"-","format":"LMT","_until":"1880"},{"name":"Asia/Colombo","_offset":"5:19:32","_rule":"-","format":"MMT","_until":"1906"},{"name":"Asia/Colombo","_offset":"5:30","_rule":"-","format":"IST","_until":"1942 Jan 5"},{"name":"Asia/Colombo","_offset":"5:30","_rule":"0:30","format":"IHST","_until":"1942 Sep"},{"name":"Asia/Colombo","_offset":"5:30","_rule":"1:00","format":"IST","_until":"1945 Oct 16 2:00"},{"name":"Asia/Colombo","_offset":"5:30","_rule":"-","format":"IST","_until":"1996 May 25 0:00"},{"name":"Asia/Colombo","_offset":"6:30","_rule":"-","format":"LKT","_until":"1996 Oct 26 0:30"},{"name":"Asia/Colombo","_offset":"6:00","_rule":"-","format":"LKT","_until":"2006 Apr 15 0:30"},{"name":"Asia/Colombo","_offset":"5:30","_rule":"-","format":"IST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);