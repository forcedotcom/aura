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
import java.util.Set;

import org.auraframework.builder.FlavoredStyleDefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.css.style.AbstractStyleDef;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.css.util.Themes;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * TODONM: add support for async loading via serialize method (same behavior as regular style def, probably just
 * abstract that).
 */
public final class FlavoredStyleDefImpl extends AbstractStyleDef<FlavoredStyleDef> implements FlavoredStyleDef {
    private static final long serialVersionUID = -8722320028754842489L;

    private final Set<String> flavorNames;

    protected FlavoredStyleDefImpl(Builder builder) {
        super(builder);
        this.flavorNames = AuraUtil.immutableSet(builder.flavorNames);
    }

    @Override
    public Set<String> getFlavorNames() {
        return flavorNames;
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (!getExpressions().isEmpty()) {
            DefDescriptor<ThemeDef> namespaceTheme = Themes.namespaceThemeDescriptor(descriptor);
            if (namespaceTheme.exists()) {
                dependencies.add(namespaceTheme);
            }
        }

        if (getDescriptor().getPrefix().equals(DefDescriptor.CUSTOM_FLAVOR_PREFIX)) {
            dependencies.add(Flavors.toComponentDescriptor(getDescriptor()));
        }
    }

    @Override
    public void serialize(Json json) throws IOException {}

    public static class Builder extends AbstractStyleDef.Builder<FlavoredStyleDef> implements FlavoredStyleDefBuilder {
        public Builder() {
            super(FlavoredStyleDef.class);
        }

        private Set<String> flavorNames;

        @Override
        public FlavoredStyleDef build() throws QuickFixException {
            return new FlavoredStyleDefImpl(this);
        }

        @Override
        public Builder setFlavorNames(Set<String> flavorNames) {
            this.flavorNames = flavorNames;
            return this;
        }
    }
}
