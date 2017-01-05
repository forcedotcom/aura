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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Sets;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.impl.java.controller.JavaControllerDefFactory;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.StaticDefRegistryImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.Collection;
import java.util.Map;
import java.util.Set;

/**
 * @since 0.0.116
 */
public class AuraStaticControllerDefRegistry extends StaticDefRegistryImpl {
    private static final long serialVersionUID = -969733961482080930L;

    public static final String PREFIX = "aura";

    public static final String COMPONENT_CONTROLLER = "aura://ComponentController";
    public static final String LABEL_CONTROLLER = "aura://LabelController";
    public static final String TIMEZONEINFO_CONTROLLER = "aura://TimeZoneInfoController";
    public static final String STYLE_CONTROLLER = "aura://StyleController";

    private static final Set<String> prefixes = Sets.newHashSet(PREFIX);
    private static final Set<DefType> defTypes = Sets.immutableEnumSet(DefType.CONTROLLER);

    private static AuraStaticControllerDefRegistry INSTANCE;
    private static Map<DefDescriptor<? extends Definition>, Definition> allMap;

    protected AuraStaticControllerDefRegistry(DefinitionService definitionService) {
        super(defTypes, prefixes, null, getDefs(definitionService));
    }

    public static synchronized AuraStaticControllerDefRegistry getInstance(DefinitionService definitionService) {
        if (INSTANCE == null) {
            INSTANCE = new AuraStaticControllerDefRegistry(definitionService);
        }
        return INSTANCE;
    }

    private static synchronized Collection<Definition> getDefs(DefinitionService definitionService) {
        if (allMap == null) {
            try {
                JavaControllerDefFactory jcdf = new JavaControllerDefFactory(null, definitionService);
                ImmutableMap.Builder<DefDescriptor<? extends Definition>, Definition> builder;
                ControllerDef cd;
                DefDescriptor<ControllerDef> descriptor;

                builder = new ImmutableMap.Builder<>();
                descriptor = new DefDescriptorImpl<>(COMPONENT_CONTROLLER, ControllerDef.class, null);
                cd = jcdf.getDef_DONOTUSE(descriptor, ComponentController.class);
                builder.put(cd.getDescriptor(), cd);

                descriptor = new DefDescriptorImpl<>(LABEL_CONTROLLER, ControllerDef.class, null);
                cd = jcdf.getDef_DONOTUSE(descriptor, LabelController.class);
                builder.put(cd.getDescriptor(), cd);

                descriptor = new DefDescriptorImpl<>(TIMEZONEINFO_CONTROLLER, ControllerDef.class, null);
                cd = jcdf.getDef_DONOTUSE(descriptor, TimeZoneInfoController.class);
                builder.put(cd.getDescriptor(), cd);

                descriptor = new DefDescriptorImpl<>(STYLE_CONTROLLER, ControllerDef.class, null);
                cd = jcdf.getDef_DONOTUSE(descriptor, StyleController.class);
                builder.put(cd.getDescriptor(), cd);

                allMap = builder.build();
            } catch (QuickFixException qfe) {
                throw new RuntimeException(qfe);
            }
        }

        return allMap.values();
    }

    public Map<DefDescriptor<? extends Definition>, Definition> getAll() {
        return allMap;
    }
}
