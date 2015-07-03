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
 * @description ComponentServiceMetricsPlugin
 * @constructor
 * @export
 */
var ComponentServiceMetricsPlugin = function ComponentServiceMetricsPlugin(config) {
    this.config = config;
    this["enabled"] = false; // Do not enable it automatically
};

ComponentServiceMetricsPlugin.NAME = "componentService";

/** @export */
ComponentServiceMetricsPlugin.prototype.initialize = function (metricsService) {
    this.collector = metricsService;

    if (this["enabled"]) {
        this.bind(metricsService);
    }
};

/** @export */
ComponentServiceMetricsPlugin.prototype.enable = function () {
    if (!this["enabled"]) {
        this["enabled"] = true;
        this.bind(this.collector);
    }
};

/** @export */
ComponentServiceMetricsPlugin.prototype.disable = function () {
    if (this["enabled"]) {
        this["enabled"] = false;
        this.unbind(this.collector);
    }
};

ComponentServiceMetricsPlugin.prototype.bind = function (metricsService) {
    var method = 'newComponentDeprecated',
	    hook  = function () {
            var original = Array.prototype.shift.apply(arguments);
            var config   = arguments[0];

	        var descriptor;
	        if ($A.util.isString(config)) {
	            descriptor = config;
	        } else {
	            descriptor = (config["componentDef"]["descriptor"] || config["componentDef"]) + '';
	        }
            
            metricsService.markStart(ComponentServiceMetricsPlugin.NAME, 'newCmp', {context: {descriptor : descriptor}});
            var ret = original.apply(this, arguments);
            metricsService.markEnd(ComponentServiceMetricsPlugin.NAME, 'newCmp', {context: {descriptor : descriptor}});
            return ret;
	    };

	metricsService.instrument(
	    $A.componentService,
	    method,
	    ComponentServiceMetricsPlugin.NAME,
	    false,/*async*/
	    null,
        null,
        hook
	);
};

//#if {"excludeModes" : ["PRODUCTION"]}
/** @export */
ComponentServiceMetricsPlugin.prototype.postProcess = function (componentMarks) {
    var procesedMarks = [];
    var stack = [];
    for (var i = 0; i < componentMarks.length; i++) {
        var id = componentMarks[i]["context"]["descriptor"];
        var phase = componentMarks[i]["phase"];
        if (phase === 'start') {
            stack.push(componentMarks[i]);
        } else if (phase === 'end') {
            var mark = $A.util.apply({}, stack.pop(), true, true);
            mark["context"]  = $A.util.apply(mark["context"], componentMarks[i]["context"]);
            mark["duration"] = componentMarks[i]["ts"] - mark["ts"];
            procesedMarks.push(mark);
            
        }
    }
    return procesedMarks;
};
//#end	

ComponentServiceMetricsPlugin.prototype.unbind = function (metricsService) {
    metricsService["unInstrument"]($A.componentService, 'newComponentDeprecated');
};

$A.metricsService.registerPlugin({
    "name"   : ComponentServiceMetricsPlugin.NAME,
    "plugin" : ComponentServiceMetricsPlugin
});
