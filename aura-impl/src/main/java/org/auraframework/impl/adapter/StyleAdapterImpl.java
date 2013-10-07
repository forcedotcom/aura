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
import org.auraframework.css.parser.ThemeOverrideMap;
import org.auraframework.css.parser.ThemeValueProvider;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.css.parser.ThemeValueProviderImpl;
import org.auraframework.throwable.quickfix.QuickFixException;

public class StyleAdapterImpl implements StyleAdapter {

    @Override
    public ThemeValueProvider getThemeValueProvider() {
        return new ThemeValueProviderImpl(overrides());
    }

    @Override
    public ThemeValueProvider getThemeValueProvider(ThemeOverrideMap overrides) {
        return new ThemeValueProviderImpl(overrides);
    }

    @Override
    public ThemeValueProvider getThemeValueProviderNoOverrides() {
        return new ThemeValueProviderImpl(null);
    }

    /**
     * Finds the theme overrides from the current app from the context, if present.
     * 
     * @return The overrides from the current app, or null if not set (or if the current "app" is a component)
     */
    private static ThemeOverrideMap overrides() {
        DefDescriptor<?> desc = Aura.getContextService().getCurrentContext().getApplicationDescriptor();

        if (desc != null && desc.getDefType() == DefType.APPLICATION) {
            try {
                return ((ApplicationDef) desc.getDef()).getThemeOverrides();
            } catch (QuickFixException e) {
            }
        }
        return null;
    }
}
