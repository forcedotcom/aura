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

 // This code is hardcoded in AppJs.java. 
 // Is here just to make it easier to minify when changed
typeof Aura === "undefined" && (Aura = {});
Aura.bootstrap || (Aura.bootstrap = {});

if (!Aura.frameworkJsReady) {
    Aura.ApplicationDefs = { cmpExporter : {}, libExporter : {} };

    $A = { componentService : {
        addComponent: function (d, e) { Aura.ApplicationDefs.cmpExporter[d] = e; },
        addLibraryExporter: function (d, e) { Aura.ApplicationDefs.libExporter[d] = e; },
        initEventDefs: function (e) { Aura.ApplicationDefs.eventDefs = e; },
        initLibraryDefs: function (e) { Aura.ApplicationDefs.libraryDefs = e; },
        initControllerDefs: function (e) { Aura.ApplicationDefs.controllerDefs = e; },
        initModuleDefs: function (e) { Aura.ApplicationDefs.moduleDefs = e; }
    }};
}