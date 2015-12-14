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
 * TransportMetricsPlugin
 * =================
 * This plugin tracks information about all XHRs done to the aura servlet
 * @description Transport metrics plugin
 * @constructor
 * @export
 */
var TransportMetricsPlugin = function TransportMetricsPlugin(config) {
    this.config = config;
    this["enabled"] = true;
};

TransportMetricsPlugin.NAME = "transport";
TransportMetricsPlugin.ORIGIN = window.location && window.location.origin;
TransportMetricsPlugin.AURA_URL = TransportMetricsPlugin.ORIGIN + '/aura';

/** @export */
TransportMetricsPlugin.prototype.initialize = function (metricsService) {
    this.metricsService = metricsService;
    if (this["enabled"]) {
        this.bind(metricsService);
    }
};

/** @export */
TransportMetricsPlugin.prototype.enable = function () {
    if (!this["enabled"]) {
        this["enabled"] = true;
        this.bind(this.metricsService);
    }
};

/** @export */
TransportMetricsPlugin.prototype.disable = function () {
    if (this["enabled"]) {
        this["enabled"] = false;
        this.unbind(this.metricsService);
    }
};

TransportMetricsPlugin.prototype.sendOverride = function (/* config, auraXHR, actions, method, options */) {
    var config = Array.prototype.shift.apply(arguments);
    var auraXHR = arguments[0];
    var options = arguments[3];
    var ret = config["fn"].apply(config["scope"], arguments);

    if (ret) {
        var startMark = this.metricsService["markStart"](TransportMetricsPlugin.NAME, 'request');
        var actionDefs = [];
        for (var id in auraXHR.actions) {
            if (auraXHR.actions.hasOwnProperty(id)) {
                actionDefs.push(auraXHR.actions[id].getDef() + '[' + id + ']');
            }
        }

        startMark["context"] = {
            "auraXHRId"     : auraXHR.marker,
            "requestLength" : auraXHR.length,
            "actionDefs"    : actionDefs,
            "requestId"     : auraXHR["requestId"] || (options && options["requestId"])
        };
    }
    return ret;
};

TransportMetricsPlugin.prototype.receiveOverride = function(/* config, auraXHR */) {
    var config  = Array.prototype.shift.apply(arguments);
    var auraXHR = arguments[0];
    var endMark = this.metricsService["markEnd"](TransportMetricsPlugin.NAME, "request");
     
    endMark["context"] = {
        "auraXHRId"      : auraXHR.marker,
        "status"         : auraXHR.request.status,
        "statusText"     : auraXHR.request.statusText,
        "responseLength" : auraXHR.request.responseText.length
    };

    if (this.metricsService.microsecondsResolution()/*timing API is supported*/ && window.performance.getEntriesByName) {
        var resource = window.performance.getEntriesByName(TransportMetricsPlugin.AURA_URL)[auraXHR.marker];
        if (resource) {
            endMark["context"]["xhrDuration"] = resource.duration;
            endMark["context"]["xhrLatency"] = resource.responseStart - resource.fetchStart;
        }
    }

    return config["fn"].apply(config["scope"], arguments);
};

TransportMetricsPlugin.prototype.bind = function () {
    $A.installOverride("ClientService.send", this.sendOverride, this);
    $A.installOverride("ClientService.receive", this.receiveOverride, this);
};

//#if {"excludeModes" : ["PRODUCTION"]}
/** @export */
TransportMetricsPlugin.prototype.postProcess = function (transportMarks) {
    var procesedMarks = [];
    var queue = {};
    for (var i = 0; i < transportMarks.length; i++) {
        var id = transportMarks[i]["context"]["auraXHRId"];
        var phase = transportMarks[i]["phase"];
        if (phase === 'start') {
            queue[id] = transportMarks[i];
        } else if (phase === 'end' && queue[id]){
            var mark = $A.util.apply({}, queue[id], true, true);
            mark["context"]  = $A.util.apply(mark["context"], transportMarks[i]["context"]);
            mark["duration"] = transportMarks[i]["ts"] - mark["ts"];
            mark["phase"]    = 'processed';
            procesedMarks.push(mark);
            delete queue[id];
        }
    }

    return procesedMarks;
};
//#end

TransportMetricsPlugin.prototype.unbind = function () {
    $A.uninstallOverride("ClientService.send", this.sendOverride);
    $A.uninstallOverride("ClientService.receive", this.receiveOverride);
};

$A.metricsService.registerPlugin({
    "name"   : TransportMetricsPlugin.NAME,
    "plugin" : TransportMetricsPlugin
});
