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
        zones: {"Pacific/Pago_Pago":[{"name":"Pacific/Pago_Pago","_offset":"12:37:12","_rule":"-","format":"LMT","_until":"1879 Jul 5"},{"name":"Pacific/Pago_Pago","_offset":"-11:22:48","_rule":"-","format":"LMT","_until":"1911"},{"name":"Pacific/Pago_Pago","_offset":"-11:30","_rule":"-","format":"SAMT","_until":"1950"},{"name":"Pacific/Pago_Pago","_offset":"-11:00","_rule":"-","format":"NST","_until":"1967 Apr"},{"name":"Pacific/Pago_Pago","_offset":"-11:00","_rule":"-","format":"BST","_until":"1983 Nov 30"},{"name":"Pacific/Pago_Pago","_offset":"-11:00","_rule":"-","format":"SST","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);