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

if (typeof Aura === "undefined" || !Aura.frameworkJsReady) {
    // Initialize Aura global object if we are the first
    window.Aura = window.Aura || {};
    window.$A = window.$A || {};

    // -- Framework is not ready yet, so implement the minimum set of functiosn to run!
    window.Aura.ApplicationDefs = {
        classExporter : {},
        resolvedDefs  : {},
        libraryDefs   : {}
    };

    // JSon serialization garbage

    Json = {};

    Json.ApplicationKey = {
        "ABSTRACT":"isAbstract", 
        "ACCESS":"xs", 
        "ACTION":"action", 
        "ACTIONS":"action", 
        "ACTIONDEFS":"actionDefs", 
        "ACTIONTYPE":"actionType", 
        "ATTRIBUTES":"attributes", 
        "ATTRIBUTEDEFS":"attributeDefs", 
        "COMPONENTDEF":"componentDef", 
        "CONTROLLERDEF":"controllerDef", 
        "CREATIONPATH":"creationPath", 
        "CSSPRELOADED":"isCSSPreloaded", 
        "DEFAULT":"default", 
        "DEFTYPE":"defType", 
        "DESCRIPTOR":"descriptor", 
        "EVENTDEF":"eventDef", 
        "EVENTS":"events", 
        "FACETS":"facets", 
        "FUNCTIONS":"functions", 
        "HANDLERS":"handlers", 
        "HASSERVERDEPENDENCIES":"hasServerDeps",
        "HELPERDEF":"helperDef", 
        "INCLUDES":"includes", 
        "INTERFACES":"interfaces", 
        "LOCALID":"localId", 
        "MEMBERS":"members", 
        "MODEL":"model", 
        "MODELDEF":"modelDef", 
        "METHODS":"methods", 
        "NAME":"name", 
        "ORIGINAL":"original", 
        "PARAMS":"params", 
        "PROVIDE":"provide", 
        "PROVIDERDEF":"providerDef", 
        "REGISTEREVENTDEFS":"registerEventDefs", 
        "RENDERERDEF":"rendererDef", 
        "REQUIRED":"required", 
        "REQUIREDVERSIONDEFS":"requiredVersionDefs", 
        "RETURNTYPE":"returnType", 
        "SERIAL_ID":"s", 
        "SERIAL_REFID":"r", 
        "STYLEDEF":"styleDef", 
        "SUBDEFS":"subDefs", 
        "SUPERDEF":"superDef", 
        "TYPE":"type", 
        "VALUE":"v", 
        "VALUES":"values", 
        "VALUEPROVIDER":"valueProvider"
    };

    Json.resolveRefsArray = function(arr) {
        var cmpDefCollector = [];
        this._resolveRefs(arr, {}, null, null, cmpDefCollector);
        arr.unshift.apply(arr, cmpDefCollector);
        return arr;
    };

    Json._resolveRefs = function(config, cache, parent, property, collector) {
        if (typeof config === "object" && config !== null) {
            var value;
            var key;
            var v;
            var superCollector;

            if (Array.isArray(config)) {
                for ( var i = 0; i < config.length; i++) {
                    value = config[i];
                    if (typeof value === "object" && value !== null) {
                        this._resolveRefs(value, cache, config, i, collector);
                    }
                }

            } else {
                var serRefId = config[Json.ApplicationKey.SERIAL_REFID];
                if (serRefId !== undefined) {
                    // TODO: @dval @kvenkiteswaran find a better way to whitelist componentDefs
                    if (cache[serRefId]["descriptor"] &&
                        !cache[serRefId]["members"] && // models
                        !cache[serRefId]["actionDefs"] && // actions
                        !cache[serRefId]["type"] && // cmpEvent
                        !cache[serRefId]["actionType"] ) // apex actions and others?
                    {
                        // replace the comp def with a descriptor
                        parent[property] = { "descriptor" : cache[serRefId]["descriptor"] };
                    } else {
                        // replace the ref (r) with its definition (s)
                        parent[property] = cache[serRefId];
                    }

                } else {
                    var serId = config[Json.ApplicationKey.SERIAL_ID];
                    if (serId !== undefined) {
                        value = config[Json.ApplicationKey.VALUE];

                        if (typeof value === "object" && value !== null && (value[Json.ApplicationKey.SERIAL_ID] || value[Json.ApplicationKey.SERIAL_REFID])) {
                            this._resolveRefs(value, cache, parent, property, collector);
                            value = parent[property];
                        } else {
                            // Pull up the values into the config itself
                            if (value["descriptor"] && (value["componentClass"] || value["attributeDefs"])) {
                                var newValueDef = { "descriptor" : value["descriptor"] };
                                cache[serId] = newValueDef;

                                for (key in value) {
                                    v = value[key];
                                    if (typeof v === "object" && v !== null) {
                                        superCollector = [];
                                        this._resolveRefs(v, cache, value, key, superCollector);
                                        collector.push.apply(collector, superCollector);
                                    }
                                }
                                collector.push(value);
                                value = newValueDef;
                            }

                            parent[property] = value;
                        }

                        cache[serId] = value;

                    } else {
                        value = config;
                    }

                    // Recurse into the value's properties
                    for (key in value) {
                        v = value[key];
                        if (typeof v === "object" && v !== null) {
                            this._resolveRefs(v, cache, value, key, collector);
                        }
                    }
                }
            }
        }
    };

    window.Aura.Json = Json;

    window.$A = {
        componentService: {
            addComponentClass: function (descriptor, exporter) {
                window.Aura.ApplicationDefs.classExporter[descriptor] = exporter;
            },
            addLibraryInclude: function (descriptor, dependencies, exporter) {
                window.Aura.ApplicationDefs.libraryDefs[descriptor] = {
                    dependencies: dependencies,
                    exporter : exporter
                };
            }
        },
        clientService: {
            initDefs: function (appDefs) {
                var resolved = window.Aura.ApplicationDefs.resolvedDefs;

                // NS
                resolved["ns"] = appDefs["ns"];
                delete appDefs["ns"];

                // Resolved
                for (var type in appDefs) {
                    resolved[type] = Json.resolveRefsArray(appDefs[type]);
                }
            }
        }
    };
}
