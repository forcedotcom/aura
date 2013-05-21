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
        zones: {"Pacific/Honolulu":[{"name":"Pacific/Honolulu","_offset":"-10:31:26","_rule":"-","format":"LMT","_until":"1896 Jan 13 12:00"},{"name":"Pacific/Honolulu","_offset":"-10:30","_rule":"-","format":"HST","_until":"1933 Apr 30 2:00"},{"name":"Pacific/Honolulu","_offset":"-10:30","_rule":"1:00","format":"HDT","_until":"1933 May 21 12:00"},{"name":"Pacific/Honolulu","_offset":"-10:30","_rule":"-","format":"HST","_until":"1942 Feb 09 2:00"},{"name":"Pacific/Honolulu","_offset":"-10:30","_rule":"1:00","format":"HDT","_until":"1945 Sep 30 2:00"},{"name":"Pacific/Honolulu","_offset":"-10:30","_rule":"-","format":"HST","_until":"1947 Jun 8 2:00"},{"name":"Pacific/Honolulu","_offset":"-10:00","_rule":"-","format":"HST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);