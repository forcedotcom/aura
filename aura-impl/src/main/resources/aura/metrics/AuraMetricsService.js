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
 * @description The metrics service implementation
 * @constructor
 * @export
**/
Aura.Services.MetricsService = function MetricsService() {
    this.collector                 = { "default": [] };
    this.globalHandlers            = { "transactionEnd": [], "transactionsKilled": [] };
    this.bootstrap                 = {};
    this.registeredPlugins         = {};
    this.pluginInstances           = {};
    this.beaconProviders           = {};
    this.transactions              = {};
    this.doneBootstrap             = false;
    this.pluginsInitialized        = false;
    this.clearCompleteTransactions = true; // In PTEST Mode this is set to false (see initialize method)

    // #if {"excludeModes" : ["PRODUCTION"]}
    this["collector"] = this.collector; // Protected API to access the raw marks
    // #end
};

Aura.Services.MetricsService.PERFTIME = !!(window.performance && window.performance.now);
Aura.Services.MetricsService.TIMER    = Aura.Services.MetricsService.PERFTIME ? window.performance.now.bind(performance) : Date.now.bind(Date);
Aura.Services.MetricsService.START    = 'start';
Aura.Services.MetricsService.END      = 'end';
Aura.Services.MetricsService.STAMP    = 'stamp';
Aura.Services.MetricsService.DEFAULT  = 'default';
Aura.Services.MetricsService.MAXTIME  = 30000; // Max time for a transaction to finish

/**
 * Initialize function
 *@private
**/
Aura.Services.MetricsService.prototype.initialize = function () {
    // #if {"modes" : ["PTEST"]}
        this.setClearCompletedTransactions(false);
    // #end
    this.getPageStartTime();
    this.transactionStart('bootstrap','app');
    this.initializePlugins();
};

/**
 * Instrument a particular method (function) of an object, useful for AOP
 * @param {Object} instance Object that holds the method to hook
 * @param {string} method Method name
 * @param {string} ns Namespace
 * @param {boolean} async
 * @param {function(Object)} before
 * @param {function} after
 * @param {function} override
 * @export
**/
Aura.Services.MetricsService.prototype.instrument = function (instance, method, ns, async, before, after, override) {
    var self     = this,
        original = instance[method],
        beforeFn = typeof before === 'function',
        afterFn  = typeof after === 'function';

    instance[method] = function () {
        var mark = !override && self.markStart(ns, method),
            ret;

        if (beforeFn) {
            Array.prototype.unshift.call(arguments, mark);
            before.apply(this, arguments);
            Array.prototype.shift.call(arguments);
        }

        if (override) {
            var xargs = Array.prototype.slice.call(arguments);
            xargs.unshift(original);
            ret = override.apply(this, xargs);
        } else {
            ret = original.apply(this, arguments);
        }

        if (async) {
            return ret;
        }

        mark = !override && self.markEnd(ns, method);

        if (afterFn) {
            Array.prototype.unshift.call(arguments, mark);
            after.apply(this, arguments);
        }

        return ret;
    };

    instance[method]["__original"] = original;
};

/**
 * UnInstrument a particular method (function) of an object, useful for AOP
 * @param {Object} instance Object that holds the method to hook
 * @param {string} method Method name
 * @export
**/
Aura.Services.MetricsService.prototype.unInstrument = function (instance, method) {
    var original = instance[method]["__original"];
    delete instance[method]["__original"];
    instance[method] = original;
};

/**
 * Initialize registered plugins
 * @private
**/
Aura.Services.MetricsService.prototype.initializePlugins = function () {
    for (var plugin in this.registeredPlugins) {
        this.initializePlugin(plugin, this.registeredPlugins[plugin]);
    }
    this.pluginsInitialized = true;
};

