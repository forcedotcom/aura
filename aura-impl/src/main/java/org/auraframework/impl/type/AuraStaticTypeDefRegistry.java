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

public class AuraStaticTypeDefRegistry extends StaticDefRegistryImpl<TypeDef> {

    private static final long serialVersionUID = -969733961482080930L;

    public static final String PREFIX = "aura";

    private static final Set<String> prefixes = Sets.newHashSet(PREFIX);
    private static final Set<DefType> defTypes = Sets.immutableEnumSet(DefType.TYPE);
    private static final Map<String, TypeDef> defs = Maps.newHashMap();
    private static final Map<String, TypeDef> lowercasedefs = Maps.newHashMap();

    private static void putAuraType(String name, TypeDef def) {
        defs.put(name, def);
        lowercasedefs.put(name.toLowerCase(), def);
    }

    private static void putAuraType(JavaTypeDefFactory factory, String name) throws QuickFixException {
        TypeDef def;
        def = factory.getDef(DefDescriptorImpl.getInstance(String.format("aura://%s", name), TypeDef.class));
        putAuraType(name, def);
    }


    static {
        String[] baseTypes = { "Integer", "Long", "Double", "Decimal", "Boolean", "String", "Date", "DateTime",
                "Object", "Map", "List", "Set" };

        putAuraType("Aura.Component", new ComponentTypeDef.Builder().build());
        putAuraType("Aura.Component[]", new ComponentArrayTypeDef.Builder().build());
        putAuraType("Aura.ComponentDefRef[]", new ComponentDefRefArrayTypeDef.Builder().build());
        // TODO: non array defref type
        putAuraType("Aura.Action", new ActionTypeDef.Builder().build());

        JavaTypeDefFactory factory = new JavaTypeDefFactory(null);
        try {
            for (String baseType : baseTypes) {
                putAuraType(factory, baseType);
                putAuraType(factory, String.format("List<%s>", baseType));
                putAuraType(factory, String.format("%s[]", baseType));
                putAuraType(factory, String.format("Set<%s>", baseType));
            }
        } catch (QuickFixException qfe) {
            // This should _never_ happen
            throw new AuraRuntimeException(qfe);
        }
    }

    public static final AuraStaticTypeDefRegistry INSTANCE = new AuraStaticTypeDefRegistry();

    protected AuraStaticTypeDefRegistry() {
        super(defTypes, prefixes, null, defs.values());
    }

    public TypeDef getDef(String name) {
        if (name.startsWith("Map<")) {
            name = "Map";
        }
        return defs.get(name);
    }

    public TypeDef getInsensitiveDef(String name) {
        String lcname = name.toLowerCase();
        if (lcname.startsWith("map<")) {
            lcname = "map";
        }
        return lowercasedefs.get(lcname);
    }
}
