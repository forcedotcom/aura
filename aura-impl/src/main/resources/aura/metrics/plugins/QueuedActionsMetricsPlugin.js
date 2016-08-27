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

QueuedActionsMetricsPlugin.NAME = "actions";

/** @export */
QueuedActionsMetricsPlugin.prototype.initialize = function (metricsService) {
    this.metricsService = metricsService;
    if (this["enabled"]) {
        this.bind(metricsService);
    }
};

/** @export */
QueuedActionsMetricsPlugin.prototype.enable = function () {
    if (!this["enabled"]) {
        this["enabled"] = true;
        this.bind(this.metricsService);
    }
};

/** @export */
QueuedActionsMetricsPlugin.prototype.disable = function () {
    if (this["enabled"]) {
        this["enabled"] = false;
        this.unbind(this.metricsService);
    }
};

QueuedActionsMetricsPlugin.prototype.enqueueActionOverride = function() {
    var config = Array.prototype.shift.apply(arguments);
    var action = arguments[0];

    this.metricsService["mark"](QueuedActionsMetricsPlugin.NAME, 'enqueue', {
        "id"         : action.getId(),
        "abortable"  : action.isAbortable(),
        "storable"   : action.isStorable(),
        "background" : action.isBackground(),
        "def"        : action.getDef().toString()
    });

    //console.log('>>> ActionEnqueue :: %s [%s]', action.getId(), action.getDef()+'');

    var ret = config["fn"].apply(config["scope"], arguments);
    return ret;
};

QueuedActionsMetricsPlugin.prototype.actionSendOverride = function() {
    var config = Array.prototype.shift.apply(arguments);
    var actions = arguments[1];

    for (var i = 0; i < actions.length; i++) {
        this.metricsService["markStart"](QueuedActionsMetricsPlugin.NAME, 'send', {
            "id" : actions[i].getId()
        });
    }
    //console.log('>>> ActionSend :: [%s]', actions.map(function (a) {return a.getId(); }).join(','));

    return config["fn"].apply(config["scope"], arguments);
};

QueuedActionsMetricsPlugin.prototype.actionFinishOverride = function() {
    var config = Array.prototype.shift.apply(arguments);
    this.metricsService["markEnd"](QueuedActionsMetricsPlugin.NAME, 'send', {
        "id"    : config["self"].getId(),
        "state" : config["self"].getState(),
        "cache" : config["self"].isFromStorage()
    });
    
    //console.log('>>> ActionFinish :: ', config["self"].getId());

    return config["fn"].apply(config["scope"], arguments);
};

QueuedActionsMetricsPlugin.prototype.bind = function () {
    // Time of $A.enqueue
    $A.installOverride("enqueueAction", this.enqueueActionOverride, this);

    // Time when the action is sent
    $A.installOverride("ClientService.send", this.actionSendOverride, this);

    // Time when the action is done
    $A.installOverride("Action.finishAction", this.actionFinishOverride, this);
};

/** @export */
QueuedActionsMetricsPlugin.prototype.postProcess = function (actionMarks /*, trxConfig*/) {
    var processedMarks = [];
    var queue  = {};

    // This loop is to assemble the action time
    for (var i = 0; i < actionMarks.length; i++) {
        var actionMark = actionMarks[i];
        var id = actionMark["context"]["id"];
        var phase = actionMark["phase"];
        var mark = queue[id];

        if (phase === 'stamp') {
            queue[id] = $A.util.apply({}, actionMark);
        } else if (phase === 'start' && mark) {
            mark["enqueueWait"] = parseInt(actionMark["ts"] - mark["ts"]);
        } else if (phase === 'end' && mark) {
            $A.util.apply(mark["context"], actionMark["context"]);
            mark["duration"] = parseInt(actionMark["ts"] - mark["ts"]);
            processedMarks.push(mark);
            delete queue[id];
        }
    }

    return processedMarks;
};

QueuedActionsMetricsPlugin.prototype.unbind = function () {
    $A.uninstallOverride("enqueueAction", this.enqueueActionOverride);
    $A.uninstallOverride("ClientService.send", this.actionSendOverride, this);
    $A.uninstallOverride("Action.finishAction", this.actionFinishOverride);
};

$A.metricsService.registerPlugin({
    "name"   : QueuedActionsMetricsPlugin.NAME,
    "plugin" : QueuedActionsMetricsPlugin
});
