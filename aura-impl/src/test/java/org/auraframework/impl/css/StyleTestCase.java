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

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorAssortmentDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.def.DefinitionTest;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Joiner;
import com.google.common.collect.Lists;

/**
 * for testing stuff that needs StyleDef, ThemeDef sources.
 */
public abstract class StyleTestCase extends DefinitionTest {
    private static AtomicLong counter = new AtomicLong();
    private String ns1;
    private String ns2;

    public StyleTestCase(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        long num = counter.incrementAndGet();
        this.ns1 = "nsA" + num;
        this.ns2 = "nsB" + num;

        // make sure the registry is aware of the new namespaces
        String desc = ns1 + ":dummy";
        DefDescriptor<ComponentDef> dummy = Aura.getDefinitionService().getDefDescriptor(desc, ComponentDef.class);
        addSourceAutoCleanup(dummy, "<aura:component></aura:component>");

        desc = ns2 + ":dummy";
        dummy = Aura.getDefinitionService().getDefDescriptor(desc, ComponentDef.class);
        addSourceAutoCleanup(dummy, "<aura:component></aura:component>");

        ContextService contextService = Aura.getContextService();
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
        return addSourceAutoCleanup(StyleDef.class, src.toString(), getNs1() + "." + "style");
    }

    /** adds a {@link StyleDef} in the "other" namespace with the given source */
    public DefDescriptor<StyleDef> addStyleDefOtherNamespace(CharSequence src) {
        return addSourceAutoCleanup(StyleDef.class, src.toString(), getNs2() + "." + "style");
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
        return styleDesc.getDef().getCode();
    }

    /** gets the parsed output of the given style. This ensures the application explicit theme is registered */
    public String getParsedCssUseAppTheme(DefDescriptor<? extends BaseStyleDef> styleDesc) throws QuickFixException {
        // ensures app's theme is added to the context
        Aura.getContextService().getCurrentContext().addAppThemeDescriptors();
        return styleDesc.getDef().getCode();
    }

    /** adds the namespace-default {@link ThemeDef} to the namespace with the given source */
    public DefDescriptor<ThemeDef> addNsTheme(CharSequence src) {
        String fmt = String.format("%s:%sTheme", ns1, ns1);
        DefDescriptor<ThemeDef> themeDesc = Aura.getDefinitionService().getDefDescriptor(fmt, ThemeDef.class);
        addSourceAutoCleanup(themeDesc, src.toString());
        return themeDesc;
    }

    /** adds the namespace-default {@link ThemeDef} to the "other" namespace with the given source */
    public DefDescriptor<ThemeDef> addNsThemeOtherNamespace(CharSequence src) {
        String fmt = String.format("%s:%sTheme", ns2, ns2);
        DefDescriptor<ThemeDef> themeDesc = Aura.getDefinitionService().getDefDescriptor(fmt, ThemeDef.class);
        addSourceAutoCleanup(themeDesc, src.toString());
        return themeDesc;
    }

    /** adds an extra {@link ThemeDef} to the namespace */
    public DefDescriptor<ThemeDef> addSeparateTheme(CharSequence src) {
        String fmt = String.format("%s:%s", ns1, getAuraTestingUtil().getNonce("testTheme"));
        DefDescriptor<ThemeDef> desc = Aura.getDefinitionService().getDefDescriptor(fmt, ThemeDef.class);
        addSourceAutoCleanup(desc, src.toString());
        return desc;
    }

    /** adds an extra {@link ThemeDef} to the "other" namespace */
    public DefDescriptor<ThemeDef> addSeparateThemeOtherNamespace(CharSequence src) {
        String fmt = String.format("%s:%s", ns2, getAuraTestingUtil().getNonce("testTheme"));
        DefDescriptor<ThemeDef> desc = Aura.getDefinitionService().getDefDescriptor(fmt, ThemeDef.class);
        addSourceAutoCleanup(desc, src.toString());
        return desc;
    }

    /** adds a {@link StyleDef} and a {@link ThemeDef} to the same bundle */
    public DefDescriptor<ThemeDef> addThemeAndStyle(CharSequence themeSrc, CharSequence styleSrc) {
        DefDescriptor<StyleDef> styleDef = addStyleDef(styleSrc);
        String fmt = String.format("%s:%s", styleDef.getNamespace(), styleDef.getName());
        DefDescriptor<ThemeDef> desc = Aura.getDefinitionService().getDefDescriptor(fmt, ThemeDef.class);
        addSourceAutoCleanup(desc, themeSrc.toString());
        return desc;
    }

