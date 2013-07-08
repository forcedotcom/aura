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

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.adapter.StyleAdapter;
import org.auraframework.css.parser.ThemeOverrideMap;
import org.auraframework.css.parser.ThemeValueProvider;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.css.parser.ThemeValueProviderImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

public class StyleAdapterImpl implements StyleAdapter {

    @Override
    public ThemeValueProvider getThemeValueProvider() {
        return new ThemeValueProviderImpl();
    }

    @Override
    public ThemeValueProvider getThemeValueProvider(ThemeOverrideMap overrides,
            Map<String, DefDescriptor<ThemeDef>> aliases) {
        return new ThemeValueProviderImpl(overrides, aliases);
    }

    @Override
    public ThemeValueProvider getThemeValueProvider(String descriptorName) throws QuickFixException {
        return getThemeValueProvider(overrides(), aliases(descriptorName));
    }

    /**
     * Finds the current app from the context, if present.
     * 
     * @return The current app, or null if not set (or if the current "app" is a component)
     */
    private static ThemeOverrideMap overrides() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        DefDescriptor<? extends BaseComponentDef> descriptor = context.getApplicationDescriptor();

        if (descriptor == null) {
            return null;
        }

        BaseComponentDef def = descriptor.getDef();

        // check that it's actually an application, not a component
        if (!(def instanceof ApplicationDef)) {
            return null;
        }

        ApplicationDef app = (ApplicationDef) def;
        return app.getThemeOverrides();
    }

    /**
     * Gets the aliases from the {@link ComponentDef} or {@link ApplicationDef} associated with the {@link StyleDef}
     * being rendered. Neither the component or the application must exist, however their existence is the only way for
     * aliases to be specified.
     */
    private static Map<String, DefDescriptor<ThemeDef>> aliases(String descriptorName) throws QuickFixException {
        DefinitionService descService = Aura.getDefinitionService();

        DefDescriptor<? extends BaseComponentDef> theOne;

        // try the component first
        theOne = descService.getDefDescriptor(descriptorName, ComponentDef.class);
        if (!theOne.exists()) {
            // try looking for an app
            theOne = descService.getDefDescriptor(descriptorName, ApplicationDef.class);
            if (!theOne.exists()) {
                return null;
            }
        }

        return theOne.getDef().getThemeAliases();
    }
}
