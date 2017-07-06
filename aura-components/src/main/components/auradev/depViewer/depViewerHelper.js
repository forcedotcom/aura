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
    findCallerPaths: function(cmp, startComponent) {
        var nodes = cmp.get("v.nodes");
        var paths = [];
        var pathHolder = [];

        this.traverse(nodes, startComponent, paths, pathHolder);
        return paths;
    },

    traverse: function(nodes, component, paths, pathHolder) {
        // visited
        if(pathHolder.indexOf(component) > -1) {
            return;
        }

        pathHolder.push(component);

        var callers = nodes[component]["callers"];
        if(callers.length === 0) {
            paths.push(pathHolder.join(" <- "));
        } else {
            for(var i=0; i < callers.length; i++) {
                this.traverse(nodes, callers[i], paths, pathHolder);
            }
        }

        pathHolder.pop();
    },

    findDependencies: function(cmp, onlyUniqueDep) {
        var result = [];
        var nodes = cmp.get("v.nodes");
        var app = cmp.get("v.app");

        for(var descr in nodes) {
            if(descr === app) {
                continue;
            }

            var visited = {};
            var uniqDeps = [];
            var node = nodes[descr];

            var depsSize;
            if(onlyUniqueDep) {
                depsSize = this.uniqueDepsSize(nodes, descr, visited, uniqDeps);
            } else {
                depsSize = this.totalDepsSize(nodes, descr, visited);
            }

            // if not unique dep only, it shows all
            if(!onlyUniqueDep || depsSize > 0) {
                var entry = {
                    "descriptor": descr,
                    "uniqDepsSize": (depsSize/1024).toFixed(2),
                    "ownSize": (node["ownSize"]/1024).toFixed(2),
                    "type": node["type"]
                };

                onlyUniqueDep && (entry["uniqDeps"] = uniqDeps.toString());
                result.push(entry);
            }

        }
        return result;
    },

    uniqueDepsSize: function(nodes, component, visited, uniqDeps) {
        // already visited, definitely not unique
        if(visited[component]) {
            return 0;
        }

        visited[component] = true;

        var callees = nodes[component]["callees"];
        // leaves
        if(callees.length === 0) {
            return 0;
        }

        var uniqDepSize = 0;

        for(var i = 0; i < callees.length; i++) {
            var callee = callees[i];
            // has other callers
            if(nodes[callee]["ingressNum"] > 1) {
                continue;
            }

            uniqDepSize += nodes[callee]["ownSize"] + this.uniqueDepsSize(nodes, callee, visited, uniqDeps);
            uniqDeps.push(callee);
        }

        return uniqDepSize;
    },

    totalDepsSize: function(nodes, component, visited) {
        if(visited[component]) {
            return 0;
        }

        visited[component] = true;

        var callees = nodes[component]["callees"];
        // leaves
        if(callees.length === 0) {
            return nodes[component]["ownSize"];
        }

        var depsSize = 0;

        for(var i=0; i < callees.length; i++) {
            var callee = callees[i];

            depsSize += nodes[callee]["ownSize"] + this.totalDepsSize(nodes, callee, visited);
        }

        return depsSize;
    },

    resetTables: function(cmp) {
        cmp.set("v.paths", undefined);
        cmp.set("v.uniqueDeps", undefined);
    }
})// eslint-disable-line semi
