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
        rules: {"Phil":[{"name":"Phil","_from":"1936","_to":"only","type":"-","in":"Nov","on":"1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Phil","_from":"1937","_to":"only","type":"-","in":"Feb","on":"1","at":"0:00","_save":"0","letter":"-"},{"name":"Phil","_from":"1954","_to":"only","type":"-","in":"Apr","on":"12","at":"0:00","_save":"1:00","letter":"S"},{"name":"Phil","_from":"1954","_to":"only","type":"-","in":"Jul","on":"1","at":"0:00","_save":"0","letter":"-"},{"name":"Phil","_from":"1978","_to":"only","type":"-","in":"Mar","on":"22","at":"0:00","_save":"1:00","letter":"S"},{"name":"Phil","_from":"1978","_to":"only","type":"-","in":"Sep","on":"21","at":"0:00","_save":"0","letter":"-"}]},
        zones: {"Asia/Manila":[{"name":"Asia/Manila","_offset":"-15:56:00","_rule":"-","format":"LMT","_until":"1844 Dec 31"},{"name":"Asia/Manila","_offset":"8:04:00","_rule":"-","format":"LMT","_until":"1899 May 11"},{"name":"Asia/Manila","_offset":"8:00","_rule":"Phil","format":"PH%sT","_until":"1942 May"},{"name":"Asia/Manila","_offset":"9:00","_rule":"-","format":"JST","_until":"1944 Nov"},{"name":"Asia/Manila","_offset":"8:00","_rule":"Phil","format":"PH%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);