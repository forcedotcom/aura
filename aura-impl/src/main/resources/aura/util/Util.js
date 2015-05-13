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
/*jslint evil:true, sub: true */
/**
 * @description The top-level namespace/object for all SFDC Util code.
 * Util methods provide utility functions for browsers in addition to
 * functions for retrieving, manipulating, or checking DOM elements.
 * @constructor
 * @platform
 */
function Util() {
    this.trashcan = document.createDocumentFragment();
    this.trash = [];
    this.json = new Json();
    this["json"] = this.json;
    this.transport = new Transport();
    this["transport"] = this.transport;
    this.style = new Style();
    this["style"] = this.style;
    this["Bitset"] = Bitset;
    this["NumberFormat"] = NumberFormat;
    this.objToString = Object.prototype.toString;
    this.trashedComponentQueue = [];
    this.dataAttributeCache = {};
    this.debugToolWindow = undefined;
    this.sizeEstimator = new SizeEstimator();
}

Aura.Utils.CoreUtil.prototype.apply(Util.prototype, Aura.Utils.CoreUtil.prototype);

$A.ns.Util = Util; 
Aura.Utils.Util = Util;

//#include aura.util.Util_export
