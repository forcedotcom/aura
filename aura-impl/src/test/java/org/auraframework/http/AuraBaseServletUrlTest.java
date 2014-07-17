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
package org.auraframework.http;

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.AuraTextUtil;

import com.google.common.base.Joiner;
import com.google.common.collect.Lists;

/**
 * Technically this could go in the aura module instead of aura-impl, but necessary utils to make this test easier to
 * write are in aura-impl.
 */
public class AuraBaseServletUrlTest extends AuraImplTestCase {
    public AuraBaseServletUrlTest(String name) {
        super(name);
    }

    /** tests that the css url includes themes explicitly added to context */
    public void testCssUrlContextSpecifiedThemes() throws Exception {
        AuraContext ctx = setupContext();
        ctx.appendThemeDescriptor(DefDescriptorImpl.getInstance("test:fakeTheme", ThemeDef.class));
        ctx.appendThemeDescriptor(DefDescriptorImpl.getInstance("test:fakeTheme2", ThemeDef.class));
        ctx.appendThemeDescriptor(DefDescriptorImpl.getInstance("test:fakeTheme3", ThemeDef.class));
        goldFileAppCssUrl();
    }

    /**
     * tests that the css url includes themes from the app and also ones explicitly added to context. The app theme
     * should come first.
     */
    public void testCssUrlContextSpecifiedAndAppSpecifiedThemes() throws Exception {
        AuraContext ctx = setupContextWithAppReferencingThemes("test:fakeTheme3");
        ctx.appendThemeDescriptor(DefDescriptorImpl.getInstance("test:fakeTheme2", ThemeDef.class));
        goldFileAppCssUrl();
    }

    /** test that the css url includes multiple app-specified themes and in the correct order */
    public void testCssUrlWithMultipleAppThemes() throws Exception {
        setupContextWithAppReferencingThemes("test:fakeTheme2", "test:fakeTheme", "test:fakeTheme3");
        goldFileAppCssUrl();
    }

    /** test that the css url uses the concrete (provided) theme descriptors */
    public void testCssUrlWithProvidedTheme() throws Exception {
        String name = "test:fakeThemeWithDescriptorProvider";
        DefDescriptor<ThemeDef> theme = DefDescriptorImpl.getInstance(name, ThemeDef.class);
        setupContextWithAppReferencingThemes(theme.getDescriptorName());
        goldFileAppCssUrl();
    }

    /** test that the css url includes a hash when a map-provided theme is used */
    public void testSerializeWithMapProvidedTheme() throws Exception {
        String name = "test:fakeThemeWithMapProvider";
        DefDescriptor<ThemeDef> theme = DefDescriptorImpl.getInstance(name, ThemeDef.class);
        AuraContext ctx = setupContextWithAppReferencingThemes(theme.getDescriptorName());
        ctx.appendThemeDescriptor(DefDescriptorImpl.getInstance("test:fakeTheme3", ThemeDef.class));
        goldFileAppCssUrl();
    }

    private AuraContext setupContext() {
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }

        AuraContext ctx = Aura.getContextService()
                .startContext(Mode.UTEST, Format.JSON, Authentication.UNAUTHENTICATED);
        ctx.setSerializeLastMod(false);
        return ctx;
    }

    private AuraContext setupContextWithAppReferencingThemes(String... themeDescriptors) {
        List<DefDescriptor<ThemeDef>> themes = Lists.newArrayList();

        for (int i = 0; i < themeDescriptors.length; i++) {
            themes.add(DefDescriptorImpl.getInstance(themeDescriptors[i], ThemeDef.class));
        }

        String markup = "<aura:application access='unauthenticated' theme='%s'/>";
        String src = String.format(markup, Joiner.on(",").join(themes));
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class, src);

        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }

        AuraContext ctx = Aura.getContextService()
                .startContext(Mode.UTEST, Format.JSON, Authentication.UNAUTHENTICATED, app);
        ctx.setSerializeLastMod(false);
        return ctx;
    }

    private void goldFileAppCssUrl() throws Exception {
        String url = null;

        for (String style : AuraBaseServlet.getStyles()) {
            if (style.endsWith("app.css")) {
                url = style;
                break;
            }
        }

        if (url == null) {
            fail("expected to find app.css url");
        }

        // make human readable
        url = AuraTextUtil.urldecode(url);

        // replace app descriptor, which is generated
        AuraContext ctx = Aura.getContextService().getCurrentContext();
        DefDescriptor<? extends BaseComponentDef> desc = ctx.getLoadingApplicationDescriptor();
        if (desc != null) {
            url = url.replaceFirst(desc.getDescriptorName(), "#REPLACED#");
        }

        goldFileText(url);
    }
}
