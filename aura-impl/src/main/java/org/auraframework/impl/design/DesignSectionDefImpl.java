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
import org.auraframework.def.design.DesignItemsDef;
import org.auraframework.def.design.DesignSectionDef;
import org.auraframework.impl.system.BaseXmlElementImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.LinkedHashSet;
import java.util.Set;

public class DesignSectionDefImpl extends BaseXmlElementImpl implements DesignSectionDef {

    private static final long serialVersionUID = -4702186496331871091L;
    private final Set<DesignItemsDef> items;
    private final String name;
    protected DesignSectionDefImpl(Builder builder) {
        super(builder);
        this.items = builder.items;
        this.name = builder.name;
    }

    @Override
    public Set<DesignItemsDef> getItems() {
        return items;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        for (DesignItemsDef items : this.items) {
            items.validateDefinition();
        }
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        DesignSectionDefImpl that = (DesignSectionDefImpl) o;

        if (!name.equals(that.name)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }

    public static class Builder extends BaseBuilderImpl {

        private LinkedHashSet<DesignItemsDef> items = Sets.newLinkedHashSet();
        //Default name for a section is an empty string.
        private String name = "";

        public Builder() {
            super(DesignSectionDef.class);
        }

        public void addItems(DesignItemsDef items) {
            if (this.items.contains(items)) {
                setParseError(new InvalidDefinitionException(
                        String.format("Design layout items with name: %s already defined", items.getName()), getLocation()));
            } else {
                this.items.add(items);
            }
        }

        public void setName(String name) {
            this.name = name;
        }

        public DesignSectionDef build() throws QuickFixException {
            return new DesignSectionDefImpl(this);
        }
    }
}