/**
 * Initialize a give plugin
 * @param {string} pluginName Plugin name
 * @param {Object|function} Construtor or Objecct for the plugin
 * @private
**/
Aura.Services.MetricsService.prototype.initializePlugin = function (pluginName, PluginContructor) {
    var pluginInstance = typeof PluginContructor === 'function' ? new PluginContructor() : PluginContructor;
    this.pluginInstances[pluginName] = pluginInstance;
    this.collector[pluginName] = [];
    pluginInstance["initialize"](this);
};

/**
 * Internal method called once the application is ready
 * @private
**/
Aura.Services.MetricsService.prototype.applicationReady = function () {
    this.bootstrapMark("applicationReady");
    this.doneBootstrap = true;

    var bootstrap = this.getBootstrapMetrics();
    var now = this.time();
    this.transactionEnd('bootstrap','app', function (transaction) {
        // We need to override manually the duration to add the time before aura was initialized
        var bootstrapStart = Aura.Services.MetricsService.PERFTIME ? 0 : transaction["pageStartTime"];
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
};

/**
 * Create a transaction based on a given configuration
 * @param {string} ns Namespace of the transaction
 * @param {string} name Name of the transaction
 * @param {Object} transaction Transaction
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.syntheticTransactionStart = function (ns, name, config) {
    var trx = this.createTransaction(ns, name, config);
    $A.util.apply(this.transactions[trx], config, true, true);
    return trx;
};


/**
 * Add a callback everytime a transaction ends.
 * @param {function} callback Function to execute for every transaction
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.onTransactionEnd = function (callback) {
    this.globalHandlers["transactionEnd"].push(callback);
};

/**
 * Unbind a callback everytime a transaction ends.
 * @param {function} callback Function to detach for every transaction
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.detachOnTransactionEnd = function (callback) {
    this.detachHandlerOfType(callback, "transactionEnd");
};

/**
 * Add a callback everytime a transaction ends.
 * @param {function} callback Function to execute for every transaction
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.onTransactionsKilled = function (callback) {
    this.globalHandlers["transactionsKilled"].push(callback);
};

/**
 * Unbind a callback everytime a transaction ends.
 * @param {function} callback Function to detach for every transaction
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.detachOnKilledTransactions = function (callback) {
    this.detachHandlerOfType(callback, "transactionsKilled");
};

/**
 * Unbind a callback for a give action
 * @param {function} callback Function to detach for every transaction
 * @param {name} callback Function to detach for every transaction
**/
Aura.Services.MetricsService.prototype.detachHandlerOfType = function (callback, name) {
    var handlers = this.globalHandlers[name],
        position = handlers.indexOf(callback); // we don't guard, since we control the input name

    if (position > -1) {
        handlers.splice(position, 1);
    }
};


/**
 * Check if we are in a transcation already
 * @return {boolean} Wether we are in a transaction
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.inTransaction = function () {
    return !$A.util.isEmpty(this.transactions);
};


/**
 * Create a transaction
 * @param {string} ns Namespace of the transaction
 * @param {string} id Id of the transaction
 * @param {Object} config Configuration and context for the transaction
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.transaction = function (ns, name, config) {
    config = config || {};
    var postProcess = typeof config === 'function' ? config : config["postProcess"];

    this.createTransaction(ns, name, config);
    this.transactionEnd(ns, name, function (t) {
        t["duration"] = 0; // STAMP so no duration
        if (postProcess) {
            postProcess(t);
        }
    });
};

/**
 * Update a transaction
 * @param {string} ns Namespace of the transaction
 * @param {string} id Id of the transaction
 * @param {Object} config Configuration and context for the transaction
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.transactionUpdate = function (ns, name, config) {
    config = config || {};
    var id          = (ns || Aura.Services.MetricsService.DEFAULT) + ':' + name,
        transaction = this.transactions[id];
    if (transaction) {
        transaction["config"] = $A.util.apply(transaction["config"], config, true, true);
    }
};

/**
 * Start a transaction
 * @param {string} ns Namespace of the transaction
 * @param {string} id Id of the transaction
 * @param {Object} config Configuration and context for the transaction
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.transactionStart = function (ns, name, config) {
    return this.createTransaction(ns, name, config);
};

/**
 * Finish a transaction
 * @param {string} ns Namespace of the transaction
 * @param {string} id Id of the transaction
 * @param {Object} config Configuration and context for the transaction
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.transactionEnd = function (ns, name, config, postProcess) {
    //console.time('>>>> TRANSACTIONPROCESSING > ' + ns + ':' + name);
    var id             = (ns || Aura.Services.MetricsService.DEFAULT) + ':' + name,
        transaction    = this.transactions[id],
        transactionCfg = $A.util.apply((transaction && transaction["config"]) || {}, config, true, true),
        beacon         = this.beaconProviders[ns] ? this.beaconProviders[ns] : this.beaconProviders[Aura.Services.MetricsService.DEFAULT];

    postProcess = typeof config === 'function' ? config : postProcess || transactionCfg["postProcess"];

    if (transaction && (beacon || postProcess || !this.clearCompleteTransactions)) {
        var skipPluginPostProcessing = transactionCfg["skipPluginPostProcessing"],
            parsedTransaction = {
                "id"            : id,
                "ts"            : transaction["ts"],
                "duration"      : this.time() - transaction["ts"],
                "pageStartTime" : this.pageStartTime,
                "marks"         : {},
                "context"       : transactionCfg["context"] || {},
                "unixTS"        : !Aura.Services.MetricsService.PERFTIME // If the browser does not support performance API, all transactions will be Unix Timestamps
            };
        
        // Walk over the collected marks to scope the ones relevant for this transaction 
        // (Between time tart and end)
        for (var plugin in this.collector) {
            var instance = this.pluginInstances[plugin];

            if (this.collector[plugin].length) { // If we have marks for that plugin
                var pluginCollector   = this.collector[plugin],
                    initialOffset     = transaction["offsets"] && (transaction["offsets"][plugin] || 0),
                    tMarks            = pluginCollector.slice(initialOffset),
                    pluginPostProcess = instance && instance.postProcess,
                    parsedMarks       = !skipPluginPostProcessing && pluginPostProcess ? instance.postProcess(tMarks, transactionCfg) : tMarks;

                //#if {"excludeModes" : ["PRODUCTION"]}
                if (!skipPluginPostProcessing && !pluginPostProcess) {
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

        if (this.globalHandlers["transactionEnd"].length) {
            this.callHandlers("transactionEnd", parsedTransaction);
        }

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
        } else {
            this.killLongRunningTransactions(); // it will call its handlers internally
        }

    } else {
        // If there is nobody to process the transaction, we just need to clean it up.
        delete this.transactions[id];
    }
    //console.timeEnd('>>>> TRANSACTIONPROCESSING > ' + ns + ':' + name);
};

/**
 * Clear all saved transactions
 * @public
 * @export
**/

Aura.Services.MetricsService.prototype.clearTransactions = function () {
    this.transactions = {};
};

/**
 * Internal method to call globalHandlers attached
 * @private
**/
Aura.Services.MetricsService.prototype.callHandlers = function (type, t) {
    var handlers = this.globalHandlers[type];
    if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
            handlers[i](t);
        }
    }
};

