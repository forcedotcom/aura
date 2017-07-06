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
({
    getDeps: function(cmp, evt, helper) {
        var action = cmp.get("c.createGraph");
        var app = cmp.get("v.app");
        if(!app) {
            // using auradoc as default app
            app = "markup://auradocs:docs";
            cmp.set("v.app", app);
        }

        action.setParam("app", app);

        action.setCallback(this, function () {
            var nodes = action.getReturnValue();

            if(!nodes || Object.keys(nodes).length < 2) {
                var message = "Something is wrong! Failed to get dependency graph from server.";
                var msgCmp = cmp.find("message");
                msgCmp.set("v.severity", "error");
                msgCmp.set("v.title", message);
                return;
            }

            cmp.set("v.nodes", nodes);
            var appDepsSize = helper.totalDepsSize(nodes, app, {});
            cmp.set("v.appDepsSize", (appDepsSize/1024).toFixed(2) + "KB");
        });

        $A.enqueueAction(action);
    },

    findAllCallerPaths: function(cmp, evt, helper) {
        helper.resetTables(cmp);

        var startComponent = cmp.find("consumedCmp").get("v.value");
        if(!startComponent) {
            return;
        }

        var paths = helper.findCallerPaths(cmp, startComponent.trim());
        cmp.set("v.paths", paths);
    },

    findAllUniqueDeps: function(cmp, evt, helper) {
        helper.resetTables(cmp);

        var onlyUniqueDep = cmp.find("uniqDepsOnly").get("v.value");

        var uniqueDeps = helper.findDependencies(cmp, onlyUniqueDep);
        uniqueDeps.sort(function(a, b) {
            return b["uniqDepsSize"] - a["uniqDepsSize"];
        });

        // insert title
        uniqueDeps.unshift({
            "descriptor": "Descriptor",
            "uniqDepsSize": "Deps Size (KB)",
            "ownSize": "Own Size (KB)",
            "type": "Type",
            "uniqDeps": "Unique Dependencies"
        });
        cmp.set("v.uniqueDeps", uniqueDeps);
    }
})// eslint-disable-line semi
