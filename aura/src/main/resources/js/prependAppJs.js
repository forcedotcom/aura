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
    window.Aura || (window.Aura = {});
    window.Aura.bootstrap || (window.Aura.bootstrap = {});
    window.$A = window.$A || {};


    // -- Framework is not ready yet, so implement the minimum set of functions to run!
    window.Aura.ApplicationDefs = {
        cmpExporter   : {},
        classExporter : {},
        resolvedDefs  : {},
        libraryDefs   : {}
    };

    window.$A = {
        componentService: {
            addComponent: function (descriptor, exporter) {
                window.Aura.ApplicationDefs.cmpExporter[descriptor] = exporter;
            },
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
                    resolved[type] = appDefs[type];
                }
            }
        }
    };
}

window.Aura.bootstrap.execAppJs = window.performance && window.performance.now ? window.performance.now() : Date.now();
