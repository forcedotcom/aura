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
package org.auraframework.impl.root.theme;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.base.Optional;
import com.google.common.collect.Lists;

/**
 * Implementation for {@link ThemeDef}.
 * 
 * @author nmcwilliams
 */
public class ThemeDefImpl extends RootDefinitionImpl<ThemeDef> implements ThemeDef {

    private static final long serialVersionUID = 7467455857249694414L;

    public ThemeDefImpl(Builder builder) {
        super(builder);

        // TODONM hash code update when extends is implemented (or anything) that makes super.hash inadequate.
    }

    @Override
    public Optional<String> variable(String name) {
        AttributeDef attributeDef = getAttributeDefs().get(DefDescriptorImpl.getInstance(name, AttributeDef.class));

        if (attributeDef == null) {
            return Optional.absent();
        }

        AttributeDefRef defaultValue = attributeDef.getDefaultValue();
        assert defaultValue != null : "default values should be set";

        return Optional.of(defaultValue.getValue().toString());
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        // check that each attribute has default specified
        for (AttributeDef attribute : attributeDefs.values()) {
            if (attribute.getDefaultValue() == null) {
                String msg = "Attribute %s must specify a default value. An empty string is acceptable.";
                throw new InvalidDefinitionException(String.format(msg, attribute.getName()), getLocation());
            }
        }
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() {
        return null; // events not supported here
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) {
        switch (other.getDefType()) {
        case THEME:
            return descriptor.equals(other);
        default:
            return false;
        }
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return Lists.newArrayList();
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("attributes", attributeDefs);
        json.writeMapEnd();
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() {
        return attributeDefs;
    }

    @Override
    public boolean equals(Object obj) {
        // based on super.hashcode being descriptor, location, and attributedefs.

        if (obj instanceof ThemeDefImpl) {
            ThemeDefImpl other = (ThemeDefImpl) obj;
            return Objects
                    .equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(attributeDefs, other.attributeDefs);
        }

        return false;
    }

    /**
     * Utility to get {@link DefDescriptor}s for themes.
     * 
     * @param name Descriptor of the theme to get, e.g., "namespace:themeName".
     */
    public static DefDescriptor<ThemeDef> descriptor(String name) {
        return DefDescriptorImpl.getInstance(name, ThemeDef.class);
    }

    /**
     * Used to build instances of {@link ThemeDef}s.
     */
    public static class Builder extends RootDefinitionImpl.Builder<ThemeDef> {
        public Builder() {
            super(ThemeDef.class);
        }

        @Override
        public ThemeDefImpl build() {
            return new ThemeDefImpl(this);
        }
    }

}
