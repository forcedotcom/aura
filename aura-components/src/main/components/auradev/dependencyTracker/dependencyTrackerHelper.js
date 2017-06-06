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
    getDependencies: function(cmp) {
        var action = cmp.get("c.getDependencyMetrics");
        action.setParam("component", cmp.get("v.def"));

        action.setCallback(this, function () {
            var defs = action.getReturnValue();
            var namespaceMetrics = {};
            if(defs && defs.dependencies && defs.usages) {
                var usages = defs.usages;
                var dependencies = defs.dependencies.sort(this.dependencySorter);
                for (var i = 0; i < dependencies.length; i++) {
                    var dependencyDescriptor = dependencies[i].descriptor;
                    dependencies[i].usages = usages[dependencyDescriptor];
                    var namespace = (dependencyDescriptor.split("://")[1]).split(/[:.]/)[0];
                    if (!namespaceMetrics[namespace]) {
                        namespaceMetrics[namespace] = +dependencies[i].prodFileSize;
                    } else {
                        namespaceMetrics[namespace] += +dependencies[i].prodFileSize;
                    }
                }
                var namespaces = Object.keys(namespaceMetrics).map(function(key) { return {namespace: key, size: namespaceMetrics[key]}; });
                namespace = namespaces.sort(function(a, b) {
                    return b.size - a.size;
                });
                cmp.set("v.dependencies", dependencies);
                cmp.set("v.namespaces", namespaces);
            } else {
                cmp.set("v.dependencies", []);
            }
            cmp.set("v.processing", false);
            
            if(defs && defs.error) {
                cmp.set("v.error", "Error while trying to retrieve dependencies for '" + cmp.get("v.def") + "':" + defs.error);
            }
        });

        cmp.set("v.processing", true);
        $A.enqueueAction(action);
    },

    dependencySorter: function(a, b) {
        if (a.fileSize && b.fileSize) {
            return  b.fileSize - a.fileSize;
        } else if (a.fileSize) {
            return -1;
        } else if (b.fileSize) {
            return 1;
        }

        return 0;
    }
})// eslint-disable-line semi
