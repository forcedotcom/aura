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
package org.auraframework.integration.test.http;

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.http.AuraBaseServlet;
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

    /** tests that the css url includes tokens explicitly added to context */
    public void testCssUrlContextSpecifiedTokens() throws Exception {
        AuraContext ctx = setupContext(null);
        ctx.appendTokensDescriptor(DefDescriptorImpl.getInstance("test:fakeTokens", TokensDef.class));
        ctx.appendTokensDescriptor(DefDescriptorImpl.getInstance("test:fakeTokens2", TokensDef.class));
        ctx.appendTokensDescriptor(DefDescriptorImpl.getInstance("test:fakeTokens3", TokensDef.class));
        goldFileAppCssUrl();
    }

    /**
     * tests that the css url includes tokens from the app and also ones explicitly added to context. The app tokens
     * should come first.
     */
    public void testCssUrlContextSpecifiedAndAppSpecifiedTokens() throws Exception {
        AuraContext ctx = setupContextWithAppOverrides("test:fakeTokens3");
        ctx.appendTokensDescriptor(DefDescriptorImpl.getInstance("test:fakeTokens2", TokensDef.class));
        goldFileAppCssUrl();
    }

    /** test that the css url includes multiple app-specified tokens and in the correct order */
    public void testCssUrlWithMultipleAppTokensDefs() throws Exception {
        setupContextWithAppOverrides("test:fakeTokens2", "test:fakeTokens", "test:fakeTokens3");
        goldFileAppCssUrl();
    }

    /** test that the css url uses the concrete (provided) tokens descriptors */
    public void testCssUrlWithProvidedTokens() throws Exception {
        String name = "test:fakeTokensWithDescriptorProvider";
        DefDescriptor<TokensDef> desc = DefDescriptorImpl.getInstance(name, TokensDef.class);
        setupContextWithAppOverrides(desc.getDescriptorName());
        goldFileAppCssUrl();
    }

    /** test that the css url includes a hash when a map-provided tokens is used */
    public void testSerializeWithMapProvidedTokens() throws Exception {
        String name = "test:fakeTokensWithMapProvider";
        DefDescriptor<TokensDef> desc = DefDescriptorImpl.getInstance(name, TokensDef.class);
        AuraContext ctx = setupContextWithAppOverrides(desc.getDescriptorName());
        ctx.appendTokensDescriptor(DefDescriptorImpl.getInstance("test:fakeTokens3", TokensDef.class));
        goldFileAppCssUrl();
    }

    private AuraContext setupContext(DefDescriptor<ApplicationDef> defdesc) {
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }

        AuraContext ctx;
        ctx = Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.UNAUTHENTICATED, defdesc);
        ctx.setFrameworkUID("#FAKEUID#");
        return ctx;
    }

    private AuraContext setupContextWithAppOverrides(String... descriptors) {
        List<DefDescriptor<TokensDef>> tokens = Lists.newArrayList();

        for (int i = 0; i < descriptors.length; i++) {
            tokens.add(DefDescriptorImpl.getInstance(descriptors[i], TokensDef.class));
        }

        String markup = "<aura:application access='unauthenticated' tokens='%s'/>";
        String src = String.format(markup, Joiner.on(",").join(tokens));
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class, src);
        return setupContext(app);
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
