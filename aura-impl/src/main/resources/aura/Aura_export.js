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
/*jslint sub: true */

// //#exportSymbols $A.ns.Aura
$A.ns.Aura.prototype["addValueProvider"] = $A.ns.Aura.prototype.addValueProvider;
$A.ns.Aura.prototype["initAsync"] = $A.ns.Aura.prototype.initAsync;
$A.ns.Aura.prototype["initConfig"] = $A.ns.Aura.prototype.initConfig;
$A.ns.Aura.prototype["error"] = $A.ns.Aura.prototype.error;
$A.ns.Aura.prototype["warning"] = $A.ns.Aura.prototype.warning;
$A.ns.Aura.prototype["message"] = $A.ns.Aura.prototype.message;
$A.ns.Aura.prototype["enqueueAction"] = $A.ns.Aura.prototype.enqueueAction;
$A.ns.Aura.prototype["deferAction"] = $A.ns.Aura.prototype.deferAction;
$A.ns.Aura.prototype["get"] = $A.ns.Aura.prototype.get;
$A.ns.Aura.prototype["getRoot"] = $A.ns.Aura.prototype.getRoot;
$A.ns.Aura.prototype["getContext"] = $A.ns.Aura.prototype.getContext;
$A.ns.Aura.prototype["run"] = $A.ns.Aura.prototype.run;
$A.ns.Aura.prototype["set"] = $A.ns.Aura.prototype.set;
$A.ns.Aura.prototype["assert"] = $A.ns.Aura.prototype.assert;
$A.ns.Aura.prototype["userAssert"] = $A.ns.Aura.prototype.userAssert;
$A.ns.Aura.prototype["log"] = $A.ns.Aura.prototype.log;
$A.ns.Aura.prototype["logf"] = $A.ns.Aura.prototype.logf;
$A.ns.Aura.prototype["trace"] = $A.ns.Aura.prototype.trace;

// Perf
$A.ns.Aura.prototype["Perf"] = $A.ns.Aura.prototype.Perf;
$A.ns.Aura.prototype["mark"] = $A.ns.Aura.prototype.Perf.mark;
$A.ns.Aura.prototype["endMark"] = $A.ns.Aura.prototype.Perf.endMark;
$A.ns.Aura.prototype["startTransaction"] = $A.ns.Aura.prototype.Perf.startTransaction;
$A.ns.Aura.prototype["endTransaction"] = $A.ns.Aura.prototype.Perf.endTransaction;
$A.ns.Aura.prototype["updateTransaction"] = $A.ns.Aura.prototype.Perf.updateTransaction;
$A.ns.Aura.prototype["toJson"] = $A.ns.Aura.prototype.Perf.toJson;
$A.ns.Aura.prototype["setBeaconData"] = $A.ns.Aura.prototype.Perf.setBeaconData;
$A.ns.Aura.prototype["getBeaconData"] = $A.ns.Aura.prototype.Perf.getBeaconData;
$A.ns.Aura.prototype["clearBeaconData"] = $A.ns.Aura.prototype.Perf.clearBeaconData;
$A.ns.Aura.prototype["removeStats"] = $A.ns.Aura.prototype.Perf.removeStats;
$A.ns.Aura.prototype["isLoadFired"] = $A.ns.Aura.prototype.Perf.isLoadFired;

// //#end

//#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
$A.ns.Aura.prototype["devToolService"] = $A.ns.Aura.prototype.devToolService;
$A.ns.Aura.prototype["getQueryStatement"] = $A.ns.Aura.prototype.getQueryStatement;
$A.ns.Aura.prototype["qhelp"] = $A.ns.Aura.prototype.qhelp;
//#end

