/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.java.controller.JavaControllerDef.Builder;
import org.auraframework.impl.java.controller.JavaControllerDefFactory;
import org.auraframework.impl.system.StaticDefRegistryImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * @since 0.0.116
 */
public class AuraStaticControllerDefRegistry extends StaticDefRegistryImpl<ControllerDef> {

    /**
     */
    private static final long serialVersionUID = -969733961482080930L;

    public static final String PREFIX = "aura";

    private static final Set<String> prefixes = Sets.newHashSet(PREFIX);
    private static final Set<DefType> defTypes = Sets.immutableEnumSet(DefType.CONTROLLER);

    public static final AuraStaticControllerDefRegistry INSTANCE = new AuraStaticControllerDefRegistry();

    protected AuraStaticControllerDefRegistry() {
        super(defTypes, prefixes, null, getDefs(), null);
    }

    private static Map<DefDescriptor<ControllerDef>, ControllerDef> getDefs() {

        DefinitionService defService = Aura.getDefinitionService();
        DefDescriptor<ControllerDef> componentControllerDesc = defService.getDefDescriptor(
                "aura://ComponentController", ControllerDef.class);

        Builder builder = new Builder();
        try {
            builder.setActionMap(JavaControllerDefFactory.createActions(ComponentController.class,
                    componentControllerDesc));
        } catch (QuickFixException qfe) {
            throw new AuraUnhandledException("Broken ComponentController", qfe);
        }
        builder.setControllerClass(ComponentController.class);
        builder.setLocation("aura://ComponentController", -1);
        builder.setDescriptor(componentControllerDesc);
        Map<DefDescriptor<ControllerDef>, ControllerDef> ret = Maps.newHashMap();
        ret.put(builder.getDescriptor(), builder.build());
        return ret;
    }
}
