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
package org.auraframework.impl.css.flavor;

import java.util.Set;

import org.auraframework.css.FlavorMapping;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;

import com.google.common.base.Optional;
import com.google.common.collect.HashBasedTable;
import com.google.common.collect.ImmutableTable;
import com.google.common.collect.Table;

/**
 * Implementation for {@link FlavorMapping}.
 */
public final class FlavorMappingImpl implements FlavorMapping {
    private final Table<DefDescriptor<ComponentDef>, String, DefDescriptor<FlavoredStyleDef>> table;

    public FlavorMappingImpl(Builder builder) {
        this.table = ImmutableTable.copyOf(builder.table);
    }

    @Override
    public Optional<DefDescriptor<FlavoredStyleDef>> getLocation(DefDescriptor<ComponentDef> component, String flavorName) {
        return Optional.fromNullable(table.get(component, flavorName));
    }

    @Override
    public boolean contains(DefDescriptor<ComponentDef> component, String flavorName) {
        return table.contains(component, flavorName);
    }

    @Override
    public Set<DefDescriptor<ComponentDef>> entries() {
        return table.rowKeySet();
    }

    @Override
    public boolean isEmpty() {
        return table.isEmpty();
    }

    public static final class Builder {
        private Table<DefDescriptor<ComponentDef>, String, DefDescriptor<FlavoredStyleDef>> table = HashBasedTable.create();

        public Builder put(DefDescriptor<ComponentDef> component, String flavor, DefDescriptor<FlavoredStyleDef> location) {
            table.put(component, flavor, location);
            return this;
        }

        public Builder putAll(Table<DefDescriptor<ComponentDef>, String, DefDescriptor<FlavoredStyleDef>> template) {
            table.putAll(template);
            return this;
        }

        public FlavorMapping build() {
            return new FlavorMappingImpl(this);
        }
    }
}