    /** adds a {@link ThemeDef} to the same bundle as the given {@link StyleDef}. */
    public DefDescriptor<ThemeDef> addCmpTheme(CharSequence themeSrc, DefDescriptor<StyleDef> styleDef) {
        String fmt = String.format("%s:%s", styleDef.getNamespace(), styleDef.getName());
        DefDescriptor<ThemeDef> desc = Aura.getDefinitionService().getDefDescriptor(fmt, ThemeDef.class);
        addSourceAutoCleanup(desc, themeSrc.toString());
        return desc;
    }

    /**
     * adds an app to the ns, and restarts the context with new app. Must be called after any other addContextApp*
     * methods.
     */
    public DefDescriptor<ApplicationDef> addContextApp(CharSequence src) throws QuickFixException {
        String fmt = String.format("%s:%s", ns1, "testApp");
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(fmt, ApplicationDef.class);
        addSourceAutoCleanup(appDesc, src.toString());

        // restart the context with the new app
        ContextService contextService = Aura.getContextService();
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        AuraContext ctx = contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED, appDesc);
        ctx.setApplicationDescriptor(appDesc);
        Aura.getDefinitionService().updateLoaded(appDesc);
        return appDesc;
    }

    /** adds a theme with the given source to the same bundle as the context app */
    public DefDescriptor<ThemeDef> addContextAppBundleTheme(CharSequence src) {
        String fmt = String.format("%s:%s", ns1, "testApp");
        DefDescriptor<ThemeDef> themeDesc = Aura.getDefinitionService().getDefDescriptor(fmt, ThemeDef.class);
        return addSourceAutoCleanup(themeDesc, src.toString());
    }

    /** adds a style with the given source to the same bundle as the context app */
    public DefDescriptor<StyleDef> addContextAppBundleStyle(CharSequence src) {
        String fmt = String.format("%s.%s", ns1, "testApp");
        DefDescriptor<StyleDef> styleDesc = Aura.getDefinitionService().getDefDescriptor(fmt, StyleDef.class);
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
    public DefDescriptor<FlavorAssortmentDef> addFlavorAssortment(CharSequence src) {
        return addSourceAutoCleanup(FlavorAssortmentDef.class, src.toString(), getNs1() + ":" + "fa");
    }

    /** adds a flavor assortment def to the "other" namespace */
    public DefDescriptor<FlavorAssortmentDef> addFlavorAssortmentOtherNamespace(CharSequence src) {
        return addSourceAutoCleanup(FlavorAssortmentDef.class, src.toString(), getNs2() + ":" + "fa");
    }

    /** adds a flavor assortment with the given source to the same bundle as the context app */
    public DefDescriptor<FlavorAssortmentDef> addContextAppFlavorAssortment(CharSequence src) {
        String fmt = String.format("%s:%s", ns1, "testApp");
        DefDescriptor<FlavorAssortmentDef> faDesc = Aura.getDefinitionService().getDefDescriptor(fmt, FlavorAssortmentDef.class);
        return addSourceAutoCleanup(faDesc, src.toString());
    }

    /** helper for building a theme string source */
    public ThemeSrcBuilder theme() {
        return new ThemeSrcBuilder();
    }

    public static final class ThemeSrcBuilder implements CharSequence {
        private DefDescriptor<ThemeDef> parent;
        private final List<String> content = Lists.newArrayList();
        private String descriptorProvider;
        private String mapProvider;

        public ThemeSrcBuilder var(String name, String value) {
            content.add(String.format("<aura:var name='%s' value='%s'/>", name, value));
            return this;
        }

        public ThemeSrcBuilder parent(DefDescriptor<ThemeDef> parent) {
            this.parent = checkNotNull(parent, "parent cannot be null");
            return this;
        }

        public ThemeSrcBuilder descriptorProvider(String descriptorProvider) {
            this.descriptorProvider = descriptorProvider;
            return this;
        }

        public ThemeSrcBuilder mapProvider(String mapProvider) {
            this.mapProvider = mapProvider;
            return this;
        }

        public ThemeSrcBuilder imported(DefDescriptor<ThemeDef> imported) {
            content.add(String.format("<aura:importTheme name='%s'/>", imported.getDescriptorName()));
            return this;
        }

        @Override
        public String toString() {
            StringBuilder builder = new StringBuilder();

            builder.append("<aura:theme");

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

            builder.append("</aura:theme>");
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
