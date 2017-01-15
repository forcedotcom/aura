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

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;

import org.auraframework.css.FlavorOverrideLocation;
import org.auraframework.css.FlavorOverrideLocator;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;

import com.google.common.collect.HashBasedTable;
import com.google.common.collect.ImmutableTable;
import com.google.common.collect.Table;

public final class FlavorOverrideLocatorImpl implements FlavorOverrideLocator {
    /** component / flavor name / stack of override locations */
    private final Table<DefDescriptor<ComponentDef>, String, Deque<FlavorOverrideLocation>> table;

    public FlavorOverrideLocatorImpl(Builder builder) {
        this.table = ImmutableTable.copyOf(builder.table);
    }

    @Override
    public Optional<FlavorOverrideLocation> getLocation(DefDescriptor<ComponentDef> component, String flavorName) {
        // LIFO behavior is maintained on insertion, not retrieval
        Deque<FlavorOverrideLocation> overrides = table.get(component, flavorName);
        return (overrides == null) ? Optional.empty() : Optional.of(overrides.peek());
    }

    @Override
    public Optional<FlavorOverrideLocation> getLocation(DefDescriptor<ComponentDef> component, String flavorName,
            Set<String> trueConditions) {
        Deque<FlavorOverrideLocation> overrides = table.get(component, flavorName);
        if (overrides == null) {
            return Optional.empty();
        } else {
            // LIFO behavior is maintained on insertion, not retrieval
            for (FlavorOverrideLocation override : overrides) {
                // skip past overrides with conditions that don't match
                if (!override.getCondition().isPresent() || trueConditions.contains(override.getCondition().get())) {
                    return Optional.of(override);
                }
            }
            return Optional.empty();
        }
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
        private final Table<DefDescriptor<ComponentDef>, String, Deque<FlavorOverrideLocation>> table = HashBasedTable.create();

        public Builder put(DefDescriptor<ComponentDef> component, String flavor, FlavorOverrideLocation location) {
            checkNotNull(component, "component cannot be null");
            checkNotNull(flavor, "flavor cannot be null");
            checkNotNull(location, "location cannot be null");

            Deque<FlavorOverrideLocation> deque = table.get(component, flavor);
            if (deque == null) {
                deque = new ArrayDeque<>(4);
                table.put(component, flavor, deque);
            }
            deque.addFirst(location); // LIFO
            return this;
        }

        public Builder putAll(Table<DefDescriptor<ComponentDef>, String, FlavorOverrideLocation> table) {
            Set<Entry<DefDescriptor<ComponentDef>, Map<String, FlavorOverrideLocation>>> rowEntries = table.rowMap().entrySet();
            for (Entry<DefDescriptor<ComponentDef>, Map<String, FlavorOverrideLocation>> row : rowEntries) {
                Set<Entry<String, FlavorOverrideLocation>> columnEntries = row.getValue().entrySet();
                for (Entry<String, FlavorOverrideLocation> column : columnEntries) {
                    put(row.getKey(), column.getKey(), column.getValue());
                }
            }
            return this;
        }

        public FlavorOverrideLocator build() {
            return new FlavorOverrideLocatorImpl(this);
        }
    }
}
