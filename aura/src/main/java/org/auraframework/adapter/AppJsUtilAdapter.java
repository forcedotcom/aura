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
