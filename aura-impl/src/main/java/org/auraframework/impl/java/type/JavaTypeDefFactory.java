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
package org.auraframework.impl.java.type;

import java.math.BigDecimal;
import java.util.*;

import org.auraframework.builder.DefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.java.BaseJavaDefFactory;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;

/**
 * Loads Java types for Aura components.
 */
public class JavaTypeDefFactory extends BaseJavaDefFactory<TypeDef> {
    public JavaTypeDefFactory(List<SourceLoader> sourceLoaders) {
        super(sourceLoaders);
    }

    @Override
    protected DefBuilder<?, ? extends TypeDef> getBuilder(DefDescriptor<TypeDef> descriptor) {
        JavaTypeDef.Builder builder;
        Class<?> clazz = getClazz(descriptor);

        if (clazz == null) {
            return null;
        }
        builder = new JavaTypeDef.Builder();
        builder.setDescriptor(descriptor);
        builder.setLocation(clazz.getCanonicalName(), 0);
        builder.setTypeClass(clazz);
        return builder;
    }

    /**
     * Return base of class name, truncating Generic qualifier, if included.
     *   Can't instantiate a class with parameters using Class.forName().
     * @param className - the class name, with or without a < > clause
     * @return - the base class name minus generic parameters
     */
    private String getRawClassName(String className) {

        int genPos = className.indexOf('<');
        String name = genPos == -1 ? className : className.substring(0, genPos);
        return name;
    }

    @Override
    protected Class<?> getClazz(DefDescriptor<TypeDef> descriptor) {
        Class<?> clazz = null;
        try {
            String className = descriptor.getName();
            if (descriptor.getNamespace() == null) {

                if (className.equals("List") || className.startsWith("List<") || className.endsWith("[]")) {
                    clazz = ArrayList.class;
                } else if (className.equals("Map") || className.startsWith("Map<")) {
                    clazz = HashMap.class;
                } else if (className.equals("Set") || className.startsWith("Set<")) {
                    clazz = HashSet.class;
                } else if (className.equals("Decimal")) {
                    clazz = BigDecimal.class;
                } else if (className.equals("Date")) {
                    clazz = Date.class;
                } else if (className.equals("DateTime")) {
                    clazz = Calendar.class;
                } else if (className.equals("int")) {
                    clazz = Integer.class;
                } else if (className.equals("char")) {
                    clazz = Character.class;
                } else {
                    try {
                        clazz = Class.forName("java.lang." + AuraTextUtil.initCap(className));
                    } catch (ClassNotFoundException e) {
                        // ignore
                        clazz = null;
                    }
                }
            } else {
                className = String.format("%s.%s", descriptor.getNamespace(), getRawClassName(className));
            }

            if (clazz == null) {
                clazz = Class.forName(className);
            }
        } catch (ClassNotFoundException e) {
            throw new AuraRuntimeException(e);
        }
        return clazz;
    }
}
