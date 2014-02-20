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

import static com.google.common.base.Preconditions.checkState;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.builder.ThemeDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.VarDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.ThemeValueNotFoundException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.base.Optional;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * Implementation for {@link ThemeDef}.
 */
public final class ThemeDefImpl extends RootDefinitionImpl<ThemeDef> implements ThemeDef {
    private static final long serialVersionUID = -7900230831915100535L;

    private final boolean isLocal;
    private final Map<String, VarDef> vars;
    private final List<DefDescriptor<ThemeDef>> imports;
    private final Set<PropertyReference> expressionRefs;
    private final DefDescriptor<ThemeDef> extendsDescriptor;
    private final int hashCode;

    public ThemeDefImpl(Builder builder) {
        super(builder);
        this.isLocal = builder.isLocal;
        this.imports = builder.orderedImmutableImports();
        this.vars = AuraUtil.immutableMap(builder.vars);
        this.extendsDescriptor = builder.extendsDescriptor;
        this.expressionRefs = AuraUtil.immutableSet(builder.expressionRefs);
        this.hashCode = AuraUtil.hashCode(descriptor, location, extendsDescriptor, imports, vars);
    }

    @Override
    public boolean isLocalTheme() {
        return isLocal;
    }

    @Override
    public DefDescriptor<ThemeDef> getExtendsDescriptor() {
        return extendsDescriptor;
    }

    @Override
    public boolean hasVar(String name) throws QuickFixException {
        if (vars.containsKey(name)) {
            return true;
        }
        for (DefDescriptor<ThemeDef> theme : imports) {
            if (theme.getDef().hasVar(name)) return true;
        }
        if (extendsDescriptor != null) {
            if (extendsDescriptor.getDef().hasVar(name)) return true;
        }
        return false;
    }

    @Override
    public Optional<Object> getVar(String name) throws QuickFixException {
        Optional<VarDef> def = getVarDef(name);
        return def.isPresent() ? Optional.of(def.get().getValue()) : Optional.absent();
    }

    @Override
    public Optional<VarDef> getVarDef(String name) throws QuickFixException {
        if (vars.containsKey(name)) {
            return Optional.of(vars.get(name));
        }

        for (DefDescriptor<ThemeDef> theme : imports) {
            Optional<VarDef> value = theme.getDef().getVarDef(name);
            if (value.isPresent()) return value;
        }

        if (extendsDescriptor != null) {
            return extendsDescriptor.getDef().getVarDef(name);
        }

        return Optional.absent();
    }

    @Override
    public Map<String, VarDef> getDeclaredVarDefs() {
        return vars;
    }

    @Override
    public List<DefDescriptor<ThemeDef>> getDeclaredImports() {
        return imports;
    }

    @Override
    public Set<String> getDeclaredNames() {
        return vars.keySet();
    }

    @Override
    public Iterable<String> getImportedNames() throws QuickFixException {
        if (imports.isEmpty()) return ImmutableSet.of();

        List<Iterable<String>> iterables = Lists.newArrayList();
        for (DefDescriptor<ThemeDef> theme : imports) {
            iterables.add(theme.getDef().getAllNames());
        }
        return Iterables.concat(iterables);
    }

    @Override
    public Iterable<String> getInheritedNames() throws QuickFixException {
        return extendsDescriptor != null ? extendsDescriptor.getDef().getAllNames() : ImmutableSet.<String>of();
    }

    @Override
    public Iterable<String> getOwnNames() throws QuickFixException {
        return Iterables.concat(getDeclaredNames(), getImportedNames());
    }

    @Override
    public Iterable<String> getAllNames() throws QuickFixException {
        return Iterables.concat(getDeclaredNames(), getImportedNames(), getInheritedNames());
    }

    @Override
    public Set<String> getOverriddenNames() throws QuickFixException {
        return Sets.intersection(ImmutableSet.copyOf(getOwnNames()), ImmutableSet.copyOf(getInheritedNames()));
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        for (VarDef def : vars.values()) {
            def.validateDefinition();
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
                String msg = String.format("Theme %s cannot extend itself", descriptor);
                throw new InvalidDefinitionException(msg, getLocation());
            }

            // ensure no circular hierarchy
            DefDescriptor<ThemeDef> current = extendsDescriptor;
            while (current != null) {
                if (current.equals(descriptor)) {
                    String msg = String.format("%s must not through its parent eventually extend itself", descriptor);
                    throw new InvalidDefinitionException(msg, getLocation());
                }
                current = current.getDef().getExtendsDescriptor();
            }

            // it would be a mistake to extend an imported theme
            if (imports.contains(extendsDescriptor)) {
                String msg = String.format("Cannot extend and import from the same theme %s", extendsDescriptor);
                throw new InvalidDefinitionException(msg, getLocation());
            }

            // local themes can't extend other themes. This is an arbitrary restriction to prevent improper usage.
            // if changing, be sure to look over any impact on appendDependencies as well.
            if (isLocal) {
                String msg = String.format("Local theme %s must not extend any other theme", descriptor);
                throw new InvalidDefinitionException(msg, getLocation());
            }

            // the parent theme must not be a local theme. This would usually be a mistake/improper usage.
            if (extendsDescriptor.getDef().isLocalTheme()) {
                String msg = String.format("Theme %s must not extend from a local theme", descriptor);
                throw new InvalidDefinitionException(msg, getLocation());
            }
        }

        // local themes cannot import. most of the time this would be improper usage
        // if changing, be sure to look over any impact on appendDependencies as well.
        if (isLocal && !imports.isEmpty()) {
            throw new InvalidDefinitionException("Local themes cannot import another theme", getLocation());
        }

