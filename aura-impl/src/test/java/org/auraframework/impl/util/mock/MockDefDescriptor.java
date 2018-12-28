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
package org.auraframework.impl.util.mock;

import java.io.IOException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

@SuppressWarnings("serial")
public class MockDefDescriptor implements DefDescriptor<Definition> {
    private Definition def;
    private String prefix;
    private String namespace;
    private String name;
    private String qualifiedName;
    private int hashcode;

    public MockDefDescriptor(String prefix, String namespace, String name) {
        this.prefix = prefix;
        this.namespace = namespace;
        this.name = name;
        this.qualifiedName = String.format("%s://%s:%s", prefix, namespace, name);
        this.hashcode = this.qualifiedName.toLowerCase().hashCode();
    }

    public void setDef(Definition def) {
        this.def = def;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    @Override
    public int compareTo(DefDescriptor<?> o) {
        if (!(o instanceof MockDefDescriptor)) {
            return 1;
        }
        return this.qualifiedName.toLowerCase().compareTo(((MockDefDescriptor)o).qualifiedName.toLowerCase());
    }

    @Override
    public boolean equals(Object o) {
        return (o instanceof DefDescriptor) && (this.compareTo((DefDescriptor<?>)o) == 0);
    }

    @Override
    public int hashCode() {
        return hashcode;
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
        return String.format("%s:%s", namespace, name);
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
        return null;
    }

    @Override
    public boolean isParameterized() {
        return false;
    }

    @Override
    public DefType getDefType() {
        return DefType.DOCUMENTATION;
    }

    @Override
    public DefDescriptor<? extends Definition> getBundle() {
        return null;
    }

    @Override
    public Definition getDef() throws QuickFixException {
        return def;
    }

    @Override
    public boolean exists() {
        return def != null;
    }
}
