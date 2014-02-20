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
package org.auraframework.impl.adapter;

import org.auraframework.Aura;
import org.auraframework.adapter.StyleAdapter;
import org.auraframework.css.ThemeValueProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.css.ThemeValueProviderImpl;

public final class StyleAdapterImpl implements StyleAdapter {
    @Override
    public ThemeValueProvider getThemeValueProvider(DefDescriptor<StyleDef> descriptor) {
        return getThemeValueProvider(descriptor, overrides());
    }

    @Override
    public ThemeValueProvider getThemeValueProvider(DefDescriptor<StyleDef> descriptor, DefDescriptor<ThemeDef> override) {
        return new ThemeValueProviderImpl(descriptor, override);
    }

    @Override
    public ThemeValueProvider getThemeValueProviderNoOverrides(DefDescriptor<StyleDef> descriptor) {
        return new ThemeValueProviderImpl(descriptor, null);
    }

    private static DefDescriptor<ThemeDef> overrides() {
        return Aura.getContextService().getCurrentContext().getOverrideThemeDescriptor();
    }
}