/**
 * Tries to kill transaction than are been in the queue for a long period of time
 * defined via static param on metricsService
 * @private
**/
Aura.Services.MetricsService.prototype.killLongRunningTransactions = function () {
    var now = this.time();
    var transactionsKilled = [];

    for (var i in this.transactions) {
        var transaction = this.transactions[i];
        if (now - transaction["ts"] > Aura.Services.MetricsService.MAXTIME) {
            transactionsKilled.push(transaction);
            delete this.transactions[i];
        }
    }

    if (transactionsKilled.length && this.globalHandlers["transactionsKilled"].length) {
        this.callHandlers("transactionsKilled", transactionsKilled);
    }
};

//#if {"excludeModes" : ["PRODUCTION"]}

/**
 * Default post processing for marks (only enabled in non production environments)
 * @private
**/
Aura.Services.MetricsService.prototype.defaultPostProcessing = function (customMarks) {
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
            mark["context"]  = $A.util.apply(mark["context"] || {}, customMarks[i]["context"] || {});
            mark["duration"] = customMarks[i]["ts"] - mark["ts"];
            procesedMarks.push(mark);
            delete mark["phase"];
            delete queue[id];
        }
    }
    return procesedMarks;
};

/**
 * Get all internal stored transactions
 * @export
**/
Aura.Services.MetricsService.prototype.getTransactions = function () {
    var transactions = [];
    for (var i in this.transactions) {
        transactions.push(this.transactions[i]);
    }
    return  transactions;
};

