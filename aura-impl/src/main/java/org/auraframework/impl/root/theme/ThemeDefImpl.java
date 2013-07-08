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
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.parser.ThemeValueProvider;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.ThemeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.base.Optional;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * Implementation for {@link ThemeDef}.
 * 
 * @author nmcwilliams
 */
public class ThemeDefImpl extends RootDefinitionImpl<ThemeDef> implements ThemeDef {
    private static final String NOT_INHERITED = "Attribute '%s' is not inherited.";
    private static final String MISSING_DEFAULT = "Attribute '%s' must specify a default value. An empty string is acceptable.";
    private static final String CIRCULAR = "%s cannot through its parent eventually refer back to itself.";
    private static final String CANNOT_EXTEND = "%s cannot extend itself";

    private static final long serialVersionUID = -7900230831915100535L;

    private final int hashCode;
    private final Set<PropertyReference> expressionRefs;
    private final DefDescriptor<ThemeDef> extendsDescriptor;
    private final Map<DefDescriptor<AttributeDef>, AttributeDefRef> overrides;

    public ThemeDefImpl(Builder builder) {
        super(builder);
        this.extendsDescriptor = builder.extendsDescriptor;
        this.overrides = AuraUtil.immutableMap(builder.overrides);
        this.expressionRefs = AuraUtil.immutableSet(builder.expressionRefs);
        this.hashCode = AuraUtil.hashCode(super.hashCode(), extendsDescriptor, overrides);
    }

    @Override
    public Optional<Object> variable(String name) throws QuickFixException {
        // first check overrides
        Optional<Object> found = asOverridden(name);

        // if not there check own attributes
        if (!found.isPresent()) {
            found = fromSelf(name);
        }

        // if not there then check parent
        if (!found.isPresent()) {
            found = fromParent(name);
        }

        return found;
    }

    private Optional<Object> asOverridden(String name) {
        DefDescriptor<AttributeDef> desc = Aura.getDefinitionService().getDefDescriptor(name, AttributeDef.class);
        AttributeDefRef attributeDefRef = overrides.get(desc);
        if (attributeDefRef == null) {
            return Optional.absent();
        } else {
            return Optional.of(updateReferenceToThis(attributeDefRef.getValue()));
        }
    }

    private Optional<Object> fromSelf(String name) {
        DefDescriptor<AttributeDef> desc = Aura.getDefinitionService().getDefDescriptor(name, AttributeDef.class);
        AttributeDef attributeDef = attributeDefs.get(desc);
        if (attributeDef == null) {
            return Optional.absent();
        } else {
            return Optional.of(updateReferenceToThis(attributeDef.getDefaultValue().getValue()));
        }
    }

    private Optional<Object> fromParent(String name) throws QuickFixException {
        return extendsDescriptor == null ? Optional.absent() : extendsDescriptor.getDef().variable(name);
    }

    /**
     * If this object is a {@link PropertyReference} (e.g., was an expression) then replace "this" with the actual
     * descriptor. In other words, in something like <code>default="{!this.margin}"</code>, "this", gets turned into
     * "theNamespace.theThemeName".
     * 
     * @return If not applicable then the exact same object, otherwise an updated {@link PropertyReference}.
     */
    private Object updateReferenceToThis(Object value) {
        if (!(value instanceof PropertyReference)) {
            return value;
        }

        PropertyReference ref = (PropertyReference) value;

        if (!ref.getRoot().equals("this")) {
            return value;
        }

        // construct a new property reference with "this" replaced with the namespace and theme name
        String updated = String.format("%s.%s.%s",
                getDescriptor().getNamespace(),
                getDescriptor().getName(),
                ref.getLeaf());

        return new PropertyReferenceImpl(updated, ref.getLocation());
    }

