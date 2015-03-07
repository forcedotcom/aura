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
var ServerActionsMetricsPlugin = function ServerActionsMetricsPlugin(config) {
    this.config = config;
    this["enabled"] = true;
};

ServerActionsMetricsPlugin.NAME = "serverActions";
ServerActionsMetricsPlugin.prototype = {
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
        var method       = 'getServerActions',
            actionHook   = function () {
                var original = Array.prototype.shift.apply(arguments),
                    action   = arguments[0],
                    markEnd  = metricsCollector.markEnd(ServerActionsMetricsPlugin.NAME, 'dispatch');

                markEnd["context"] = {
                    "id"          : action.getId(),
                    "status"      : action.getState(),
                    "fromStorage" : action.isFromStorage(),
                    "caboose"     : action.isCaboose(),
                    "exclusive"   : action.isExclusive(),
                    "def"         : action.getDef().toString()
                };

                return original.apply(this, arguments);
            },
            beforeHook = function (startMark, config) {
                startMark["phase"] = 'stamp'; //mark as a stamp metric
                var actions = this.getQueuedActions(),
                    ids     = [];

                for (var i = 0; i < actions.length; i++) {
                    var action = actions[i];
                    if (action.getDef().isServerAction() && action.getCallback('SUCCESS')/*allAboardCallback*/) {
                        var success     = action.getCallback('SUCCESS'),
                            error       = action.getCallback('ERROR'),
                            incomplete  = action.getCallback('INCOMPLETE'),
                            actionStart = metricsCollector.markStart(ServerActionsMetricsPlugin.NAME, 'dispatch');

                        actionStart["context"] = {
                            "id"        : action.getId(),
                            "params"    : action.getParams(),
                            "abortable" : action.isAbortable(),
                            "storable"  : action.isStorable(),
                            "def"       : action.getDef().toString()
                        };

                        ids.push(action.getId());
                        // Most of the time the callback is the same for all the cases, but just in case...
                        if (success !== error || success !== incomplete) {
                            action.setCallback(success["s"], actionHook.bind(success["s"], success["fn"]), "SUCCESS");
                            if (incomplete) {
                                action.setCallback(incomplete["s"], actionHook.bind(incomplete["s"], incomplete["fn"]), "INCOMPLETE");
                            }
                            if (error) {
                                action.setCallback(error["s"], actionHook.bind(error["s"], error["fn"]), "ERROR");
                            }
                        } else {
                            action.setCallback(success["s"], actionHook.bind(success["s"], success["fn"]));
                        }
                    }
                }
                startMark["context"] = {"ids": ids};
            };

        metricsCollector["instrument"](
            $A["clientService"]["ActionQueue"].prototype,
            method, 
            ServerActionsMetricsPlugin.NAME,
            true /*async*/,
            beforeHook /*before*/
        );
    },
    // #if {"excludeModes" : ["PRODUCTION"]}
    postProcess: function (actionMarks) {
        var procesedMarks = [];
        var bundle = [];
        var queue  = {};
        var mark,i,j;

        // All this loops are to get all actions in the same bundle
        for (i = 0; i < actionMarks.length; i++) {
            var action = actionMarks[i];
            var id = action["context"]["id"];
            var phase = action["phase"];
            if (phase === 'stamp') {
                action = $A.util.apply({}, action, true, true);
                bundle.push(action);
                action["context"]["children"] = {};
                var children = action["context"]["children"];
                var ids = action["context"]["ids"];
                for (j = 0; j < ids.length; j++) {
                    children[ids[j]] = ' ';
                }
                
            } else if (phase === 'start' && actionMarks[i]["duration"] === undefined) {
                queue[id] = actionMarks[i];
            } else if (phase === 'end' && queue[id]) {
                mark = queue[id];
                mark["context"]  = $A.util.apply(mark["context"], actionMarks[i]["context"]);
                mark["duration"] = actionMarks[i]["ts"] - mark["ts"];
                procesedMarks.push(mark);
                delete queue[id];
            }
        }
        for (i = 0; i < procesedMarks.length; i++) {
            mark = procesedMarks[i];
            for (j = 0; j < bundle.length; j++) {
                var masterMark = bundle[j];
                var markId = mark["context"]["id"];
                if (masterMark["context"]["children"][markId]) {
                    masterMark["context"]["children"][markId] = mark;
                }
                
            }
        }

        return bundle;
    },
    // #end
    unbind: function (metricsCollector) {
        metricsCollector["unInstrument"](
           $A["clientService"]["ActionQueue"].prototype/*host*/, 'getServerActions'/*method*/
        );
    }
};

// Exposing symbols/methods for Google Closure
var p = ServerActionsMetricsPlugin.prototype;
exp(p,
   "initialize",   p.initialize,
    "enable",      p.enable,
    "disable",     p.disable,
    "postProcess", p.postProcess
);

$A.metricsService.registerPlugin({
    "name"   : ServerActionsMetricsPlugin.NAME,
    "plugin" : ServerActionsMetricsPlugin
});