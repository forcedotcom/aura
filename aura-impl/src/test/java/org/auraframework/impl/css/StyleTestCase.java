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
package org.auraframework.impl.css;

import com.google.common.base.Joiner;
import com.google.common.collect.Lists;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.inject.Inject;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * for testing stuff that needs StyleDef, TokenDef sources.
 */
public abstract class StyleTestCase extends AuraImplTestCase {
    private static AtomicLong counter = new AtomicLong();
    private String ns1;
    private String ns2;

    @Inject
    protected DefinitionService definitionService;

    @Inject
    protected ContextService contextService;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        long num = counter.incrementAndGet();
        this.ns1 = "nsA" + num;
        this.ns2 = "nsB" + num;

        // make sure the registry is aware of the new namespaces
        String desc = ns1 + ":dummy";
        DefDescriptor<ComponentDef> dummy = definitionService.getDefDescriptor(desc, ComponentDef.class);
        addSourceAutoCleanup(dummy, "<aura:component></aura:component>");

        desc = ns2 + ":dummy";
        dummy = definitionService.getDefDescriptor(desc, ComponentDef.class);
        addSourceAutoCleanup(dummy, "<aura:component></aura:component>");

        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
    }

    /** gets the name of the first namespace */
    public String getNs1() {
        return ns1;
    }

    /** gets the name of the second namespace */
    public String getNs2() {
        return ns2;
    }

    /** adds a {@link StyleDef} to the namespace with the given source */
    public DefDescriptor<StyleDef> addStyleDef(CharSequence src) {
        DefDescriptor<ComponentDef> bundle = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>",
                getNs1() + ":style");
        DefDescriptor<StyleDef> desc = definitionService.getDefDescriptor(
                String.format("%s://%s.%s", DefDescriptor.CSS_PREFIX, bundle.getNamespace(), bundle.getName()),
                StyleDef.class, bundle);
        return addSourceAutoCleanup(desc, src.toString());
    }

    /** adds a {@link StyleDef} in the "other" namespace with the given source */
    public DefDescriptor<StyleDef> addStyleDefOtherNamespace(CharSequence src) {
        DefDescriptor<ComponentDef> bundle = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>",
                getNs2() + ":style");
        DefDescriptor<StyleDef> desc = definitionService.getDefDescriptor(
                String.format("%s://%s.%s", DefDescriptor.CSS_PREFIX, bundle.getNamespace(), bundle.getName()),
                StyleDef.class, bundle);
        return addSourceAutoCleanup(desc, src.toString());
    }

    /** adds a {@link ComponentDef} to the namespace with a basic source */
    public DefDescriptor<ComponentDef> addComponentDef() {
        return addComponentDef("<aura:component/>");
    }

    /** adds a {@link ComponentDef} to the namespace with a flavorable div */
    public DefDescriptor<ComponentDef> addFlavorableComponentDef() {
        return addComponentDef("<aura:component><div aura:flavorable='true'></div></aura:component>");
    }

    /** adds a {@link ComponentDef} to the namespace with the given source */
    public DefDescriptor<ComponentDef> addComponentDef(CharSequence src) {
        return addSourceAutoCleanup(ComponentDef.class, src.toString(), getNs1() + ":" + "cmp");
    }

    /** adds a {@link ComponentDef} to the namespace with the given source */
    public DefDescriptor<ComponentDef> addComponentDefOtherNamespace(CharSequence src) {
        return addSourceAutoCleanup(ComponentDef.class, src.toString(), getNs2() + ":" + "cmp");
    }

    /** gets the parsed output of the given style */
    public String getParsedCss(DefDescriptor<? extends BaseStyleDef> styleDesc) throws QuickFixException {
        return definitionService.getDefinition(styleDesc).getCode();
    }

    /** gets the parsed output of the given style. This ensures the application explicit tokens are registered */
    public String getParsedCssUseAppTokens(DefDescriptor<? extends BaseStyleDef> styleDesc) throws QuickFixException {
        // ensures app's tokens are added to the context
        // create style context?
        return definitionService.getDefinition(styleDesc).getCode();
    }

    /** adds the namespace-default {@link TokensDef} to the namespace with the given source */
    public DefDescriptor<TokensDef> addNsTokens(CharSequence src) {
        String fmt = String.format("%s:%sNamespace", ns1, ns1);
        DefDescriptor<TokensDef> desc = definitionService.getDefDescriptor(fmt, TokensDef.class);
        addSourceAutoCleanup(desc, src.toString());
        return desc;
    }

    /** adds the namespace-default {@link TokensDef} to the "other" namespace with the given source */
    public DefDescriptor<TokensDef> addNsTokensOtherNamespace(CharSequence src) {
        String fmt = String.format("%s:%sNamespace", ns2, ns2);
        DefDescriptor<TokensDef> desc = definitionService.getDefDescriptor(fmt, TokensDef.class);
        addSourceAutoCleanup(desc, src.toString());
        return desc;
    }

    /** adds an extra {@link TokensDef} to the namespace */
    public DefDescriptor<TokensDef> addSeparateTokens(CharSequence src) {
        String fmt = String.format("%s:%s", ns1, getAuraTestingUtil().getNonce("testTokens"));
        DefDescriptor<TokensDef> desc = definitionService.getDefDescriptor(fmt, TokensDef.class);
        addSourceAutoCleanup(desc, src.toString());
        return desc;
    }

    /** adds an extra {@link TokensDef} to the "other" namespace */
    public DefDescriptor<TokensDef> addSeparateTokensOtherNamespace(CharSequence src) {
        String fmt = String.format("%s:%s", ns2, getAuraTestingUtil().getNonce("testTokens"));
        DefDescriptor<TokensDef> desc = definitionService.getDefDescriptor(fmt, TokensDef.class);
        addSourceAutoCleanup(desc, src.toString());
        return desc;
    }

    /**
     * adds an app to the ns, and restarts the context with new app. Must be called after any other addContextApp*
     * methods.
     */
    public DefDescriptor<ApplicationDef> addContextApp(CharSequence src) throws QuickFixException {
        String fmt = String.format("%s:%s", ns1, "testApp");
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(fmt, ApplicationDef.class);
        addSourceAutoCleanup(appDesc, src.toString());

        // restart the context with the new app
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        AuraContext ctx = contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED, appDesc);
        ctx.setApplicationDescriptor(appDesc);
        definitionService.updateLoaded(appDesc);
        return appDesc;
    }

    /** adds a style with the given source to the same bundle as the context app */
    public DefDescriptor<StyleDef> addContextAppBundleStyle(CharSequence src) {
        String fmt = String.format("%s.%s", ns1, "testApp");
        DefDescriptor<StyleDef> styleDesc = definitionService.getDefDescriptor(fmt, StyleDef.class);
        return addSourceAutoCleanup(styleDesc, src.toString());
    }

    /** adds a flavor def for the given component in the same bundle */
    public DefDescriptor<FlavoredStyleDef> addStandardFlavor(DefDescriptor<ComponentDef> flavored, CharSequence src) {
        DefDescriptor<FlavoredStyleDef> desc = Flavors.standardFlavorDescriptor(flavored);
        addSourceAutoCleanup(desc, src.toString());
        return desc;
    }

    /** adds a flavor def for the given component, but in a different namespace and within a bundle called "flavors". */
    public DefDescriptor<FlavoredStyleDef> addCustomFlavor(DefDescriptor<ComponentDef> flavored, CharSequence src) {
        DefDescriptor<FlavoredStyleDef> desc = Flavors.customFlavorDescriptor(flavored, ns2, "flavors");
        addSourceAutoCleanup(desc, src.toString());
        return desc;
    }

    /** adds a flavor def for the given component, in the same namespace and within a bundle called "flavors". */
    public DefDescriptor<FlavoredStyleDef> addCustomFlavorToFirstNamespace(DefDescriptor<ComponentDef> flavored, CharSequence src) {
        DefDescriptor<FlavoredStyleDef> desc = Flavors.customFlavorDescriptor(flavored, ns1, "flavors");
        addSourceAutoCleanup(desc, src.toString());
        return desc;
    }

    /** adds a flavor assortment def */
    public DefDescriptor<FlavorsDef> addFlavorAssortment(CharSequence src) {
        return addSourceAutoCleanup(FlavorsDef.class, src.toString(), getNs1() + ":" + "fa");
    }

    /** adds a flavor assortment def to the "other" namespace */
    public DefDescriptor<FlavorsDef> addFlavorAssortmentOtherNamespace(CharSequence src) {
        return addSourceAutoCleanup(FlavorsDef.class, src.toString(), getNs2() + ":" + "fa");
    }

    /** adds a flavor assortment with the given source to the same bundle as the context app */
    public DefDescriptor<FlavorsDef> addContextAppFlavorAssortment(CharSequence src) {
        String fmt = String.format("%s:%s", ns1, "testApp");
        DefDescriptor<FlavorsDef> faDesc = definitionService.getDefDescriptor(fmt, FlavorsDef.class);
        return addSourceAutoCleanup(faDesc, src.toString());
    }

    /** helper for building a tokens def string source */
    public TokensSrcBuilder tokens() {
        return new TokensSrcBuilder();
    }

    public static final class TokensSrcBuilder implements CharSequence {
        private DefDescriptor<TokensDef> parent;
        private final List<String> content = Lists.newArrayList();
        private String descriptorProvider;
        private String mapProvider;

        public TokensSrcBuilder token(String name, String value) {
            content.add(String.format("<aura:token name='%s' value='%s'/>", name, value));
            return this;
        }

        public TokensSrcBuilder parent(DefDescriptor<TokensDef> parent) {
            this.parent = checkNotNull(parent, "parent cannot be null");
            return this;
        }

        public TokensSrcBuilder descriptorProvider(String descriptorProvider) {
            this.descriptorProvider = descriptorProvider;
            return this;
        }

        public TokensSrcBuilder mapProvider(String mapProvider) {
            this.mapProvider = mapProvider;
            return this;
        }

        public TokensSrcBuilder imported(DefDescriptor<TokensDef> imported) {
            content.add(String.format("<aura:import name='%s'/>", imported.getDescriptorName()));
            return this;
        }

        @Override
        public String toString() {
            StringBuilder builder = new StringBuilder();

            builder.append("<aura:tokens");

            if (descriptorProvider != null) {
                builder.append(" provider='");
                builder.append(descriptorProvider);
                builder.append("'");
            }

            if (mapProvider != null) {
                builder.append(" mapProvider='");
                builder.append(mapProvider);
                builder.append("'");
            }

            if (parent != null) {
                builder.append(" extends='");
                builder.append(parent.getDescriptorName());
                builder.append("'");
            }
            builder.append(">");

            builder.append(Joiner.on("").join(content));

            builder.append("</aura:tokens>");
            return builder.toString();
        }

        @Override
        public int length() {
            throw new UnsupportedOperationException();
        }

        @Override
        public char charAt(int index) {
            throw new UnsupportedOperationException();
        }

        @Override
        public CharSequence subSequence(int start, int end) {
            throw new UnsupportedOperationException();
        }
    }
}
