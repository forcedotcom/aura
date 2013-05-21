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
        rules: {"Iraq":[{"name":"Iraq","_from":"1982","_to":"only","type":"-","in":"May","on":"1","at":"0:00","_save":"1:00","letter":"D"},{"name":"Iraq","_from":"1982","_to":"1984","type":"-","in":"Oct","on":"1","at":"0:00","_save":"0","letter":"S"},{"name":"Iraq","_from":"1983","_to":"only","type":"-","in":"Mar","on":"31","at":"0:00","_save":"1:00","letter":"D"},{"name":"Iraq","_from":"1984","_to":"1985","type":"-","in":"Apr","on":"1","at":"0:00","_save":"1:00","letter":"D"},{"name":"Iraq","_from":"1985","_to":"1990","type":"-","in":"Sep","on":"lastSun","at":"1:00s","_save":"0","letter":"S"},{"name":"Iraq","_from":"1986","_to":"1990","type":"-","in":"Mar","on":"lastSun","at":"1:00s","_save":"1:00","letter":"D"},{"name":"Iraq","_from":"1991","_to":"2007","type":"-","in":"Apr","on":"1","at":"3:00s","_save":"1:00","letter":"D"},{"name":"Iraq","_from":"1991","_to":"2007","type":"-","in":"Oct","on":"1","at":"3:00s","_save":"0","letter":"S"}]},
        zones: {"Asia/Baghdad":[{"name":"Asia/Baghdad","_offset":"2:57:40","_rule":"-","format":"LMT","_until":"1890"},{"name":"Asia/Baghdad","_offset":"2:57:36","_rule":"-","format":"BMT","_until":"1918"},{"name":"Asia/Baghdad","_offset":"3:00","_rule":"-","format":"AST","_until":"1982 May"},{"name":"Asia/Baghdad","_offset":"3:00","_rule":"Iraq","format":"A%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);