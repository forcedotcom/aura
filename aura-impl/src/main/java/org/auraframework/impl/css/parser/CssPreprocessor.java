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
package org.auraframework.impl.css.parser;

import java.util.List;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.StyleParserException;

import com.google.common.collect.Sets;
import com.salesforce.omakase.Omakase;
import com.salesforce.omakase.PluginRegistry;
import com.salesforce.omakase.plugin.Plugin;
import com.salesforce.omakase.plugin.basic.Conditionals;
import com.salesforce.omakase.plugin.basic.ConditionalsValidator;
import com.salesforce.omakase.plugin.basic.PrefixPruner;
import com.salesforce.omakase.plugin.basic.Prefixer;
import com.salesforce.omakase.plugin.other.UnquotedIEFilterPlugin;
import com.salesforce.omakase.plugin.validator.StandardValidation;
import com.salesforce.omakase.writer.StyleWriter;

/**
 * Parses CSS source code.
 *
 * Use either {@link #initial()} or {@link #runtime(Client.Type)} to get started.
 */
public final class CssPreprocessor {
    /** Use one of the constructor methods instead */
    private CssPreprocessor() {}

    /** For the initial preprocessing of css, this includes all syntax validations and static rework */
    public static ParserConfiguration initial() {
        return new ParserConfiguration(false);
    }

    /** For parsing contextual css, skips syntax validations and static rework, uses client from the current context */
    public static ParserConfiguration runtime() {
        return runtime(Aura.getContextService().getCurrentContext().getClient().getType());
    }

    /** For parsing contextual css, skips syntax validations and static rework, uses given client type */
    public static ParserConfiguration runtime(Client.Type type) {
        return new ParserConfiguration(true).clientType(type);
    }

    /** Configuration for the css parser */
    public static final class ParserConfiguration {
        private String content;
        private String resourceName;
        private final boolean runtime;
        private final Set<Plugin> plugins = Sets.newLinkedHashSet();

        public ParserConfiguration(boolean runtime) {
            this.runtime = runtime;

            // add default plugins

            if (!runtime) {
                // we only want extra validation on the initial pass. During subsequent runtime calls we will already
                // know the code is valid so no need to validate again.
                plugins.add(new StandardValidation());
                plugins.addAll(Aura.getStyleAdapter().getCompilationPlugins());
            }

            plugins.add(new UrlCacheBustingPlugin());
            plugins.add(new UnquotedIEFilterPlugin());
            plugins.add(Prefixer.defaultBrowserSupport().prune(true));
            plugins.add(PrefixPruner.prunePrefixedAtRules());
            plugins.addAll(Aura.getStyleAdapter().getRuntimePlugins());
        }

        /** specify css source code */
        public ParserConfiguration source(CharSequence content) {
            this.content = content.toString();
            return this;
        }

        /** name of the resource being parsed. used for error reporting */
        public ParserConfiguration resourceName(String resourceName) {
            this.resourceName = resourceName;
            return this;
        }

        /** replacement class name (no dot), e.g., "uiButton" */
        public ParserConfiguration componentClass(String componentClass, boolean validate) {
            if (!runtime) {
                plugins.add(new SelectorScopingPlugin(componentClass, validate));
            }
            return this;
        }

        /** enables aura themes */
        public ParserConfiguration themes(DefDescriptor<StyleDef> styleDef) throws QuickFixException {
            plugins.add(runtime ? ThemeFunctionPlugin.resolving(styleDef) : ThemeFunctionPlugin.passthrough(styleDef));
            return this;
        }

        /** allowed conditionals (e.g., set of allowed browsers) */
        public ParserConfiguration allowedConditions(Set<String> allowedConditions) {
            plugins.add(new ConditionalsValidator(allowedConditions));
            return this;
        }

        /** eliminate conditionals not matching this client type */
        public ParserConfiguration clientType(Client.Type client) {
            Conditionals conditionals = new Conditionals();
            if (client != null) {
                conditionals.manager().addTrueConditions(client.name().toLowerCase());
            }
            plugins.add(conditionals);
            return this;
        }

        /** specifies any additional css plugins to run */
        public ParserConfiguration extras(List<Plugin> plugins) {
            this.plugins.addAll(plugins);
            return this;
        }

        /** parses the CSS according to the specified configuration */
        public ParserResult parse() throws StyleParserException, QuickFixException {
            // determine the output compression level based on the aura mode
            Mode mode = Aura.getContextService().getCurrentContext().getMode();
            StyleWriter writer = mode.prettyPrint() ? StyleWriter.inline() : StyleWriter.compressed();

            if (!runtime) {
                // write annotated comments out on the initial pass, in case the runtime pass needs them
                writer.writeComments(true, true);
            }

            // do the parsing
            CssErrorManager em = new CssErrorManager(resourceName);
            PluginRegistry registry = Omakase.source(content).add(plugins).add(writer).add(em).process();

            // report any errors found during parsing
            em.checkErrors();

            // return the results
            ParserResult result = new ParserResult();
            result.content = writer.write();

            if (registry.retrieve(ThemeFunctionPlugin.class).isPresent()) {
                result.themeExpressions = registry.retrieve(ThemeFunctionPlugin.class).get().parsedExpressions();
            }

            return result;
        }
    }

    /** Result of calling {@link ParserConfiguration#parse()} */
    public static final class ParserResult {
        protected String content;
        protected Set<String> themeExpressions;

        /** parsed content */
        public String content() {
            return content;
        }

        /** all theme references found in the source */
        public Set<String> themeExpressions() {
            return themeExpressions;
        }
    }
}
