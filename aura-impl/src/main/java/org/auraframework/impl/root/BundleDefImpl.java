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
package org.auraframework.impl.root;

import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.builder.BundleDefBuilder;
import org.auraframework.def.BundleDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.text.Hash;
import org.auraframework.validation.ReferenceValidationContext;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public abstract class BundleDefImpl<T extends BundleDef> extends DefinitionImpl<T> implements BundleDef {

    private static final long serialVersionUID = 5663901917141134057L;

    private final Map<DefDescriptor<?>, Definition> bundledDefs;

    protected BundleDefImpl(Builder<T> builder) {
        super(builder);
        this.bundledDefs = builder.bundledDefs;
    }

    @Override
    public Map<DefDescriptor<?>, Definition> getBundledDefs() {
        return Collections.unmodifiableMap(bundledDefs);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <X extends Definition> X getBundledDefinition(DefDescriptor<X> descriptor) {
        return (X)bundledDefs.get(descriptor);
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        if (bundledDefs != null) {
            for (Definition def : bundledDefs.values()) {
                if (def != null) {
                    def.appendDependencies(dependencies);
                }
            }
        }
    }

    @Override
    public Collection<PropertyReference> getPropertyReferences() {
        List<PropertyReference> references = null;
        Collection<PropertyReference> tmp;

        if (bundledDefs != null) {
            for (Definition def : bundledDefs.values()) {
                if (def != null) {
                    if (references == null) {
                        references = Lists.newArrayList();
                    }
                    tmp = def.getPropertyReferences();
                    if (tmp != null) {
                        references.addAll(tmp);
                    }
                }
            }
        }
        return references;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (bundledDefs != null) {
            for (Definition def : bundledDefs.values()) {
                if (def != null) {
                    def.validateDefinition();
                }
            }
        }
    }

    @Override
    public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
        super.validateReferences(validationContext);
        for (Definition def : bundledDefs.values()) {
            def.validateReferences(validationContext);
        }
    }

    public abstract static class Builder<T extends BundleDef> extends DefinitionImpl.BuilderImpl<T> implements BundleDefBuilder<T> {
        private Map<DefDescriptor<?>,Definition> bundledDefs = Maps.newHashMap();

        public Builder(Class<T> defClass) {
            super(defClass);
        }

        @Override
        public BundleDefImpl.Builder<T> setBundledDefs(Map<DefDescriptor<?>, Definition> bundledDefs) {
            this.bundledDefs = bundledDefs;
            return this;
        }

        @Override
        public String getOwnHash() {
            String working = super.getOwnHash();
            if (bundledDefs != null && bundledDefs.size() > 0) {
                StringBuffer hashAcc = new StringBuffer();
                hashAcc.append(working);

                List<Entry<DefDescriptor<?>,Definition>> entries = Lists.newArrayList(this.bundledDefs.entrySet());
                entries.sort(Comparator.comparing(Entry::getKey));

                for (Map.Entry<DefDescriptor<?>,Definition> entry : entries) {
                    hashAcc.append("|");
                    hashAcc.append(entry.getKey().getQualifiedName().toLowerCase());
                    if (entry.getValue() != null) {
                        hashAcc.append("=");
                        hashAcc.append(entry.getValue().getOwnHash());
                    }
                }
                working = new Hash(hashAcc.toString().getBytes()).toString();
            }
            return working;
        }

    }
}
