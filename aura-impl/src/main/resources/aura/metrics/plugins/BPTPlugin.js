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
 * BPTPlugin
 * =================
 * This plugin captures BPT (Browser Processing Time).
 * BPT includes any time spent browser side such as rendering, paint, JS execution
 * @description BPT plugin
 * @constructor
 * @export
 */
var BPTPlugin = function BPTPlugin(config) {
    this.config = config;
    this["enabled"] = true;
};

BPTPlugin.NAME = "bpt";

/** @export */
BPTPlugin.prototype.initialize = function (metricsService) {
    this.metricsService = metricsService;
};

/** @export */
BPTPlugin.prototype.enable = function () {
    if (!this["enabled"]) {
        this["enabled"] = true;
    }
};

/** @export */
BPTPlugin.prototype.disable = function () {
    if (this["enabled"]) {
        this["enabled"] = false;
    }
};

/** @export */
BPTPlugin.prototype.postProcess = function (marks, trxCfg) {
    if (trxCfg && trxCfg['pageTransaction']) {
        var bpt = 0;

        marks.forEach(function(mark) {
            bpt += mark['context']['duration'];
        });
        $A.metricsService.clearMarks('bpt');

        trxCfg['context']['bpt'] = Math.floor(bpt);
        return [];
    }
};

$A.metricsService.registerPlugin({
    "name"   : BPTPlugin.NAME,
    "plugin" : BPTPlugin
});