    @Override
    public DefDescriptor<ThemeDef> getExtendsDescriptor() {
        return extendsDescriptor;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        // attributes
        for (AttributeDef attribute : attributeDefs.values()) {
            attribute.validateDefinition();

            // check that each attribute has default specified
            if (attribute.getDefaultValue() == null) {
                throw new InvalidDefinitionException(String.format(MISSING_DEFAULT, attribute.getName()), getLocation());
            }
        }

        // overrides
        for (AttributeDefRef override : overrides.values()) {
            override.validateDefinition();
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();

        // extends
        if (extendsDescriptor != null) {
            // check if it exists
            if (extendsDescriptor.getDef() == null) {
                throw new DefinitionNotFoundException(extendsDescriptor, getLocation());
            }

            // can't extend itself
            if (extendsDescriptor.equals(descriptor)) {
                throw new InvalidDefinitionException(String.format(CANNOT_EXTEND, getDescriptor()), getLocation());
            }

            // ensure no circular hierarchy
            DefDescriptor<ThemeDef> current = extendsDescriptor;
            while (current != null) {
                if (current.equals(descriptor)) {
                    throw new InvalidDefinitionException(String.format(CIRCULAR, descriptor), getLocation());
                }
                current = current.getDef().getExtendsDescriptor();
            }
        }

        // attributes
        for (AttributeDef att : this.attributeDefs.values()) {
            att.validateReferences();
        }

        // overrides
        for (AttributeDefRef override : overrides.values()) {
            override.validateReferences();

            DefDescriptor<AttributeDef> desc = override.getDescriptor();

            // verify that aura:set refers to an actual parent attribute. aura:set will be the preferred way to override
            // a parent attribute's value. This way, if the parent attribute changes we will get an error downstream, as
            // opposed to silently becoming disconnected.​ If you redefine the attribute it would still work, that's
            // just not recommended.
            if (extendsDescriptor == null) {
                throw new InvalidDefinitionException(String.format(NOT_INHERITED, desc.getName()), getLocation());
            } else {
                ThemeDef parent = extendsDescriptor.getDef();
                AttributeDef overridden = parent.getAttributeDefs().get(desc);
                if (overridden == null) {
                    throw new InvalidDefinitionException(String.format(NOT_INHERITED, desc.getName()), getLocation());
                }
            }
        }

        // validate cross references (from expressions)
        ThemeValueProvider themeProvider = Aura.getStyleAdapter().getThemeValueProvider();
        for (PropertyReference ref : expressionRefs) {
            if (ref.getRoot().equals("this")) {
                continue;
            }

            themeProvider.getDescriptor(ref).getDef().validateReferences();
            themeProvider.getValue(ref); // will validate variable
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
        super.appendDependencies(dependencies);

        // extends
        if (extendsDescriptor != null) {
            dependencies.add(extendsDescriptor);
        }

        // dependencies cross references (from expressions)
        ThemeValueProvider themeProvider = Aura.getStyleAdapter().getThemeValueProvider();
        for (PropertyReference ref : expressionRefs) {
            if (ref.getRoot().equals("this")) {
                continue;
            }

            dependencies.add(themeProvider.getDescriptor(ref));
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
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        // self and parent attributes
        Map<DefDescriptor<AttributeDef>, AttributeDef> ret = new LinkedHashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        if (extendsDescriptor != null) {
            ret.putAll(extendsDescriptor.getDef().getAttributeDefs());
            ret.putAll(attributeDefs);
            return Collections.unmodifiableMap(ret);
        }

        return attributeDefs;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof ThemeDefImpl) {
            ThemeDefImpl other = (ThemeDefImpl) obj;
            return Objects
                    .equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(attributeDefs, other.attributeDefs)
                    && Objects.equal(extendsDescriptor, other.extendsDescriptor)
                    && Objects.equal(overrides, other.overrides);
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
    public static class Builder extends RootDefinitionImpl.Builder<ThemeDef> implements ThemeDefBuilder {
        public DefDescriptor<ThemeDef> extendsDescriptor;
        public Map<DefDescriptor<AttributeDef>, AttributeDefRef> overrides;
        public HashSet<PropertyReference> expressionRefs;

        public Builder() {
            super(ThemeDef.class);
        }

        @Override
        public void setExtendsDescriptor(DefDescriptor<ThemeDef> extendsDescriptor) {
            this.extendsDescriptor = extendsDescriptor;
        }

        @Override
        public void addOverride(AttributeDefRef ref) {
            if (overrides == null) {
                overrides = Maps.newHashMap();
            }
            overrides.put(ref.getDescriptor(), ref);
        }

        public void addAllExpressionRefs(Collection<PropertyReference> refs) {
            if (expressionRefs == null) {
                expressionRefs = Sets.newHashSet();
            }
            expressionRefs.addAll(refs);
		}

        @Override
        public ThemeDefImpl build() {
            return new ThemeDefImpl(this);
        }

    }
}
