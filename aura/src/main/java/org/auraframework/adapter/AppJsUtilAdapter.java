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

package org.auraframework.adapter;

import java.io.IOException;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext;

public interface AppJsUtilAdapter {

    static final String APPJS_PREREQ = "(window.Aura||(Aura={})).frameworkJsReady||(Aura.ApplicationDefs={},$A={fn:function(e){return function(n){var r=Aura.ApplicationDefs,f=r[e];if(f)if(n instanceof Array)f.push.apply(f,n);else for(var i in n)f[i]=n[i];else r[e]=n}}},$A.componentService={addComponents:$A.fn('cmpExporter'),addLibraryExporters:$A.fn('libExporter'),initEventDefs:$A.fn('eventDefs'),initLibraryDefs:$A.fn('libraryDefs'),initControllerDefs:$A.fn('controllerDefs'),initModuleDefs:$A.fn('moduleDefs')});\n";
    static final char   APPJS_APPEND = '\n';
    static final String APPCOREJS_READY = "Aura.appCoreJsReady=true;";
    static final String APPJS_READY = "Aura.appJsReady=true;";
    static final String EXECUTE_APPDEFSREADY = "Aura.appDefsReady&&Aura.appDefsReady();";

    /**
     * Retrieve a dependency set that is a part of full dependencies of an app.
     *
     * @param request the incoming request.
     * @param response the outgoing response.
     * @param context Aura context of the request
     * @param partIndex a zero based index indicating which part of the dependencies to retrieve
     * @return a dependency set
     */
    Set<DefDescriptor<?>> getPartDependencies(HttpServletRequest request, HttpServletResponse response, AuraContext context, int partIndex) throws IOException;

    /**
     * Retrieve a dependency set that is a part of full dependencies of an app.
     *
     * @param dependencies the dependency set to retrieve parts from
     * @param appDesc descriptor of the app
     * @param partIndex a zero based index indicating which part of the dependencies to retrieve
     * @return a dependency set
     */
    Set<DefDescriptor<?>> getPartDependencies(Set<DefDescriptor<?>> dependencies, DefDescriptor<? extends BaseComponentDef> appDesc, int partIndex) throws IOException;
}
