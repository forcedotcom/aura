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
        var action = cmp.get("c.getDependenciesWithHashCodes");
        action.setParam("component", cmp.get("v.def"));

        action.setCallback(this, function () {
            var defs = action.getReturnValue();
            if(defs && defs.dependencies) {
                var dependencies = defs.dependencies.sort(this.dependencySorter);
                cmp.set("v.dependencies", dependencies);

                var metrics = this.getMetricsOnDependencies(dependencies);
                this.addMetrics(cmp, metrics);
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
        if(a.defType === b.defType) {
            if(a.descriptor === b.descriptor) {
                return 0;
            }
            return a.descriptor > b.descriptor?1:-1;
        }

        return a.defType > b.defType?1:-1;
    },
    
    getMetricsOnDependencies: function(data) {
        var counts = {};
        var defType;
        for(var c=0;c<data.length;c++) {
            defType = data[c].defType;
            if(!counts.hasOwnProperty(defType)) {
                counts[defType] = 0;
            }
            counts[defType]++;
        }

        var returnedCounts = [];
        for(defType in counts) {
            returnedCounts.push({"defType": defType, "count": counts[defType]});
        }

        return { "counts": returnedCounts };
    },

    addMetrics: function(cmp, newMetrics) {
        var metrics = cmp.get("v.metrics") || {};
        Object.assign(metrics, newMetrics);
        cmp.set("v.metrics", metrics);
    }
})// eslint-disable-line semi
