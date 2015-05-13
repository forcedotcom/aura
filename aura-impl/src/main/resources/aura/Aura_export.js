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

AuraInstance.prototype["addValueProvider"] = AuraInstance.prototype.addValueProvider;
AuraInstance.prototype["initAsync"] = AuraInstance.prototype.initAsync;
AuraInstance.prototype["initConfig"] = AuraInstance.prototype.initConfig;
AuraInstance.prototype["error"] = AuraInstance.prototype.error;
AuraInstance.prototype["warning"] = AuraInstance.prototype.warning;
AuraInstance.prototype["message"] = AuraInstance.prototype.message;
AuraInstance.prototype["enqueueAction"] = AuraInstance.prototype.enqueueAction;
AuraInstance.prototype["deferAction"] = AuraInstance.prototype.deferAction;
AuraInstance.prototype["get"] = AuraInstance.prototype.get;
AuraInstance.prototype["getRoot"] = AuraInstance.prototype.getRoot;
AuraInstance.prototype["getContext"] = AuraInstance.prototype.getContext;
AuraInstance.prototype["run"] = AuraInstance.prototype.run;
AuraInstance.prototype["set"] = AuraInstance.prototype.set;
AuraInstance.prototype["assert"] = AuraInstance.prototype.assert;
AuraInstance.prototype["userAssert"] = AuraInstance.prototype.userAssert;
AuraInstance.prototype["log"] = AuraInstance.prototype.log;
AuraInstance.prototype["logf"] = AuraInstance.prototype.logf;
AuraInstance.prototype["trace"] = AuraInstance.prototype.trace;

// Perf
AuraInstance.prototype["Perf"] = AuraInstance.prototype.Perf;
AuraInstance.prototype["mark"] = AuraInstance.prototype.Perf.mark;
AuraInstance.prototype["endMark"] = AuraInstance.prototype.Perf.endMark;
AuraInstance.prototype["startTransaction"] = AuraInstance.prototype.Perf.startTransaction;
AuraInstance.prototype["endTransaction"] = AuraInstance.prototype.Perf.endTransaction;
AuraInstance.prototype["updateTransaction"] = AuraInstance.prototype.Perf.updateTransaction;
AuraInstance.prototype["toJson"] = AuraInstance.prototype.Perf.toJson;
AuraInstance.prototype["setBeaconData"] = AuraInstance.prototype.Perf.setBeaconData;
AuraInstance.prototype["getBeaconData"] = AuraInstance.prototype.Perf.getBeaconData;
AuraInstance.prototype["clearBeaconData"] = AuraInstance.prototype.Perf.clearBeaconData;
AuraInstance.prototype["removeStats"] = AuraInstance.prototype.Perf.removeStats;
AuraInstance.prototype["isLoadFired"] = AuraInstance.prototype.Perf.isLoadFired;

// //#end

//#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
AuraInstance.prototype["devToolService"] = AuraInstance.prototype.devToolService;
AuraInstance.prototype["getQueryStatement"] = AuraInstance.prototype.getQueryStatement;
AuraInstance.prototype["qhelp"] = AuraInstance.prototype.qhelp;
//#end

