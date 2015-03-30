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
package org.auraframework.impl.design;

import com.google.common.collect.Sets;
import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.design.DesignItemsDef;
import org.auraframework.def.design.DesignLayoutAttributeDef;
import org.auraframework.def.design.DesignLayoutComponentDef;
import org.auraframework.def.design.DesignLayoutItemDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import javax.management.modelmbean.XMLParseException;
import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.Set;

public class DesignItemsDefImpl extends DefinitionImpl<DesignItemsDef> implements DesignItemsDef{
    private Set<DesignLayoutItemDef> items;
    private final String name;

    protected DesignItemsDefImpl(Builder builder) {
        super(builder);
        this.items = builder.items;
        this.name = builder.name;
    }

    @Override
    public Set<DesignLayoutItemDef> getItems() {
        return items;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public void serialize(Json json) throws IOException { }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        DesignItemsDefImpl that = (DesignItemsDefImpl) o;

        if (name != null ? !name.equals(that.name) : that.name != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return name != null ? name.hashCode() : 0;
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<DesignItemsDef> {
        private LinkedHashSet<DesignLayoutItemDef> items = Sets.newLinkedHashSet();
        //Default value is an empty string
        private String name = "";
        public Builder() {
            super(DesignItemsDef.class);
        }

        @Override
        public DesignItemsDef build() throws QuickFixException {
            return new DesignItemsDefImpl(this);
        }

        public void addAttribute(DesignLayoutAttributeDef item) {
            if (items.contains(item)) {
                setParseError(new XMLParseException(String.format(
                        "Design layout attribute: %s already defined", item.getName())));
            }
            items.add(new DesignLayoutItemDefImpl(item));
        }

        public void addComponent(DesignLayoutComponentDef cmp) {
            if (items.contains(cmp)) {
                setParseError(new InvalidDefinitionException(String.format(
                        "Design layout component: %s already defined", cmp.getName()), getLocation()) {
                });
            } else {
                items.add(new DesignLayoutItemDefImpl(cmp));
            }
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
