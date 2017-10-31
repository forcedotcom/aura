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

package org.auraframework.http.resource;

import java.io.IOException;
import java.util.Iterator;
import java.util.Set;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.AppJsUtilAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext;

import com.google.common.collect.Sets;

@ServiceComponent
public class AppJsUtilAdapterImpl implements AppJsUtilAdapter {

    @Inject
    private ServletUtilAdapter servletUtilAdapter; 

    @Override
    public Set<DefDescriptor<?>> getPartDependencies(HttpServletRequest request, HttpServletResponse response, AuraContext context, int partIndex) throws IOException {
        Set<DefDescriptor<?>> deps = servletUtilAdapter.verifyTopLevel(request, response, context);
        DefDescriptor<? extends BaseComponentDef> appDesc = context.getApplicationDescriptor();
        return getPartDependencies(deps, appDesc, partIndex);
    }


    @Override
    public Set<DefDescriptor<?>> getPartDependencies(Set<DefDescriptor<?>> dependencies, DefDescriptor<? extends BaseComponentDef> appDesc, int partIndex) {
        if (dependencies == null || appDesc == null) {
            return null;
        }

        String appName = appDesc.getQualifiedName();
        Set<DefDescriptor<?>> dependenciesPart1 = Sets.newHashSet();
        Set<DefDescriptor<?>> dependenciesPart2 = Sets.newHashSet();
        int size = dependencies.size();
        Iterator<DefDescriptor<?>> it = dependencies.iterator();
        for (int i = 0; i < size && it.hasNext(); i++) {
            DefDescriptor<?> descriptor = it.next();
            if (filterCriteria(descriptor, appName)) {
                dependenciesPart1.add(descriptor);
            } else {
                dependenciesPart2.add(descriptor);
            }
        }
    
        return partIndex == 0 ? dependenciesPart1 : dependenciesPart2;
    }

    protected boolean filterCriteria(DefDescriptor<?> dependencyDescriptor, String appName) {
        String componentNamespace = dependencyDescriptor.getNamespace();
        return componentNamespace == null ||
                componentNamespace.equalsIgnoreCase("aura") ||
                componentNamespace.equalsIgnoreCase("ui");
    }
}
