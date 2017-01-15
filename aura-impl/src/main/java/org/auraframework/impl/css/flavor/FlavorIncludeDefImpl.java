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

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.FlavorAnnotation;
import org.auraframework.css.FlavorOverrideLocation;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.collect.HashBasedTable;
import com.google.common.collect.Table;

public class FlavorIncludeDefImpl extends DefinitionImpl<FlavorIncludeDef> implements FlavorIncludeDef {
    private static final long serialVersionUID = -1770409815240347647L;
    private static final String ERROR_MSG = "The 'source' attribute must take the format of ns:bundle, e.g., 'myNamespace:flavors'";

    private final String source;
    private final String namespace;
    private final String bundle;
    private final DescriptorFilter filter;
    private final DefDescriptor<? extends RootDefinition> parentDescriptor;

    private final int hashCode;

    public FlavorIncludeDefImpl(Builder builder) throws InvalidDefinitionException {
        super(builder);
        this.source = builder.source;
        this.parentDescriptor = builder.parentDescriptor;

        String[] split = source.split(":");
        if (split.length != 2) {
            throw new InvalidDefinitionException(ERROR_MSG, getLocation());
        }

        namespace = split[0];
        bundle = split[1];

        String fmt = String.format("%s://%s:*", DefDescriptor.CUSTOM_FLAVOR_PREFIX, namespace);
        this.filter = new DescriptorFilter(fmt, DefType.FLAVORED_STYLE);

        this.hashCode = AuraUtil.hashCode(descriptor, location, source);
    }

    @Override
    public String getSource() {
        return source;
    }

    @Override
    public DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        return parentDescriptor;
    }

    @SuppressWarnings("unchecked")
    private List<DefDescriptor<FlavoredStyleDef>> getDefs() {
        DefinitionService definitionService = Aura.getDefinitionService();

        List<DefDescriptor<FlavoredStyleDef>> defs = new ArrayList<>();

        for (DefDescriptor<?> dd : definitionService.find(filter)) {
            // currently getBundle will only work with file-based, unless the other loaders also set the bundle
            if (dd.getDefType() == DefType.FLAVORED_STYLE && dd.getBundle().getName().equals(bundle)) {
                defs.add((DefDescriptor<FlavoredStyleDef>) dd);
            }
        }

        return defs;
    }

    @Override
    public Table<DefDescriptor<ComponentDef>, String, FlavorOverrideLocation> computeOverrides() throws QuickFixException {
        // component / flavor (might be multiple per cmp) / override location (should only be one per cmp/flavor combo)
        Table<DefDescriptor<ComponentDef>, String, FlavorOverrideLocation> table = HashBasedTable.create();

        for (DefDescriptor<FlavoredStyleDef> style : getDefs()) {
            DefDescriptor<ComponentDef> cmp = Flavors.toComponentDescriptor(style);
            Map<String, FlavorAnnotation> annotations = style.getDef().getFlavorAnnotations();
            for (FlavorAnnotation annotation : annotations.values()) {
                table.put(cmp, annotation.getFlavorName(), new FlavorOverrideLocationImpl(style, annotation.getOverridesIf().orElse(null)));
            }
        }

        return table;
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        dependencies.addAll(getDefs());
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof FlavorIncludeDef) {
            FlavorIncludeDefImpl other = (FlavorIncludeDefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(source, other.source);
        }

        return false;
    }

    /** builder class */
    public static final class Builder extends DefinitionImpl.BuilderImpl<FlavorIncludeDef> {
        public Builder() {
            super(FlavorIncludeDef.class);
        }

        private DefDescriptor<? extends RootDefinition> parentDescriptor;
        private String source;

        public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
            return this;
        }

        public Builder setSource(String source) {
            this.source = source;
            return this;
        }

        @Override
        public FlavorIncludeDef build() throws InvalidDefinitionException {
            return new FlavorIncludeDefImpl(this);
        }
    }
}
