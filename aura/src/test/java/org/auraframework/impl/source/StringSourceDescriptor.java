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
package org.auraframework.impl.source;

import java.io.IOException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

/**
 * A DefDescriptor for Definitions that aren't normally retrieved from the DefinitionService
 */
public class StringSourceDescriptor<D extends Definition> implements DefDescriptor<D> {
    private static final long serialVersionUID = -1192915630107573061L;

    private final String namespace;
    private final String name;
    private final String qualifiedName;
    private final String descriptorName;
    private final String prefix;
    private final String nameParameters;
    private final DefType defType;
    private D definition;
    private final int hashCode;

    public StringSourceDescriptor(String namespace, String name, String qualifiedName, String descriptorName,
            String prefix, String nameParameters, DefType defType, D definition) {
        this.namespace = namespace;
        this.name = name;
        this.qualifiedName = qualifiedName;
        this.descriptorName = descriptorName;
        this.prefix = prefix;
        this.nameParameters = nameParameters;
        this.defType = defType;
        this.hashCode = Lists.<String> newArrayList(name == null ? null : name.toLowerCase(),
                namespace == null ? null : namespace.toLowerCase(),
                prefix == null ? null : prefix.toLowerCase(), defType.ordinal() + "").hashCode();
        this.definition = definition;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeValue(qualifiedName);
    }

    @Override
    public int compareTo(DefDescriptor<?> other) {
        int value;
        value = getQualifiedName().compareToIgnoreCase(other.getQualifiedName());
        if (value != 0) {
            return value;
        }
        return getDefType().compareTo(other.getDefType());
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getQualifiedName() {
        return qualifiedName;
    }

    @Override
    public String getDescriptorName() {
        return descriptorName;
    }

    @Override
    public String getPrefix() {
        return prefix;
    }

    @Override
    public String getNamespace() {
        return namespace;
    }

    @Override
    public String getNameParameters() {
        return nameParameters;
    }

    @Override
    public boolean isParameterized() {
        return nameParameters != null;
    }

    @Override
    public DefType getDefType() {
        return defType;
    }

    @Override
    public D getDef() throws QuickFixException {
        return definition;
    }

    @Override
    public boolean exists() {
        return true;
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object o) {
        if (o instanceof DefDescriptor) {
            DefDescriptor<?> e = (DefDescriptor<?>) o;
            return getDefType() == e.getDefType() && name.equalsIgnoreCase(e.getName())
                    && (namespace == null ? e.getNamespace() == null : namespace.equalsIgnoreCase(e.getNamespace()))
                    && (prefix == null ? e.getPrefix() == null : prefix.equalsIgnoreCase(e.getPrefix()));
        }
        return false;
    }

    @Override
    public DefDescriptor<? extends Definition> getBundle() {
        return null;
    }

}