/**
 * Get a internal stored transaction by id
 * @param {?string} ns Namespace of the transaction
 * @param {string} id Id of the transaction
 * @export
**/
Aura.Services.MetricsService.prototype.getTransaction = function (ns, id) {
    if (!id) {
        id = ns;
        ns = Aura.Services.MetricsService.DEFAULT; // if no ns is defined -> default
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
};

/**
 * Set the internal storage of transactions
 * @export
**/
Aura.Services.MetricsService.prototype.setClearCompletedTransactions = function (value) {
    this.clearCompleteTransactions = value;
};

//#end

/**
 * Calls sendData on the beacon passing a newly finished transaction
 * @param {Object} beacon Beacon Object
 * @param {Object} transaction Transaction
 * @private
**/
Aura.Services.MetricsService.prototype.signalBeacon = function (beacon, transaction) {
    if (beacon) {
        beacon["sendData"](transaction["id"], transaction);
    }
};

/**
 * Creates a transaction
 * @param {string} ns Namespace of the mark
 * @param {string} name of the mark
 * @param {Object} config Config object
 * @private
**/
Aura.Services.MetricsService.prototype.createTransaction = function (ns, name, config) {
    var id = (ns || Aura.Services.MetricsService.DEFAULT) + ':' + name,
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
};

/**
 * Creates a mark for a give namespace and key action
 * @param {string} ns Namespace of the mark
 * @param {string} name of the mark
 * @param {Object} context Context Object
 * @export
 * @public
**/
Aura.Services.MetricsService.prototype.mark = function (ns, name, context) {
    if (!name) {name = ns; ns = Aura.Services.MetricsService.DEFAULT;}
    var mark        = this.createMarkNode(ns, name, Aura.Services.MetricsService.STAMP, context),
        nsCollector = this.collector[ns],
        collector   = nsCollector ? nsCollector : (this.collector[ns] = []);

    collector.push(mark);
    return mark;
};

/**
 * Creates a start mark for a give namespace and key action
 * @param {string} ns Namespace of the mark
 * @param {string} name of the mark
 * @param {Object} context Context Object
 * @export
 * @public
**/
Aura.Services.MetricsService.prototype.markStart = function (ns, name, context) {
    if (!name) {name = ns; ns = Aura.Services.MetricsService.DEFAULT;}
    var mark        = this.createMarkNode(ns, name, Aura.Services.MetricsService.START, context),
        nsCollector = this.collector[ns],
        collector   = nsCollector ? nsCollector : (this.collector[ns] = []);

    collector.push(mark);
    return mark;
};

/**
 * Creates a end mark for a give namespace and key action
 * @param {string} ns Namespace of the mark
 * @param {string} name of the mark
 * @param {Object} context Context Object
 * @export
 * @public
**/
Aura.Services.MetricsService.prototype.markEnd = function (ns, name, context) {
    if (!name) {name = ns; ns = Aura.Services.MetricsService.DEFAULT;}
    var mark        = this.createMarkNode(ns, name, Aura.Services.MetricsService.END, context),
        nsCollector = this.collector[ns],
        collector   = nsCollector ? nsCollector : (this.collector[ns] = []);

    collector.push(mark);
    return mark;
};

/**
 * Creates a mark node
 * @param {string} ns Namespace of the mark
 * @param {string} name of the mark
 * @param {string} eventType Type of the mark
 * @param {Object} options Options
 * @private
**/
Aura.Services.MetricsService.prototype.createMarkNode = function (ns, name, eventType, options) {
    var context = options ? (options.context || options) : null;
    return {
        "ns"      : ns,
        "name"    : name,
        "phase"   : eventType,
        "ts"      : Aura.Services.MetricsService.TIMER(),
        "context" : context
    };
};

/**
 * Clear Marks
 * @param {?string=} ns Namespace of the marks to clean
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.clearMarks = function (ns) {
    if (ns) {
        if (this.collector[ns]) {
            this.collector[ns] = [];
        }
    } else {
        for (var i in this.collector) {
            this.collector[i] = [];
        }
    }
};

/**
 * Get the page firstByte timestamp from either performance API or a mark in the page
 * @private
**/
Aura.Services.MetricsService.prototype.getPageStartTime = function () {
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
};

/**
 * Generates a bootstrap mark
 * @param {string} mark Key of the mark
 * @param {?} value Value of the mark
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.time = function () {
    return Aura.Services.MetricsService.TIMER();
};

/**
 * Returns if the resolution is microseconds (using the performance API if supported)
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.microsecondsResolution = function () {
    return Aura.Services.MetricsService.PERFTIME;
};

/**
 * Generates a bootstrap mark
 * @param {string} mark Key of the mark
 * @param {?} value Value of the mark
 * @private
**/
Aura.Services.MetricsService.prototype.bootstrapMark = function (mark, value) {
    this.bootstrap[mark] = value || 
    (Aura.Services.MetricsService.PERFTIME ? this.time() : Date.now() - this.getPageStartTime());
};

/**
 * Disable all plugins
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.disablePlugins = function () {
    for (var p in this.pluginInstances) {
        this.disablePlugin(p);
    }
};

/**
 * Diable a plugin by name
 * @param {string} name Name of the plugin
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.disablePlugin = function (name) {
    var plugin = this.pluginInstances[name];
    if (plugin && plugin.disable) {
        plugin["disable"]();
    }
};

/**
 * Enable all plugins
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.enablePlugins = function () {
    for (var p in this.pluginInstances) {
        this.enablePlugin(p);
    }
};

/**
 * Enable plugin by name
 * @param {string} name Name of the plugin
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.enablePlugin = function (name) {
    var plugin = this.pluginInstances[name];
    if (plugin && plugin.enable) {
        plugin["enable"]();
    }
};

/**
 * Register a plugin for metricsServices
 * @param {Object} pluginConfig A plugin object
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.registerPlugin = function (pluginConfig) {
    var pluginName       = pluginConfig["name"],
        PluginContructor = pluginConfig["plugin"];
    this.registeredPlugins[pluginName] = PluginContructor;

    if (this.pluginsInitialized) {
        this.initializePlugin(pluginName, PluginContructor);
    }
};

/**
 * Register a beacon (transport layer) on which to send the finishes transactions
 * @param {Object} beacon Beacon object that hold a "sendData" method
 * @public
 * @export
**/
Aura.Services.MetricsService.prototype.registerBeacon = function (beacon) {
    this.beaconProviders[beacon["name"] || Aura.Services.MetricsService.DEFAULT] = beacon["beacon"] || beacon;
};

/**
 * Returns a JSON Object which contains the bootstrap metrics of the framework and the application
 * @public
 * @return {Object}
 * @export
**/
Aura.Services.MetricsService.prototype.getBootstrapMetrics = function () {
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
};
