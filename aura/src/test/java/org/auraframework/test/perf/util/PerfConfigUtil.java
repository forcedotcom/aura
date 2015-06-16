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
package org.auraframework.test.perf.util;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;

public final class PerfConfigUtil {

    private static final Logger LOG = Logger.getLogger(PerfConfigUtil.class.getSimpleName());
    // List components that we can't able to instantiate from client side.
    private static final Set<String> BLACKLISTED_COMPONENTS = ImmutableSet.of("markup://ui:inputDate" // server side
                                                                                                      // dependency
            , "markup://ui:action" // this should be abstract
            , "markup://perfTest:dummyPerf");

    private enum ConfigType {
        TEST, VARIABILITY
    }

    public List<DefDescriptor<ComponentDef>> getComponentTestsToRun() {
        return new ArrayList<>(getComponentDefs());
        // TODO Create a JSONArray of component config objs
        // Set<DefDescriptor<ComponentDef>> defs = getComponentDefs();

    }

    private boolean skipComponentPerfTests() {
        return (System.getProperty("skipCmpPerfTests") != null);
    }

    private boolean isBlackListedComponent(DefDescriptor<ComponentDef> descriptor) throws QuickFixException {
        return descriptor.getDef().isAbstract() || getBlacklistedComponents().contains(descriptor.getQualifiedName());
    }

    private ContextService establishAuraContext() {
        ContextService contextService = Aura.getContextService();
        if (!contextService.isEstablished()) {
            contextService.startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED);
        }
        return contextService;
    }

    private DefDescriptor<ComponentDef> getComponentDefsInNamespace(String namespace) throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();
        DefDescriptor<ComponentDef> matcher = definitionService.getDefDescriptor(
                String.format("markup://%s:*", namespace), ComponentDef.class);

        Set<DefDescriptor<ComponentDef>> descriptors;

        descriptors = definitionService.find(matcher);
        for (DefDescriptor<ComponentDef> descriptor : descriptors) {
            if (!isBlackListedComponent(descriptor) && namespace.equals(descriptor.getNamespace())) { return descriptor; }
        }
        return null;
    }

    private Set<DefDescriptor<ComponentDef>> getComponentDefs() {
        if (skipComponentPerfTests()) return null;

        Set<DefDescriptor<ComponentDef>> defs = new HashSet<>();
        List<String> namespaces = getNamespaces();
        ContextService contextService = establishAuraContext();

        for (String namespace : namespaces) {
            try {
                defs.add(getComponentDefsInNamespace(namespace));
            } catch (Throwable t) {
                LOG.log(Level.WARNING, "Failed to load component tests for namespace: " + namespace, t);
            } finally {
                if (contextService.isEstablished()) {
                    contextService.endContext();
                }
            }
        }
        return defs;
    }

    /**
     * @return the list of namespaces to create tests for
     */
    protected List<String> getNamespaces() {
        return ImmutableList.of("performanceComponentTest");
    }

    /**
     * Components that we aren't able to instantiate from client side. The reason could be a dependency to a server side
     * model. Eg. ui:inputDate ui:action cmp should be abstract?
     */
    protected Set<String> getBlacklistedComponents() {
        return BLACKLISTED_COMPONENTS;
    }

    public Entry<?, ?> loadConfigMappings(ConfigType type) {
        // TODO Reflection magic to discover and load configs for all components
        return null;
    }

}
