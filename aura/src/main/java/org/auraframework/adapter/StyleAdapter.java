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
package org.auraframework.adapter;

import java.util.List;

import org.auraframework.css.ThemeList;
import org.auraframework.css.ThemeValueProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.salesforce.omakase.plugin.Plugin;

/**
 * Adapter for CSS/Style stuff.
 */
public interface StyleAdapter extends AuraAdapter {
    /**
     * Gets a {@link ThemeValueProvider} using whatever theme overrides are set on the current {@link AuraContext}. This
     * is usually the method you want.
     *
     * @param descriptor The {@link StyleDef} descriptor of the CSS file being parsed. This is used to determine which
     *            namespace-default {@link ThemeDef} to use, as well as which component-bundle {@link ThemeDef} to use.
     */
    ThemeValueProvider getThemeValueProvider(DefDescriptor<StyleDef> descriptor) throws QuickFixException;

    /**
     * Gets a {@link ThemeValueProvider} using the given overrides.
     *
     * @param descriptor The {@link StyleDef} descriptor of the CSS file being parsed. This is used to determine which
     *            namespace-default {@link ThemeDef} to use, as well as which component-bundle {@link ThemeDef} to use.
     * @param overrideThemes The {@link ThemeList} containing the override themes.
     */
    ThemeValueProvider getThemeValueProvider(DefDescriptor<StyleDef> descriptor, ThemeList overrideThemes)
            throws QuickFixException;

    /**
     * Gets a {@link ThemeValueProvider} that doesn't use any override theme (even if one is set on the current
     * {@link AuraContext}).
     *
     * @param descriptor The {@link StyleDef} descriptor of the CSS file being parsed. This is used to determine which
     *            namespace-default {@link ThemeDef} to use, as well as which component-bundle {@link ThemeDef} to use.
     */
    ThemeValueProvider getThemeValueProviderNoOverrides(DefDescriptor<StyleDef> descriptor) throws QuickFixException;

    /**
     * Gets <em>additional</em> CSS {@link Plugin}s to run during the initial preprocessing phase of {@link StyleDef}s.
     * <p>
     * Any plugins specified here will run only when a {@link StyleDef} is initially parsed. This is the ideal phase to
     * specify an additional plugin as it is more efficient.
     * <p>
     * A plugin is appropriate to return here if it only needs to run the first time the CSS source code is parsed.
     * Validating plugins may be good candidates. However note that if your plugin is reworking or validating syntax
     * units that may encountered as a result of theme token substitutions, {@link #getRuntimePlugins()} is usually the
     * better method to return your plugin from. That is, if a theme token substitution results in changes that your
     * plugin may be interested in, your plugin will only have access to this information when executed during the
     * runtime phase.
     * <p>
     * All plugins specified here will run <em>after</em> any of the default compilation-only plugins specified by Aura,
     * but <em>before</em> any of the default compilation+runtime plugins specified by Aura or any plugins returned from
     * {@link #getRuntimePlugins()}.
     * <p>
     * You should include the default plugins returned from super (if you are extending the default impl) unless you
     * intend to prevent them from running. However the default list that is returned may be immutable, so you should
     * rather add them to your own list at the appropriate time (usually first).
     *
     * @return The list of plugins.
     */
    List<Plugin> getCompilationPlugins();

    /**
     * Gets <em>additional</em> CSS {@link Plugin}s to run during both the initial preprocessing phase of
     * {@link StyleDef} and also during every runtime parsing phase.
     * <p>
     * <b>Note:</b> These plugins will be executed during the compilation phase as well.
     * <p>
     * During the runtime parsing phase, only explicitly refined syntax units will be delivered to subscription methods.
     * You may choose to explicitly refine a syntax unit yourself, but <b>only if you guard against unnecessarily
     * refining anything inapplicable to what you are doing.</b> It is perfectly fine, and usually what you want, to not
     * refine anything at all but to simply deal with whatever other plugins (such as theme token substitution) have
     * decided to refine.
     * <p>
     * This method is called once per parsing of a single {@link StyleDef}, thus any plugins specified here will not
     * have insight into the entire set of CSS to be combined and served together. This is usually fine for most
     * plugins, but for plugins validating in the aggregate (or any plugins collecting aggregate data) you should look
     * into {@link #getContextualRuntimePlugins()} instead.
     * <p>
     * All plugins specified here will run <em>after</em> any of the default compilation-only plugins specified by Aura
     * or by {@link #getCompilationPlugins()}, but <em>before</em> any plugins specified in
     * {@link #getContextualRuntimePlugins()}.
     * <p>
     * You should include the default plugins returned from super (if you are extending the default impl) unless you
     * intend to prevent them from running. However the default list that is returned may be immutable, so you should
     * rather add them to your own list at the appropriate time (usually first).
     *
     * @return The list of plugins.
     */
    List<Plugin> getRuntimePlugins();

    /**
     * Gets <em> additional</em> CSS {@link Plugin}s to run during the runtime parsing phase <b>only</b>.
     * <p>
     * During the runtime parsing phase, only explicitly refined syntax units will be delivered to subscription methods.
     * You may choose to explicitly refine a syntax unit yourself, but <b>only if you guard against unnecessarily
     * refining anything inapplicable to what you are doing.</b> It is perfectly fine, and usually what you want, to not
     * refine anything at all but to simply deal with whatever other plugins (such as theme token substitution) have
     * decided to refine.
     * <p>
     * The same instance of each plugin returned here will be used for each {@link StyleDef}, which gives the plugin
     * insight into the entire set of CSS to be combined and served together (e.g., in app.css). This may be important
     * for plugins validating in the aggregate or plugins collecting aggregate data. If this is not the case for your
     * plugin, prefer to return the plugin from {@link #getRuntimePlugins()} instead. Plugins returned from this method
     * will not run during {@link StyleDef} compilation.
     * <p>
     * These plugins run <em>after</em> any of the default plugins specified by Aura or by {@link #getRuntimePlugins()}.
     * <p>
     * You should include the default plugins returned from super (if you are extending the default impl) unless you
     * intend to prevent them from running. However the default list that is returned may be immutable, so you should
     * rather add them to your own list at the appropriate time (usually first).
     *
     * @return The list of plugins.
     */
    List<Plugin> getContextualRuntimePlugins();
}
