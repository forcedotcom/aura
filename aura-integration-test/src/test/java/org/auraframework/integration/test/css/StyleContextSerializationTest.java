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
package org.auraframework.integration.test.css;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.adapter.StyleAdapterImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.test.client.UserAgent;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.test.annotation.UnAdaptableTest;

import com.google.common.base.Joiner;
import com.google.common.collect.Sets;

/**
 * Comprehensive functional tests for serialization of app.css urls.
 */
public class StyleContextSerializationTest extends AuraImplTestCase {
    public StyleContextSerializationTest(String name) {
        super(name);
    }

    @UnAdaptableTest("core add info about if we are on desktop, we don't")
    /** test that the css url includes the client/browser, no extra true conditions */
    public void testCssUrlWithClient() throws Exception {
        AuraContext ctx = setupContext();
        ctx.setClient(new Client(UserAgent.GOOGLE_CHROME.getUserAgentString()));
        goldFileAppCssUrl();
    }

    /** test that the css url includes the client/browser, with extra true conditions */
    public static final class TestStyleAdapter extends StyleAdapterImpl {
        @Override
        public Set<String> getExtraTrueConditions() {
            return Sets.newHashSet("desktop", "communities");
        }
    }

    // find out where to inject mock TestStyleAdapter()
//    public void testCssUrlWithClientAndExtraTrueConditions() throws Exception {
//        AuraContext ctx = setupContext();
//        ctx.setClient(new Client(UserAgent.IPAD.getUserAgentString()));
//        when(locator.get(StyleAdapter.class)).thenReturn(new TestStyleAdapter());
//        goldFileAppCssUrl();
//    }

    @UnAdaptableTest("core add info about if we are on desktop, we don't")
    /** test that the css url includes multiple app-specified tokens and in the correct order */
    public void testCssUrlWithMultipleAppTokensDefs() throws Exception {
        setupContext("test:fakeTokens2", "test:fakeTokens", "test:fakeTokens3");
        goldFileAppCssUrl();
    }

    @UnAdaptableTest("core add info about if we are on desktop, we don't")
    /** test that the css url uses the concrete (provided) tokens descriptors */
    public void testCssUrlWithProvidedTokens() throws Exception {
        String name = "test:fakeTokensWithDescriptorProvider";
        DefDescriptor<TokensDef> desc = DefDescriptorImpl.getInstance(name, TokensDef.class);
        setupContext(desc.getDescriptorName());
        goldFileAppCssUrl();
    }

    @UnAdaptableTest("core add info about if we are on desktop, we don't")
    /** test that the css url includes a hash when a map-provided tokens is used */
    public void testSerializeWithMapProvidedTokens() throws Exception {
        setupContext("test:fakeTokensWithMapProvider", "test:fakeTokens3");
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

    private AuraContext setupContext(String... descriptors) {
        List<DefDescriptor<TokensDef>> tokens = new ArrayList<>();

        for (int i = 0; i < descriptors.length; i++) {
            tokens.add(DefDescriptorImpl.getInstance(descriptors[i], TokensDef.class));
        }

        String markup = "<aura:application access='unauthenticated' tokenOverrides='%s'/>";
        String src = String.format(markup, Joiner.on(",").join(tokens));
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class, src);
        return setupContext(app);
    }

    private void goldFileAppCssUrl() throws Exception {
        AuraContext ctx = Aura.getContextService().getCurrentContext();
        String url = null;

        for (String style : Aura.getServletUtilAdapter().getStyles(ctx)) {
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
        DefDescriptor<? extends BaseComponentDef> desc = ctx.getLoadingApplicationDescriptor();
        if (desc != null) {
            url = url.replaceFirst(desc.getDescriptorName(), "#REPLACED#");
        }

        goldFileText(url);
    }
}
