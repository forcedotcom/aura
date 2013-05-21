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
        rules: {"Egypt":[{"name":"Egypt","_from":"1940","_to":"only","type":"-","in":"Jul","on":"15","at":"0:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1940","_to":"only","type":"-","in":"Oct","on":"1","at":"0:00","_save":"0","letter":"-"},{"name":"Egypt","_from":"1941","_to":"only","type":"-","in":"Apr","on":"15","at":"0:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1941","_to":"only","type":"-","in":"Sep","on":"16","at":"0:00","_save":"0","letter":"-"},{"name":"Egypt","_from":"1942","_to":"1944","type":"-","in":"Apr","on":"1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1942","_to":"only","type":"-","in":"Oct","on":"27","at":"0:00","_save":"0","letter":"-"},{"name":"Egypt","_from":"1943","_to":"1945","type":"-","in":"Nov","on":"1","at":"0:00","_save":"0","letter":"-"},{"name":"Egypt","_from":"1945","_to":"only","type":"-","in":"Apr","on":"16","at":"0:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1957","_to":"only","type":"-","in":"May","on":"10","at":"0:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1957","_to":"1958","type":"-","in":"Oct","on":"1","at":"0:00","_save":"0","letter":"-"},{"name":"Egypt","_from":"1958","_to":"only","type":"-","in":"May","on":"1","at":"0:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1959","_to":"1981","type":"-","in":"May","on":"1","at":"1:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1959","_to":"1965","type":"-","in":"Sep","on":"30","at":"3:00","_save":"0","letter":"-"},{"name":"Egypt","_from":"1966","_to":"1994","type":"-","in":"Oct","on":"1","at":"3:00","_save":"0","letter":"-"},{"name":"Egypt","_from":"1982","_to":"only","type":"-","in":"Jul","on":"25","at":"1:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1983","_to":"only","type":"-","in":"Jul","on":"12","at":"1:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1984","_to":"1988","type":"-","in":"May","on":"1","at":"1:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1989","_to":"only","type":"-","in":"May","on":"6","at":"1:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1990","_to":"1994","type":"-","in":"May","on":"1","at":"1:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1995","_to":"2010","type":"-","in":"Apr","on":"lastFri","at":"0:00s","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"1995","_to":"2005","type":"-","in":"Sep","on":"lastThu","at":"23:00s","_save":"0","letter":"-"},{"name":"Egypt","_from":"2006","_to":"only","type":"-","in":"Sep","on":"21","at":"23:00s","_save":"0","letter":"-"},{"name":"Egypt","_from":"2007","_to":"only","type":"-","in":"Sep","on":"Thu>=1","at":"23:00s","_save":"0","letter":"-"},{"name":"Egypt","_from":"2008","_to":"only","type":"-","in":"Aug","on":"lastThu","at":"23:00s","_save":"0","letter":"-"},{"name":"Egypt","_from":"2009","_to":"only","type":"-","in":"Aug","on":"20","at":"23:00s","_save":"0","letter":"-"},{"name":"Egypt","_from":"2010","_to":"only","type":"-","in":"Aug","on":"11","at":"0:00","_save":"0","letter":"-"},{"name":"Egypt","_from":"2010","_to":"only","type":"-","in":"Sep","on":"10","at":"0:00","_save":"1:00","letter":"S"},{"name":"Egypt","_from":"2010","_to":"only","type":"-","in":"Sep","on":"lastThu","at":"23:00s","_save":"0","letter":"-"}]},
        zones: {"Africa/Cairo":[{"name":"Africa/Cairo","_offset":"2:05:00","_rule":"-","format":"LMT","_until":"1900 Oct"},{"name":"Africa/Cairo","_offset":"2:00","_rule":"Egypt","format":"EE%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);