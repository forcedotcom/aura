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
 * ClientServiceMetricsPlugin
 * =================
 * This plugin hooks into the ClientService.
 * In particular the following methods:
 * init(): Tracks the time it take to create and render the app
 *
 * @description Client Service metrics plugin
 * @constructor
 * @export
 */
var ClientServiceMetricsPlugin = function ClientServiceMetricsPlugin(config) {
    this.config = config;
    this["enabled"] = true;
};

ClientServiceMetricsPlugin.NAME = "clientService";

/** @export */
ClientServiceMetricsPlugin.prototype.initialize = function (metricsService) {
    this.collector = metricsService;
    if (this["enabled"]) {
        this.bind(metricsService);
    }
};

/** @export */
ClientServiceMetricsPlugin.prototype.enable = function () {
    if (!this["enabled"]) {
        this["enabled"] = true;
        this.bind(this.collector);
    }
};

/** @export */
ClientServiceMetricsPlugin.prototype.disable = function () {
    if (this["enabled"]) {
        this["enabled"] = false;
        this.unbind(this.collector);
    }
};

ClientServiceMetricsPlugin.prototype.bind = function (metricsService) {
    var method = 'init';
    var startTime = 0;

	function beforeHook (markStart) {
	    startTime = markStart["ts"];
	}
	
	function afterHook(markEnd) {
	    Aura.bootstrapMark("appCreationTime", markEnd["ts"] - startTime);
	}
	
	metricsService.instrument(
	    $A["clientService"],
	    method, 
	    ClientServiceMetricsPlugin.NAME,
	    false,
	    beforeHook,
	    afterHook
	);
};

ClientServiceMetricsPlugin.prototype.unbind = function (metricsService) {
    metricsService["unInstrument"]($A["clientService"], 'init');
};

/** @export */
ClientServiceMetricsPlugin.prototype.postProcess = function () {
    // Remove them all since we already got the appCreation metrics
    return [];
};

// Register the plugin
$A.metricsService.registerPlugin({
    "name"   : ClientServiceMetricsPlugin.NAME,
    "plugin" : ClientServiceMetricsPlugin
});
