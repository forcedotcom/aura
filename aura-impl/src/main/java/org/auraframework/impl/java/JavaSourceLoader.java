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
package org.auraframework.impl.java;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.SourceLoader;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.Sets;

public class JavaSourceLoader implements SourceLoader {

    @Override
    public Set<String> getNamespaces() {
        return Sets.newHashSet("*");
    }

    @Override
    public Set<String> getPrefixes() {
        return null;
    }

    @Override
    public Set<DefType> getDefTypes() {
        return null;
    }

    // FIXME: this should use Service lookup first?
    private Class<?> getClazz(DefDescriptor<?> descriptor) {
        Class<?> clazz = null;
        String className = descriptor.getName();
        boolean isArray = className.endsWith("[]");
        String namespace = descriptor.getNamespace();

        // Strip any generic
        int genPos = className.indexOf('<');
        if (genPos > 0) {
            className = className.substring(0, genPos);
        }

        if (isArray) {
            clazz = ArrayList.class;
        } else if (namespace == null || "java.lang".equals(namespace)) {
            String lcClass = className.toLowerCase();

            switch (lcClass) {
            case "list":
                clazz = ArrayList.class;
                break;
            case "map":
                clazz = HashMap.class;
                break;
            case "set":
                clazz = HashSet.class;
                break;
            case "decimal":
                clazz = BigDecimal.class;
                break;
            case "date":
                clazz = Date.class;
                break;
            case "datetime":
                clazz = Calendar.class;
                break;
            case "integer":
            case "int":
                clazz = Integer.class;
                break;
            case "character":
            case "char":
                clazz = Character.class;
                break;
            }
            if (clazz == null) {
                try {
                    clazz = Class.forName("java.lang." + AuraTextUtil.initCap(className));
                } catch (ClassNotFoundException e) {
                    // ignore
                }
            }
        }

        if (clazz == null) {
            className = String.format("%s.%s", descriptor.getNamespace(), className);
            try {
                clazz = Class.forName(className);
            } catch (ClassNotFoundException e) {
                // ignore
            }
        }
        return clazz;
    }

    @Override
    public <D extends Definition> JavaSourceImpl<D> getSource(DefDescriptor<D> descriptor) {
        Class<?> clazz = getClazz(descriptor);
        if (clazz == null) {
        	return null;
        }
    	return new JavaSourceImpl<>(descriptor, clazz);
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter dm) {
        return Sets.newHashSet();
    }

    @Override
    public void reset() {
    }
}
