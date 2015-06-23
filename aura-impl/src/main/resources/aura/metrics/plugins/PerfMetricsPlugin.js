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
 * @description Transport metrics plugin
 * @constructor
 */
var PerfMetricsPlugin = function PerfMetricsPlugin(config) {
    this.config = config;
    this["enabled"] = true;
};

PerfMetricsPlugin.NAME = "server";
PerfMetricsPlugin.prototype = {
    initialize: function (metricsService) {
        this.collector = metricsService;
        if (this["enabled"]) {
            this.bind(metricsService);
        }
    },
    enable: function () {
        if (!this["enabled"]) {
            this["enabled"] = true;
            this.bind(this.collector);
        }
    },
    disable: function () {
        if (this["enabled"]) {
            this["enabled"] = false;
            this.unbind(this.collector);
        }
    },
    processResponsesOverride : function (/* config, auraXHR, responseObject, noAbort */) {
        var config         = Array.prototype.shift.apply(arguments),
            responseObject = arguments[1],
            perfData       = responseObject["perf"];
            stampMark      = this.collector["mark"](PerfMetricsPlugin.NAME, 'perf');

        if (perfData) {
            console.log(perfData);
            stampMark["context"] = perfData;
        }

        return config["fn"].apply(config["scope"], arguments);
    },
    bind: function (metricsService) {
        $A.installOverride("ClientService.processResponses", this.processResponsesOverride, this);
    },
    //#if {"excludeModes" : ["PRODUCTION"]}
    postProcess: function (transportMarks) {
        var procesedMarks = [];
        var queue = {};
        for (var i = 0; i < transportMarks.length; i++) {
            var id = transportMarks[i]["context"]["aura.num"];
            var phase = transportMarks[i]["phase"];
            if (phase === 'stamp') {
                procesedMarks.push(transportMarks[i]);
            } else if (phase === 'start') {
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
    },
    // #end
    unbind: function (metricsService) {
        $A.uninstallOverride("ClientService.processResponses", this.processResponsesOverride);
    }
};

// Exposing symbols/methods for Google Closure
var p = PerfMetricsPlugin.prototype;

exp(p,
    "initialize",  p.initialize,
    "enable",      p.enable,
    "disable",     p.disable,
    "postProcess", p.postProcess
);

$A.metricsService.registerPlugin({
    "name"   : PerfMetricsPlugin.NAME,
    "plugin" : PerfMetricsPlugin
});
