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
    this.collector                 = {"default": []};
    this.globalHandlers            = {"transactionEnd": []};
    this.bootstrap                 = {};
    this.registeredPlugins         = {};
    this.pluginInstances           = {};
    this.beaconProviders           = {};
    this.transactions              = {};
    this.doneBootstrap             = false;
    this.clearCompleteTransactions = true; // In PTEST Mode this is set to false (see initialize method)

    // #if {"excludeModes" : ["PRODUCTION"]}
    this["collector"] = this.collector; // Protected API to access the raw marks
    // #end
};

MetricsService.PERFTIME = !!(window.performance && window.performance.now);
MetricsService.TIMER    = MetricsService.PERFTIME ? window.performance.now.bind(performance) : Date.now.bind(Date);
MetricsService.START    = 'start';
MetricsService.END      = 'end';
MetricsService.STAMP    = 'stamp';
MetricsService.DEFAULT  = 'default';

MetricsService.prototype = {
    initialize: function() {
        this.getPageStartTime();
        this.transactionStart('bootstrap','app');
        this.initializePlugins();
        // #if {"modes" : ["PTEST"]}
            this.setClearCompletedTransactions(false);
        // #end

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
        pluginInstance["initialize"](this);
    },
    applicationReady: function () {
        this.bootstrapMark("applicationReady");
        this.doneBootstrap = true;

        var bootstrap = this.getBootstrapMetrics();
        var now = this.time();
        this.transactionEnd('bootstrap','app', function (transaction) {
            // We need to override manually the duration to add the time before aura was initialized
            var bootstrapStart = MetricsService.PERFTIME ? 0 : transaction["pageStartTime"];
            transaction["marks"]["bootstrap"] = bootstrap;
            transaction["ts"] = bootstrapStart;
            transaction["duration"] = now - bootstrapStart;
        });

        // #if {"modes" : ["PRODUCTION"]}
        var beacons = this.beaconProviders;
        if ($A.util.isEmpty(beacons)) {
            this.disablePlugins();
            this.clearMarks();
        }
        // #end        
    },
    onTransactionEnd: function (callback) {
        this.globalHandlers["transactionEnd"].push(callback);
        this.hasGlobalHandlers = true;
    },
    inTransaction: function () {
        return !$A.util.isEmpty(this.transactions);
    },
    transaction: function (ns, name, config) {
        config = config || {};
        var postProcess = typeof config === 'function' ? config : config["postProcess"];

        this.createTransaction(ns, name, config);
        this.transactionEnd(ns, name, function (t) {
            t["duration"] = 0; // STAMP so no duration
            if (postProcess) {
                postProcess(t);
            }
        });
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
        var id             = (ns || MetricsService.DEFAULT) + ':' + name,
            transaction    = this.transactions[id],
            transactionCfg = (transaction && transaction["config"]) || {},
            beacon         = this.beaconProviders[ns] ? this.beaconProviders[ns] : this.beaconProviders[MetricsService.DEFAULT],
            postProcess    = typeof config === 'function' ? config : (config["postProcess"] || transactionCfg["postProcess"]);

        if (transaction && (beacon || postProcess || !this.clearCompleteTransactions)) {
            var skipPluginPostProcessing = config["skipPluginPostProcessing"] || transactionCfg["skipPluginPostProcessing"],
                context = transactionCfg["context"] || {},
                parsedTransaction = {
                    "id"            : id,
                    "ts"            : transaction["ts"],
                    "duration"      : this.time() - transaction["ts"],
                    "pageStartTime" : this.pageStartTime,
                    "marks"         : {},
                    "unixTS"        : !MetricsService.PERFTIME, // If the browser does not support performance API, all transactions will be Unix Timestamps
                    "context"       : $A.util.apply(context, config["context"], true, true)
                };

            for (var plugin in this.collector) {
                var instance = this.pluginInstances[plugin];

                if (this.collector[plugin].length) { // If we have marks for that plugin
                    var pluginCollector   = this.collector[plugin],
                        initialOffset     = transaction["offsets"] && (transaction["offsets"][plugin] || 0),
                        tMarks            = pluginCollector.slice(initialOffset),
                        pluginPostProcess = instance && instance.postProcess,
                        parsedMarks       = !skipPluginPostProcessing && pluginPostProcess ? instance.postProcess(tMarks) : tMarks;

                    //#if {"excludeModes" : ["PRODUCTION"]}
                    if (!skipPluginPostProcessing && !pluginPostProcess && this.defaultPostProcessing) {
                        parsedMarks = this.defaultPostProcessing(tMarks);
                    }
                    //#end

                    if (parsedMarks && parsedMarks.length) {
                        parsedTransaction["marks"][plugin] = parsedMarks;
                    }
                }
            }

            if (postProcess) {
                postProcess(parsedTransaction);
            }

            //#if {"excludeModes" : ["PRODUCTION"]}
                if (this.hasGlobalHandlers) {
                    this.callHandlers("transactionEnd", parsedTransaction);
                }
            //#end

            this.signalBeacon(beacon, parsedTransaction);

            // Cleanup transaction
            if (!this.clearCompleteTransactions) {
                // Only for non-prod, to keep the transactions stored
                var newId = id + ':' + Math.floor(parsedTransaction["ts"]);
                this.transactions[newId] = parsedTransaction;
                parsedTransaction["id"] = newId;
            }
            delete this.transactions[id];

            if (!this.inTransaction()) {
                this.clearMarks();
            }
        } else {
            // If there is nobody to process the transaction, we just need to clean it up.
            delete this.transactions[id];
        }
    },
    clearTransactions: function () {
        this.transactions = {};
    },
    //#if {"excludeModes" : ["PRODUCTION"]}
    defaultPostProcessing: function (customMarks) {
        var procesedMarks = [];
        var queue = {};
        for (var i = 0; i < customMarks.length; i++) {
            var id = customMarks[i]["ns"] + customMarks[i]["name"];
            var phase = customMarks[i]["phase"];
            if (phase === 'stamp') {
                procesedMarks.push(customMarks[i]);
            } else if (phase === 'start') {
                queue[id] = customMarks[i];
            } else if (phase === 'end' && queue[id]) {
                var mark = queue[id];
                mark["context"]  = $A.util.apply(mark["context"], customMarks[i]["context"]);
                mark["duration"] = customMarks[i]["ts"] - mark["ts"];
                procesedMarks.push(mark);
                delete mark["phase"];
                delete queue[id];
            }
        }
        return procesedMarks;
    },
    callHandlers: function (type, t) {
        var handlers = this.globalHandlers[type];
        if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](t);
            }
        }
    },
    getTransactions: function () {
        var transactions = [];
        for (var i in this.transactions) {
            transactions.push(this.transactions[i]);
        }
        return  transactions;
    },
    getTransaction: function (ns, id) {
        if (!id) {
            id = ns;
            ns = MetricsService.DEFAULT; // if no ns is defined -> default
        }
        // Loop, dont do a direct match on the object key.
        // Because we augment the id with the timestamp ex: s1:foo:123
        // so consecuent transactions dont collision
        var key = id.indexOf(':') === -1  ? (ns + ':' + name) : id;
        for (var i in this.transactions) {
            var t = this.transactions[i];
            if (t["id"].indexOf(key) === 0) {
                return t;
            }
        }
        
    },
    setClearCompletedTransactions: function (value) {
        this.clearCompleteTransactions = value;
    },
    //#end
    signalBeacon: function (beacon, transaction, postProcessResult) {
        var payload = postProcessResult || transaction;
        if (beacon) {
            beacon["sendData"](payload["id"], payload);
        }
    },
    createTransaction: function (ns, name, config) {
        var id = (ns || MetricsService.DEFAULT) + ':' + name,
            transaction = {
                "id"            : id,
                "offsets"       : {},
                "ts"            : this.time(),
                "config"        : config || {}
            },
            offsets = transaction["offsets"];

        for (var c in this.collector) {
            offsets[c] = this.collector[c].length;
        }

        this.transactions[id] = transaction;
        return id;
    },
    markStamp: function (ns, name) {
        if (!name) {name = ns; ns = MetricsService.DEFAULT;}
        var mark        = this.createMarkNode(ns, name, MetricsService.STAMP),
            nsCollector = this.collector[ns], 
            collector   = nsCollector ? nsCollector : (this.collector[ns] = []);

        collector.push(mark);
        return mark;
    },
    markStart: function (ns, name, context) {
        if (!name) {name = ns; ns = MetricsService.DEFAULT;}
        var mark        = this.createMarkNode(ns, name, MetricsService.START, context),
            nsCollector = this.collector[ns], 
            collector   = nsCollector ? nsCollector : (this.collector[ns] = []);

        collector.push(mark);
        return mark;
    },
    markEnd: function (ns, name, context) {
        if (!name) {name = ns; ns = MetricsService.DEFAULT;}
        var mark = this.createMarkNode(ns, name, MetricsService.END, context);
        this.collector[ns].push(mark);
        return mark;
    },
    createMarkNode: function (ns, name, eventType, context) {
        return {
            "ns"      : ns, 
            "name"    : name,
            "phase"   : eventType,
            "ts"      : MetricsService.TIMER(),
            "context" : context || null /*keep the shape of the object for perf*/
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
        if (!this.pageStartTime) {
            var p = window.performance;
            var pst;
            if (p && p.timing && p.timing.navigationStart) {
                pst = p.timing.navigationStart;
            } else {
                pst = window["pageStartTime"];
            }
            this.pageStartTime = pst;
        }
        return this.pageStartTime;
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
    registerBeacon: function (beacon) {
        this.beaconProviders[beacon["name"] || MetricsService.DEFAULT] = beacon["beacon"] || beacon;
    },
    getBootstrapMetrics: function () {
        var bootstrap     = this.bootstrap,
            pageStartTime = bootstrap["pageStartTime"];
        
        // We cache it after the first call
        if (!pageStartTime) {
            pageStartTime = this.getPageStartTime();
            bootstrap["pageStartTime"] = pageStartTime;

            if (window.performance && performance.timing && performance.navigation) {
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

                if (performance.getEntries) {
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
        }
        return bootstrap;
    }
};
//#include aura.metrics.AuraMetricsService_export