        for (DefDescriptor<ThemeDef> theme : imports) {
            ThemeDef def = theme.getDef();

            // can't import a local theme
            if (def.isLocalTheme()) {
                String msg = String.format("Theme %s cannot be imported because it is a local theme", theme);
                throw new InvalidDefinitionException(msg, getLocation());
            }

            // can't import a theme with a parent. This is an arbitrary restriction to enforce a level of var lookup
            // simplicity and prevent misuse of imports.
            if (def.getExtendsDescriptor() != null) {
                String msg = String.format("Theme %s cannot be imported since it uses the 'extends' attribute", theme);
                throw new InvalidDefinitionException(msg, getLocation());
            }

            // TODONM imported themes can't use a provider
        }

        // vars
        for (VarDef def : vars.values()) {
            def.validateReferences();
        }

        // verify var cross references refer to something defined on this theme or on a parent theme. Or if this is a
        // local theme it can also refer to something on the namespace default theme.
        Iterable<String> names = getAllNames();

        if (isLocal) {
            DefDescriptor<ThemeDef> nsDefaultTheme = Themes.getNamespaceDefaultTheme(descriptor);
            if (nsDefaultTheme.exists()) {
                names = Iterables.concat(names, nsDefaultTheme.getDef().getAllNames());
            }
        }

        Set<String> namesSet = ImmutableSet.copyOf(names);
        for (PropertyReference ref : expressionRefs) {
            if (!namesSet.contains(ref.toString())) {
                throw new ThemeValueNotFoundException(ref.toString(), descriptor, getLocation());
            }
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);

        if (extendsDescriptor != null) {
            dependencies.add(extendsDescriptor);
        }

        for (VarDef def : vars.values()) {
            def.appendDependencies(dependencies);
        }

        dependencies.addAll(imports);

        // local themes might cross reference a a global var from the namespace-default theme
        if (isLocal) {
            Set<String> names = getDeclaredNames();
            DefDescriptor<ThemeDef> nsDefaultTheme = Themes.getNamespaceDefaultTheme(descriptor);
            for (PropertyReference ref : expressionRefs) {
                if (!names.contains(ref.toString())) {
                    dependencies.add(nsDefaultTheme);
                    break;
                }
            }
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("imports", imports);
        json.writeMapEntry("vars", vars);
        json.writeMapEnd();
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        return null; // events not supported here
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return other.getDefType().equals(DefType.THEME) && descriptor.equals(other);
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return Lists.newArrayList();
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        throw new UnsupportedOperationException("attributes not supported on ThemeDef");
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getDeclaredAttributeDefs() {
        throw new UnsupportedOperationException("attributes not supported on ThemeDef");
    }

    @Override
    public AttributeDef getAttributeDef(String name) throws QuickFixException {
        throw new UnsupportedOperationException("attributes not supported on ThemeDef");
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof ThemeDefImpl) {
            ThemeDefImpl other = (ThemeDefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(extendsDescriptor, other.extendsDescriptor)
                    && Objects.equal(imports, other.imports)
                    && Objects.equal(vars, other.vars);
        }

        return false;
    }

    public static final class Builder extends RootDefinitionImpl.Builder<ThemeDef> implements ThemeDefBuilder {
        private boolean isLocal;
        private DefDescriptor<ThemeDef> extendsDescriptor;
        private Set<PropertyReference> expressionRefs;
        private Set<DefDescriptor<ThemeDef>> imports = Sets.newLinkedHashSet();
        private Map<String, VarDef> vars = Maps.newLinkedHashMap();

        public Builder() {
            super(ThemeDef.class);
        }

        @Override
        public Builder setIsLocal(boolean isLocal) {
            this.isLocal = isLocal;
            return this;
        }

        @Override
        public Builder setExtendsDescriptor(DefDescriptor<ThemeDef> extendsDescriptor) {
            this.extendsDescriptor = extendsDescriptor;
            return this;
        }

        @Override
        public Builder addImport(DefDescriptor<ThemeDef> themeDescriptor) {
            // this check should be done by the handler, but in case this theme is being built by something else we
            // still need to check it. imports must come first in order to correctly indicate that while
            // "last one wins", declared vars will always win out over vars from imports. If that fact changes, this
            // check can go away. This is mainly for simplifying the var lookup implementation, while still
            // matching the most common expected usages of imports vs. declared vars.

            checkState(vars.isEmpty(), "Theme imports must be added before all vars");
            imports.add(themeDescriptor);
            return this;
        }

        @Override
        public Builder addVarDef(VarDef var) {
            vars.put(var.getName(), var);
            return this;
        }

        public Map<String, VarDef> vars() {
            return vars;
        }

        public Set<DefDescriptor<ThemeDef>> imports() {
            return imports;
        }

        public Builder addAllExpressionRefs(Collection<PropertyReference> refs) {
            if (expressionRefs == null) {
                expressionRefs = Sets.newHashSet();
            }
            expressionRefs.addAll(refs);
            return this;
        }

        public List<DefDescriptor<ThemeDef>> orderedImmutableImports() {
            return ImmutableList.copyOf(imports).reverse(); // reverse so that lookups follow "last one wins" semantics.
        }

        @Override
        public ThemeDefImpl build() {
            return new ThemeDefImpl(this);
        }

        @Override
        public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() {
            throw new UnsupportedOperationException("use var defs instead of attribute defs");
        }

        @Override
        public void addAttributeDef(DefDescriptor<AttributeDef> attrdesc, AttributeDef attributeDef) {
            throw new UnsupportedOperationException("use var defs instead of attribute defs");
        }
    }
}
