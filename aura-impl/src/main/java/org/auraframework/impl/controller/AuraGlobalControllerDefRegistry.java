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
package org.auraframework.impl.controller;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.ds.servicecomponent.GlobalController;
import org.auraframework.impl.java.controller.JavaControllerDefFactory;
import org.auraframework.impl.system.DefRegistryImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Sets;

/**
 * @since 0.0.116
 */
@ServiceComponent
public class AuraGlobalControllerDefRegistry extends DefRegistryImpl {
    private static final long serialVersionUID = -969733961482080930L;

    private DefinitionService definitionService;
    private Collection<GlobalController> controllers;

    private static final Set<DefType> defTypes = Sets.immutableEnumSet(DefType.CONTROLLER);

    private static final Set<String> prefixes = Sets.newHashSet("aura");
    private Map<DefDescriptor<? extends Definition>, Definition> allMap;

    public AuraGlobalControllerDefRegistry() {
        super(defTypes, prefixes, null);
    }

    public Map<DefDescriptor<? extends Definition>, Definition> getAll() {
        return allMap;
    }

    @Inject
    protected void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }
    @Inject
    protected void setGlobalController(Collection<GlobalController> controllers) {
        this.controllers = controllers;
    }

    @PostConstruct
    protected void postConstruct() {
        JavaControllerDefFactory jcdf = new JavaControllerDefFactory();
        jcdf.setDefinitionService(definitionService);
        ImmutableMap.Builder<DefDescriptor<? extends Definition>, Definition> builder = new ImmutableMap.Builder<>();

        try {
            ControllerDef cd;
            DefDescriptor<ControllerDef> descriptor;
            for (GlobalController gc : this.controllers) {
                descriptor = this.definitionService.getDefDescriptor(gc.getQualifiedName(), ControllerDef.class, null);
                cd = jcdf.getDef_DONOTUSE(descriptor, gc.getClass());
                builder.put(cd.getDescriptor(), cd);
            }
        } catch (QuickFixException qfe) {
            throw new RuntimeException(qfe);
        }

        allMap = builder.build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public <D extends Definition> D getDef(DefDescriptor<D> descriptor) throws QuickFixException {
        return (D)allMap.get(descriptor);
    }

    @Override
    public boolean hasFind() {
        return true;
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefDescriptor<?>> ret = new HashSet<>();

        for (DefDescriptor<?> key : allMap.keySet()) {
            if (matcher.matchDescriptor(key)) {
                ret.add(key);
            }
        }
        return ret;
    }

    @Override
    public <T extends Definition> boolean exists(DefDescriptor<T> descriptor) {
        return allMap.containsKey(descriptor);
    }

    @Override
    public <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
        return null;
    }

    @Override
    public boolean isCacheable() {
        return true;
    }

    @Override
    public void reset() {
    }
}
