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
var ClientServiceMetricsPlugin = function ClientServiceMetricsPlugin(config) {
    this.config = config;
};

ClientServiceMetricsPlugin.NAME = "clientService";
ClientServiceMetricsPlugin.prototype = {
    enabled: true,
    initialize: function (metricsCollector) {
        this.collector = metricsCollector;
        this.bind(metricsCollector);
    },
    enable: function () {
        if (!this.enabled) {
            this.bind(this.collector);
        }
    },
    disable: function () {
        if (this.enabled) {
            this.unbind(this.collector);
        }
    },
    bind: function (metricsCollector) {
        var method     = 'init',
            startTime  = 0;

        function beforeHook (markStart) {
            startTime = markStart["ts"];
        }

        function afterHook(markEnd) {
            metricsCollector.bootstrapMark("appCreationTime", markEnd["ts"] - startTime);
        }

        metricsCollector["instrument"](
            $A.clientService,
            method, 
            ClientServiceMetricsPlugin.NAME,
            false,
            beforeHook,
            afterHook
        );
    },
    unbind: function (metricsCollector) {
        metricsCollector["unInstrument"](
            $A.util.transport,
            'request'
        );
    },
    postProcess: function (marks) {
        // Remove them all since we already got the appCreation metrics
        return [];
    }
};

ClientServiceMetricsPlugin.prototype["initialize"] = ClientServiceMetricsPlugin.prototype.initialize;

$A.metricsService.registerPlugin({
    "name"   : ClientServiceMetricsPlugin.NAME,
    "plugin" : ClientServiceMetricsPlugin
});