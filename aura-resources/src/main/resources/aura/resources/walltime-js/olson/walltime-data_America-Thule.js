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
        rules: {"Thule":[{"name":"Thule","_from":"1991","_to":"1992","type":"-","in":"Mar","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"Thule","_from":"1991","_to":"1992","type":"-","in":"Sep","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"Thule","_from":"1993","_to":"2006","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"Thule","_from":"1993","_to":"2006","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"Thule","_from":"2007","_to":"max","type":"-","in":"Mar","on":"Sun>=8","at":"2:00","_save":"1:00","letter":"D"},{"name":"Thule","_from":"2007","_to":"max","type":"-","in":"Nov","on":"Sun>=1","at":"2:00","_save":"0","letter":"S"}]},
        zones: {"America/Thule":[{"name":"America/Thule","_offset":"-4:35:08","_rule":"-","format":"LMT","_until":"1916 Jul 28"},{"name":"America/Thule","_offset":"-4:00","_rule":"Thule","format":"A%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);