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
 * @description AuraContextPlugin
 * @constructor
 */
var AuraContextPlugin = function AuraContextPlugin(config) {
    this.config = config;
    this["enabled"] = true; // Do not enable it automatically
};

AuraContextPlugin.NAME = "defRegistry";
AuraContextPlugin.prototype = {
    initialize: function (metricsCollector) {
        this.collector = metricsCollector;

        if (this["enabled"]) {
            this.bind(metricsCollector);
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
    bind: function (metricsCollector) {
        var method  = 'merge',
            defIter = function (b) {
                var a = [];
                for (var i = 0; i < b.length; i++) {
                    var def = b[i];
                    if (def['descriptor']) {
                        a.push(def['descriptor']);
                    }
                }
                return a;
            },
            hook = function (original, config) {
                var ret     = original.apply(this, Array.prototype.slice.call(arguments, 1)),
                    cmpDefs = config['componentDefs'],
                    evtDefs = config['eventDefs'],
                    payload =  {},
                    hasDefs = cmpDefs || evtDefs;

                if (cmpDefs) {
                    payload['componentDefs'] = defIter(cmpDefs);
                }

                if (evtDefs) {
                    payload['eventDefs'] = defIter(evtDefs);
                }

                if (hasDefs) {
                    metricsCollector['transaction']('AURAPERF', 'newDefs', {"context": payload});
                }
                
                return ret;
            };

        metricsCollector["instrument"](
            $A.ns.AuraContext.prototype,
            method,
            AuraContextPlugin.NAME,
            false/*async*/,
            null,
            null,
            hook
        );
    },
    //#if {"excludeModes" : ["PRODUCTION"]}
    postProcess: function (transportMarks) {
        return transportMarks;
    },
    // #end
    unbind: function (metricsCollector) {
        metricsCollector["unInstrument"]($A.ns.AuraContext.prototype, 'merge');
    }
};

// Exposing symbols/methods for Google Closure
var p = AuraContextPlugin.prototype;

exp(p,
    "initialize",  p.initialize,
    "enable",      p.enable,
    "disable",     p.disable,
    "postProcess", p.postProcess
);

$A.metricsService.registerPlugin({
    "name"   : AuraContextPlugin.NAME,
    "plugin" : AuraContextPlugin
});
