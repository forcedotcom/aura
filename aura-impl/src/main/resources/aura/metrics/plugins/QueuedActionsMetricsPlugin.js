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
/**
 * QueuedActionsMetricsPlugin
 * =================
 * This plugin tracks the state and result of all actions from the framework
 * @description Queued Action metrics plugin
 * @constructor
 * @export
 */
var QueuedActionsMetricsPlugin = function QueuedActionsMetricsPlugin(config) {
    this.config = config;
    this["enabled"] = true;
};

QueuedActionsMetricsPlugin.NAME = "queuedActions";

/** @export */
QueuedActionsMetricsPlugin.prototype.initialize = function (metricsService) {
    this.collector = metricsService;
    if (this["enabled"]) {
        this.bind(metricsService);
    }
};

/** @export */
QueuedActionsMetricsPlugin.prototype.enable = function () {
    if (!this["enabled"]) {
        this["enabled"] = true;
        this.bind(this.collector);
    }
};

/** @export */
QueuedActionsMetricsPlugin.prototype.disable = function () {
    if (this["enabled"]) {
        this["enabled"] = false;
        this.unbind(this.collector);
    }
};

QueuedActionsMetricsPlugin.prototype.enqueueActionOverride = function() {
    var config = Array.prototype.shift.apply(arguments);
    var action = arguments[0];
    var ret = config["fn"].apply(config["scope"], arguments);
    var stampMark = this.collector["markStart"](QueuedActionsMetricsPlugin.NAME, 'dispatch');
    stampMark["phase"] = 'stamp'; //mark as a stamp metric
    stampMark["context"] = {
        "id"         : action.getId(),
        //"params"     : action.getParams(),
        "abortable"  : action.isAbortable(),
        "storable"   : action.isStorable(),
        "background" : action.isBackground(),
        "state"      : action.getState(),
        "isRefresh"  : action.isRefreshAction(),
        "defName"    : action.getDef().name
    };
    return ret;
};

QueuedActionsMetricsPlugin.prototype.actionFinishOverride = function() {
    var config = Array.prototype.shift.apply(arguments);
    var action = config["self"];
    this.markStart(action);
    var ret = config["fn"].apply(config["scope"], arguments);
    this.markEnd(action);
    return ret;
};

QueuedActionsMetricsPlugin.prototype.actionAbortOverride = function() {
    var config = Array.prototype.shift.apply(arguments);
    var action = config["self"];
    this.markStart(action);
    var ret = config["fn"].apply(config["scope"], arguments);
    this.markEnd(action);
    return ret;
};

QueuedActionsMetricsPlugin.prototype.markStart = function(action) {
    var startMark = this.collector["markStart"](QueuedActionsMetricsPlugin.NAME, 'dispatch');
    startMark["context"] = {
        "id"         : action.getId(),
        //"params"     : action.getParams(),
        "abortable"  : action.isAbortable(),
        "storable"   : action.isStorable(),
        "background" : action.isBackground(),
        "state"      : action.getState(),
        "isRefresh"  : action.isRefreshAction(),
        "defName"    : action.getDef().name
    };
};

QueuedActionsMetricsPlugin.prototype.markEnd = function(action) {
    var endMark = this.collector["markEnd"](QueuedActionsMetricsPlugin.NAME, 'dispatch');
    endMark["context"] = {
        "id"            : action.getId(),
        "isFromStorage" : action.isFromStorage(),
        "state"         : action.getState()
    };
};

QueuedActionsMetricsPlugin.prototype.bind = function () {
    $A.installOverride("enqueueAction", this.enqueueActionOverride, this);
    $A.installOverride("Action.finishAction", this.actionFinishOverride, this);
    $A.installOverride("Action.abort", this.actionAbortOverride, this);
};

//#if {"excludeModes" : ["PRODUCTION"]}
/** @export */
QueuedActionsMetricsPlugin.prototype.postProcess = function (actionMarks) {
    var processedMarks = [];
    var queue  = {};

    // All this loops are to get all actions in the same bundle
    for (var i = 0; i < actionMarks.length; i++) {
        var action = actionMarks[i];
        var id = action["context"]["id"];
        var phase = action["phase"];
        var mark = queue[id];

        if (phase === 'stamp') {
            if (action["context"]["state"] === "NEW") {
                queue[id] = $A.util.apply({}, action, true, true);
            } else {
                // finished at enqueue (aborted)
                processedMarks.push(action);
            }
            action["enqueuets"] = action["ts"];
        } else if (phase === 'start') {
            if (mark) {
                mark["context"] = $A.util.apply(mark["context"], action["context"]);
                mark["wait"] = action["ts"] - mark["ts"];
                mark["ts"] = action["ts"];
            } else {
                queue[id] = $A.util.apply({}, action, true, true);
            }
        } else if (phase === 'end' && mark) {
            mark["context"]  = $A.util.apply(mark["context"], action["context"]);
            mark["duration"] = action["ts"] - mark["ts"];
            processedMarks.push(mark);
            delete queue[id];
        }
    }
    return processedMarks;
};
//#end

QueuedActionsMetricsPlugin.prototype.unbind = function () {
    $A.uninstallOverride("enqueueAction", this.enqueueActionOverride);
    $A.uninstallOverride("Action.finishAction", this.actionFinishOverride);
    $A.uninstallOverride("Action.abort", this.actionAbortOverride);
};

$A.metricsService.registerPlugin({
    "name"   : QueuedActionsMetricsPlugin.NAME,
    "plugin" : QueuedActionsMetricsPlugin
});
