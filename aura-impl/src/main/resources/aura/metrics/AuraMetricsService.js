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

Date.now = (Date.now || function () {  // thanks IE8
    return new Date().getTime();
});

/**
 * @description The storage service implementation
 * @constructor
 * @param {Object} config The configuration describing the characteristics of the storage to be created.
 */
var MetricsService = function MetricsService(config) {
    this.collector         = {"default": []};
    this.bootstrap         = {};
    this.registeredPlugins = {};
    this.pluginInstances   = {};
    this.beaconProviders   = {};
    this.transactions      = {};
    this.doneBootstrap     = false;
};

MetricsService.TIMER   = window.performance ? window.performance.now.bind(performance) : Date.now.bind(Date);
MetricsService.START   = 'start';
MetricsService.END     = 'end';
MetricsService.STAMP   = 'stamp';
MetricsService.DEFAULT = 'default';

MetricsService.prototype = {
    initialize: function() {
        this.transactionStart('bootstrap','app');
        this.initializePlugins();
    },
    instrument: function (instance, method, ns, async, before, after, override) {
        var self     = this,
            original = instance[method],
            beforeFn = typeof before === 'function',
            afterFn  = typeof after === 'function';

        instance[method] = function () {
            var mark = self.markStart(ns, method),
                ret;

            if (beforeFn) {
                before.apply(this, Array.prototype.concat.apply(mark, arguments));
            }

            if (override) {
                ret = override.apply(this, Array.prototype.concat.apply(original, arguments));
            } else {
                ret = original.apply(this, arguments);
            }

            if (async) {
                return ret;
            }

            mark = self.markEnd(ns, method);

            if (afterFn) {
                after.apply(this, Array.prototype.concat.apply(mark, arguments));
            }

            return ret;
        };

        instance[method]["__original"] = original;
    },
    unInstrument: function (instance, method) {
        var original = instance[method]["__original"];
        delete instance[method]["__original"];
        instance[method] = original;
    },
    initializePlugins: function () {
        for (var plugin in this.registeredPlugins) {
            this.initializePlugin(plugin, this.registeredPlugins[plugin]);
        }
    },
    initializePlugin: function (pluginName, PluginContructor) {
        var pluginInstance = typeof PluginContructor === 'function' ? new PluginContructor() : PluginContructor;
        this.pluginInstances[pluginName] = pluginInstance;
        this.collector[pluginName] = [];
        if (pluginInstance["enabled"]) {
            pluginInstance["initialize"](this);
        }
    },
    applicationReady: function () {
        var self = this;
        this.bootstrapMark("applicationReady");
        this.doneBootstrap = true;

        this.transactionEnd('bootstrap','app', function (transaction) {
            self.bootstrap["marks"] = transaction["marks"];
        });

        // #if {"modes" : ["PRODUCTION"]}
        var beacons = this.beaconProviders;
        if ($A.util.isEmpty(beacons)) {
            this.disablePlugins();
            this.clearMarks();
        }
        // #end        
    },
    inTransaction: function () {
        return !$A.util.isEmpty(this.transactions);
    },
    transaction: function (ns, name, config) {
        //TODO
    },
    transactionUpdate: function (ns, name, config) {
        config = config || {};
        var id          = (ns || MetricsService.DEFAULT) + ':' + name,
            transaction = this.transactions[id];
        if (transaction) {
            transaction["config"] = $A.util.apply(transaction["config"], config, true, true);
        }
    },
    transactionStart: function (ns, name, config) {
        return this.createTransaction(ns, name, config);
    },
    transactionEnd: function (ns, name, config) {
        config = config || {};
        var id          = (ns || MetricsService.DEFAULT) + ':' + name,
            transaction = this.transactions[id],
            beacon      = this.beaconProviders[ns] ? this.beaconProviders[ns] : this.beaconProviders[MetricsService.DEFAULT],
            postProcess = transaction && (typeof config === 'function') ? config : (config["postProcess"] || transaction["config"]["postProcess"]),
            skipPluginPostProcessing = config["skipPluginPostProcessing"] || transaction["config"]["skipPluginPostProcessing"];

        if (transaction && (beacon || postProcess)) {
            transaction.marks = {};
            for (var plugin in this.pluginInstances) {
                var instance = this.pluginInstances[plugin];

                if (this.collector[plugin].length) { // If we have marks for that plugin
                    var pluginCollector = this.collector[plugin],
                        initialOffset   = transaction["offsets"][plugin],
                        tMarks          = pluginCollector.slice(initialOffset),
                        parsedMarks     = instance.postProcess && !skipPluginPostProcessing ? instance.postProcess(tMarks) : tMarks;

                    if (parsedMarks && parsedMarks.length) {
                        transaction.marks[plugin] = parsedMarks;
                    }
                }
            }

            if (postProcess) {
                postProcess(transaction, this.signalBeacon.bind(this, beacon, transaction));
            }

            // cleanup
            delete this.transactions[id];
            if (!this.inTransaction()) {
                this.clearMarks();
            }
        }
    },
    signalBeacon: function (beacon, transaction) {
        if (beacon) {
            beacon.sendData(transaction);
        }
    },
    createTransaction: function (ns, name, config) {
        var id = (ns || MetricsService.DEFAULT) + ':' + name,
            transaction = {
                "id"      : id,
                "offsets" : {},
                "config"  : config || {}
            },
            offsets = transaction["offsets"];

        for (var c in this.collector) {
            offsets[c] = this.collector[c].length;
        }

        this.transactions[id] = transaction;
        return id;
    },
    mark: function (ns, name) {
        if (!name) {name = ns; ns = MetricsService.DEFAULT;}
        var mark        = this.createMarkNode(ns, name, MetricsService.STAMP),
            nsCollector = this.collector[ns], 
            collector   = nsCollector ? nsCollector : (this.collector[ns] = []);

        collector.push(mark);
        return mark;
    },
    markStart: function (ns, name) {
        if (!name) {name = ns; ns = MetricsService.DEFAULT;}
        var mark        = this.createMarkNode(ns, name, MetricsService.START),
            nsCollector = this.collector[ns], 
            collector   = nsCollector ? nsCollector : (this.collector[ns] = []);

        collector.push(mark);
        return mark;
    },
    markEnd: function (ns, name) {
        if (!name) {name = ns; ns = MetricsService.DEFAULT;}
        var mark = this.createMarkNode(ns, name, MetricsService.END);
        this.collector[ns].push(mark);
        return mark;
    },
    createMarkNode: function (ns, name, eventType) {
        return {
            "ns"      : ns, 
            "name"    : name,
            "phase"   : eventType,
            "ts"      : MetricsService.TIMER(),
            "context" : null /*keep the shape of the object for perf*/
        };
    },
    clearMarks: function (ns) {
        if (ns) {
            if (this.collector[ns]) {
                this.collector[ns] = [];
            }
        } else {
            for (var i in this.collector) {
                this.collector[i] = [];
            }
        }
    },
    getPageStartTime: function () {
        var p = window.performance;
        if (p && p.timing && p.timing.navigationStart) {
            return p.timing.navigationStart;
        } else {
            return window.pageStartTime;
        }
    },
    time: function () {
        return MetricsService.TIMER();
    },
    bootstrapMark: function (mark, value) {
        this.bootstrap[mark] = value || this.time();
    },
    disablePlugins:function () {
        for (var p in this.pluginInstances) {
            this.disablePlugin(p);
        }
    },
    disablePlugin: function (name) {
        var plugin = this.pluginInstances[name];
        if (plugin && plugin.disable) {
            plugin["disable"]();
        }
    },
    enablePlugins: function () {
        for (var p in this.pluginInstances) {
            this.enablePlugin(p);
        }
    },
    enablePlugin: function (name) {
        var plugin = this.pluginInstances[name];
        if (plugin && plugin.enable) {
            plugin["enable"]();
        }
    },
    registerPlugin: function (pluginConfig) {
        var pluginName       = pluginConfig["name"],
            PluginContructor = pluginConfig["plugin"];
        this.registeredPlugins[pluginName] = PluginContructor;

        if (this.doneBootstrap) { // activate inmediately if we are done with bootstrap
            this.initializePlugin(pluginName, PluginContructor);
        }
    },
    registerBeacon: function (beaconConfig) {
        this.beaconProviders[beaconConfig["name"] || MetricsService.DEFAULT] = pluginConfig["beacon"];
    },
    getBootstrapMetrics: function () {
        var bootstrap     = this.bootstrap,
            pageStartTime = bootstrap["pageStartTime"];
        // We will cache it after the first call
        if (!pageStartTime) {
            pageStartTime = this.getPageStartTime();
            bootstrap["pageStartTime"] = pageStartTime;
            if (performance && performance.timing && performance.navigation) {
                // TODO: Eventually make this strings smaller to reduce payload
                var pn = performance.navigation;
                var pt = performance.timing;
                bootstrap["timing"] = {
                    "redirects"       : pn.redirectCount,
                    "type"            : pn.type,
                    "navigationStart" : pt.navigationStart,
                    "redirectStart"   : pt.redirectStart,
                    "redirectEnd"     : pt.redirectEnd,
                    "fetchStart"      : pt.fetchStart,
                    "dnsStart"        : pt.domainLookupStart,
                    "dnsEnd"          : pt.domainLookupEnd,
                    "connectStart"    : pt.connectStart,
                    "connectEnd"      : pt.connectEnd,
                    "requestStart"    : pt.requestStart,
                    "responseStart"   : pt.responseStart,
                    "responseEnd"     : pt.responseEnd,
                    "domLoading"      : pt.domLoading,
                    "domInteractive"  : pt.domInteractive,
                    "contentLoadStart": pt.domContentLoadedEventStart,
                    "contentLoadEnd"  : pt.domContentLoadedEventEnd,
                    "domComplete"     : pt.domComplete,
                    "loadEventStart"  : pt.loadEventStart,
                    "loadEventEnd"    : pt.loadEventEnd,
                    "unloadEventStart": pt.unloadEventStart,
                    "unloadEventEnd"  : pt.unloadEventEnd
                };
                bootstrap["requests"] = ($A.util.filter(performance.getEntries(), 
                    function (resource) {
                        return resource.responseEnd < bootstrap["applicationReady"];
                    })).map(function (resource) {
                        return {
                            "name"         : resource.name,
                            "duration"     : resource.duration,
                            "startTime"    : resource.startTime,
                            "redirectTime" : resource.redirectEnd - resource.redirectStart,
                            "dnsTime"      : resource.domainLookupEnd - resource.domainLookupStart,
                            "requestStart" : resource.requestStart,
                            "responseEnd"  : resource.responseEnd
                        };
                    }
                );
            }
        }
        return bootstrap;
    }
};

//#include aura.metrics.AuraMetricsService_export
