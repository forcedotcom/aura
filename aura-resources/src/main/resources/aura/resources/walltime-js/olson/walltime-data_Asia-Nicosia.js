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
        rules: {"Cyprus":[{"name":"Cyprus","_from":"1975","_to":"only","type":"-","in":"Apr","on":"13","at":"0:00","_save":"1:00","letter":"S"},{"name":"Cyprus","_from":"1975","_to":"only","type":"-","in":"Oct","on":"12","at":"0:00","_save":"0","letter":"-"},{"name":"Cyprus","_from":"1976","_to":"only","type":"-","in":"May","on":"15","at":"0:00","_save":"1:00","letter":"S"},{"name":"Cyprus","_from":"1976","_to":"only","type":"-","in":"Oct","on":"11","at":"0:00","_save":"0","letter":"-"},{"name":"Cyprus","_from":"1977","_to":"1980","type":"-","in":"Apr","on":"Sun>=1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Cyprus","_from":"1977","_to":"only","type":"-","in":"Sep","on":"25","at":"0:00","_save":"0","letter":"-"},{"name":"Cyprus","_from":"1978","_to":"only","type":"-","in":"Oct","on":"2","at":"0:00","_save":"0","letter":"-"},{"name":"Cyprus","_from":"1979","_to":"1997","type":"-","in":"Sep","on":"lastSun","at":"0:00","_save":"0","letter":"-"},{"name":"Cyprus","_from":"1981","_to":"1998","type":"-","in":"Mar","on":"lastSun","at":"0:00","_save":"1:00","letter":"S"}],"EUAsia":[{"name":"EUAsia","_from":"1981","_to":"max","type":"-","in":"Mar","on":"lastSun","at":"1:00u","_save":"1:00","letter":"S"},{"name":"EUAsia","_from":"1979","_to":"1995","type":"-","in":"Sep","on":"lastSun","at":"1:00u","_save":"0","letter":"-"},{"name":"EUAsia","_from":"1996","_to":"max","type":"-","in":"Oct","on":"lastSun","at":"1:00u","_save":"0","letter":"-"}]},
        zones: {"Asia/Nicosia":[{"name":"Asia/Nicosia","_offset":"2:13:28","_rule":"-","format":"LMT","_until":"1921 Nov 14"},{"name":"Asia/Nicosia","_offset":"2:00","_rule":"Cyprus","format":"EE%sT","_until":"1998 Sep"},{"name":"Asia/Nicosia","_offset":"2:00","_rule":"EUAsia","format":"EE%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);