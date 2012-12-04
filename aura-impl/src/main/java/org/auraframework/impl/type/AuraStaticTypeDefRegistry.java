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
package org.auraframework.impl.type;

import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.java.type.JavaTypeDefFactory;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.StaticDefRegistryImpl;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class AuraStaticTypeDefRegistry extends StaticDefRegistryImpl<TypeDef>{

    private static final long serialVersionUID = -969733961482080930L;

    public static final String PREFIX = "aura";

    private static final Set<String> prefixes = Sets.newHashSet(PREFIX);
    private static final Set<DefType> defTypes = Sets.immutableEnumSet(DefType.TYPE);
    private static final Map<String, TypeDef> defs = Maps.newHashMap();

    static{
        String[] baseTypes = {"Integer", "Long", "Double", "Decimal", "Boolean", "String", "Date", "DateTime", "Object", "Map", "List", "Set"};

        defs.put("Aura.Component", new ComponentTypeDef.Builder().build());
        defs.put("Aura.Component[]", new ComponentArrayTypeDef.Builder().build());
        defs.put("Aura.ComponentDefRef[]", new ComponentDefRefArrayTypeDef.Builder().build());
        // TODO: non array defref type
        defs.put("Aura.Action", new ActionTypeDef.Builder().build());
        JavaTypeDefFactory factory = new JavaTypeDefFactory(null);
        for(String baseType : baseTypes){
            try {
                defs.put(baseType, factory.getDef(DefDescriptorImpl.getInstance(String.format("aura://%s", baseType), TypeDef.class)));
                String listType = String.format("List<%s>", baseType);
                defs.put(listType, factory.getDef(DefDescriptorImpl.getInstance(String.format("aura://%s", listType), TypeDef.class)));
                String arrayType = String.format("%s[]", baseType);
                defs.put(arrayType, factory.getDef(DefDescriptorImpl.getInstance(String.format("aura://%s", arrayType), TypeDef.class)));
                String setType = String.format("Set<%s>", baseType);
                defs.put(setType, factory.getDef(DefDescriptorImpl.getInstance(String.format("aura://%s", setType), TypeDef.class)));
            } catch (QuickFixException qfe) {
                // This should _never_ happen
                throw new AuraRuntimeException(qfe);
            }
        }
    }

    public static final AuraStaticTypeDefRegistry INSTANCE = new AuraStaticTypeDefRegistry();

    protected AuraStaticTypeDefRegistry() {
        super(defTypes, prefixes, null, defs.values());
    }

    public TypeDef getDef(String name){
        if(name.startsWith("Map<")){
            name = "Map";
        }
        return defs.get(name);
    }
}
