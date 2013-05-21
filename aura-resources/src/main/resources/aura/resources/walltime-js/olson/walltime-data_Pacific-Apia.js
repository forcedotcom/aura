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
        rules: {"WS":[{"name":"WS","_from":"2012","_to":"max","type":"-","in":"Sep","on":"lastSun","at":"3:00","_save":"1","letter":"D"},{"name":"WS","_from":"2012","_to":"max","type":"-","in":"Apr","on":"Sun>=1","at":"4:00","_save":"0","letter":"-"}]},
        zones: {"Pacific/Apia":[{"name":"Pacific/Apia","_offset":"12:33:04","_rule":"-","format":"LMT","_until":"1879 Jul 5"},{"name":"Pacific/Apia","_offset":"-11:26:56","_rule":"-","format":"LMT","_until":"1911"},{"name":"Pacific/Apia","_offset":"-11:30","_rule":"-","format":"SAMT","_until":"1950"},{"name":"Pacific/Apia","_offset":"-11:00","_rule":"-","format":"WST","_until":"2010 Sep 26"},{"name":"Pacific/Apia","_offset":"-11:00","_rule":"1:00","format":"WSDT","_until":"2011 Apr 2 4:00"},{"name":"Pacific/Apia","_offset":"-11:00","_rule":"-","format":"WST","_until":"2011 Sep 24 3:00"},{"name":"Pacific/Apia","_offset":"-11:00","_rule":"1:00","format":"WSDT","_until":"2011 Dec 30"},{"name":"Pacific/Apia","_offset":"13:00","_rule":"1:00","format":"WSDT","_until":"2012 Apr Sun>=1 4:00"},{"name":"Pacific/Apia","_offset":"13:00","_rule":"WS","format":"WS%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);