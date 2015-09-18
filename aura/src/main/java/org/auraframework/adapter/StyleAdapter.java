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
import java.util.Set;

import org.auraframework.css.ResolveStrategy;
import org.auraframework.css.TokenCache;
import org.auraframework.css.TokenValueProvider;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.system.AuraContext;

import com.salesforce.omakase.plugin.Plugin;

/**
 * Adapter for CSS/Style stuff.
 */
public interface StyleAdapter extends AuraAdapter {
    /**
     * Gets a {@link TokenValueProvider} using whatever overrides are set on the current {@link AuraContext}. This is
     * usually the method you want.
     *
     * @param style The {@link StyleDef} descriptor of the CSS file being parsed. This is used to determine which
     *            namespace-default {@link TokensDef} to use.
     */
    TokenValueProvider getTokenValueProvider(DefDescriptor<? extends BaseStyleDef> style);

    /**
     * Gets a {@link TokenValueProvider}.
     * <p>
     * The given {@link ResolveStrategy} determines which overrides are automatically included. If
     * {@link ResolveStrategy#RESOLVE_NORMAL} then this will use whatever overrides are set on the current
     * {@link AuraContext}. Otherwise, no overrides will be automatically included.
     *
     * @param style The {@link StyleDef} descriptor of the CSS file being parsed. This is used to determine which
     *            namespace-default {@link TokensDef} to use.
     * @param strategy An indication of how this provider is going to be used.
     */
    TokenValueProvider getTokenValueProvider(DefDescriptor<? extends BaseStyleDef> style, ResolveStrategy strategy);

    /**
     * Gets a {@link TokenValueProvider} using the given overrides.
     *
     * @param style The {@link StyleDef} descriptor of the CSS file being parsed. This is used to determine which
     *            namespace-default {@link TokensDef} to use.
     * @param strategy An indication of how this provider is going to be used.
     * @param overrides The {@link TokenCache} containing the overrides.
     */
    TokenValueProvider getTokenValueProvider(DefDescriptor<? extends BaseStyleDef> style, ResolveStrategy strategy,
            TokenCache overrides);

    /**
     * Gets <em>additional</em> CSS {@link Plugin}s to run during the initial preprocessing phase of {@link StyleDef}s.
     * <p>
     * Any plugins specified here will run only when a {@link StyleDef} is initially parsed. This is the ideal phase to
     * specify an additional plugin as it is more efficient.
     * <p>
     * A plugin is appropriate to return here if it only needs to run the first time the CSS source code is parsed.
     * Validating plugins may be good candidates. However note that if your plugin is reworking or validating syntax
     * units that may encountered as a result of token substitutions, {@link #getRuntimePlugins()} is usually the better
     * method to return your plugin from. That is, if a token substitution results in changes that your plugin may be
     * interested in, your plugin will only have access to this information when executed during the runtime phase.
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
     * refine anything at all but to simply deal with whatever other plugins (such as token substitution) have decided
     * to refine.
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
     * refine anything at all but to simply deal with whatever other plugins (such as token substitution) have decided
     * to refine.
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

    /**
     * Returns any extra conditions to be allowed in CSS {@code @}if blocks.
     * <p>
     * This is in addition to the conditions enabled by the framework by default, such as certain browser types. Note
     * that this is used for validation purposes only. To specify which conditions are actually true for the current
     * context see {@link #getExtraTrueConditions()} instead.
     * <p>
     * <b>IMPORTANT!!!</b> Do not enable additional conditions without first understanding the potential perf impact!
     * Each additional condition may have an exponential effect on the number CSS permutations. This may impact the
     * number of CSS files that must be generated and cached server side.
     *
     * @return The set of extra conditions.
     */
    Set<String> getExtraAllowedConditions();

    /**
     * Gets the set of extra CSS conditions that are "true" for the current context. Any condition returned here must
     * also be specified in {@link #getExtraTrueConditions()}. Do not specify any conditions that are automatically
     * handled by the framework, such as certain browser types.
     * <p>
     * It's important that the return value is consistent and idempotent.
     * <p>
     * <b>IMPORTANT!!!</b> Do not enable additional conditions without first understanding the potential perf impact!
     * Each additional condition may have an exponential effect on the number CSS permutations. This may impact the
     * number of CSS files that must be generated and cached server side.
     *
     * @return The of conditions that are true.
     */
    Set<String> getExtraTrueConditions();
}
