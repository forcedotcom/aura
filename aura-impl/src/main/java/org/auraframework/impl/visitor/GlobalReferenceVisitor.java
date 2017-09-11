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
package org.auraframework.impl.visitor;

import java.util.Collection;
import java.util.Map;
import java.util.Map.Entry;
import java.util.function.BiConsumer;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.expression.PropertyReference;

/**
 * A visitor class to extract labels from a set of definitions.
 */
public class GlobalReferenceVisitor implements BiConsumer<UsageMap<PropertyReference>, Map.Entry<DefDescriptor<? extends Definition>, Definition>> {
    private final String root;

    public GlobalReferenceVisitor(String root) {
        this.root = root;
    }

    @Override
    public void accept(UsageMap<PropertyReference> usage, Entry<DefDescriptor<? extends Definition>, Definition> entry) {
        if (entry.getValue() == null) {
            return;
        }
        Collection<PropertyReference> props = entry.getValue().getPropertyReferences();
        if (props != null && !props.isEmpty()) {
            for (PropertyReference e : props) {
                if (e.getRoot().equals(root)) {
                    usage.add(e.getStem(), e.getLocation());
                }
            }
        }
    }
}
