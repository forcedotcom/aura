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
package org.auraframework.impl.css.style;

import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.NamespaceDef;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.UnAdaptableTest;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;

/**
 * Tests for StyleDefImpl.
 * 
 * @since 0.0.240
 */
public class StyleDefImplTest extends AuraImplTestCase {
    public StyleDefImplTest(String name) {
        super(name);
    }

    private void assertUrls(Set<String> expected, Set<String> actual) throws Exception {
        StringBuilder errorMsg = new StringBuilder();
        if (!actual.containsAll(expected)) {
            Set<String> missing = Sets.newHashSet(expected);
            missing.removeAll(actual);
            errorMsg.append("Missing urls in style: ").append(missing).append('\n');
        }
        if (!expected.containsAll(actual)) {
            Set<String> extras = Sets.newHashSet(actual);
            extras.removeAll(expected);
            errorMsg.append("Unexpected urls in style: ").append(extras).append('\n');
        }
        if (errorMsg.length() > 0) {
            fail(errorMsg.toString());
        }
    }

    /**
     * StyleDef without urls.
     */
    // TODO: wait for W-1618450 to be resolved
    public void _testCssWithoutUrls() throws Exception {
        DefDescriptor<StyleDef> descriptor = DefDescriptorImpl.getInstance("appCache.testApp", StyleDef.class);
        StyleDef style = descriptor.getDef();
        assertTrue("Unexpected urls found for style", style.getImageURLs().isEmpty());
        assertTrue("Unexpected valid urls found for style", style.getValidImageURLs().isEmpty());
    }

    /**
     * StyleDef without valid urls. Valid urls are relative and are accessible by HEAD request.
     */
    @UnAdaptableTest
    // Errors for invalid URLs differ, so the unit test result varies from
    // standalone
    // TODO: wait for W-1618450 to be resolved
    public void _testCssWithoutValidUrls() throws Exception {
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED);
        DefDescriptor<StyleDef> descriptor = DefDescriptorImpl.getInstance("appCache.unsupportedUrls", StyleDef.class);
        StyleDef style = descriptor.getDef();
        assertUrls(ImmutableSet.of("/auraFW/resources/qa/images/imaginary.png", "http://www.facebook.com/ipo.jpg",
                "http://dummy.salesforce.com/invalidhost", "//dummy.salesforce.com/noprotocol", "http:///nohost",
                "/auraFW/resources/qa/images/auralogo.png?unrooted"), style.getImageURLs());
        assertTrue("Unexpected valid urls found for style", style.getValidImageURLs().isEmpty());
    }

    /**
     * StyleDef with valid urls. Valid urls are relative and are accessible by HEAD request.
     */
    // Cannot run this as a unit test since validating urls involves making a
    // http connection. See
    // AppCacheManifestHttpTest for a test that validates that only the valid
    // URLs are cached.
    // TODO: wait for W-1618450 to be resolved
    public void _testCssWithValidUrls() throws Exception {
        DefDescriptor<StyleDef> descriptor = DefDescriptorImpl.getInstance("appCache.nopreload", StyleDef.class);
        StyleDef style = descriptor.getDef();
        assertUrls(ImmutableSet.of("/auraFW/resources/qa/images/s.gif", "/auraFW/resources/qa/images/auralogo.png",
                " /auraFW/resources/qa/images/auralogo.png?wsstart",
                "/auraFW/resources/qa/images/auralogo.png?wsend   ", "/auraFW/resources/qa/images/auralogo.png?wsboth",
                "'/auraFW/resources/qa/images/auralogo.png?singlequotes'",
                "\"/auraFW/resources/qa/images/auralogo.png?doublequotes\"", "/auraFW/resources/aura/bootstrap.css"),
                style.getValidImageURLs());
        assertUrls(ImmutableSet.of("/auraFW/resources/qa/images/imaginary.png", "http://www.facebook.com/ipo.jpg",
                "http://dummy.salesforce.com/invalidhost", "//dummy.salesforce.com/noprotocol", "http:///nohost",
                "qa/images/auralogo.png?unrooted", "/auraFW/resources/qa/images/s.gif",
                "/auraFW/resources/qa/images/auralogo.png)", " /auraFW/resources/qa/images/auralogo.png?wsstart",
                "/auraFW/resources/qa/images/auralogo.png?wsend   ", "/auraFW/resources/qa/images/auralogo.png?wsboth",
                "'/auraFW/resources/qa/images/auralogo.png?singlequotes'",
                "\"/auraFW/resources/qa/images/auralogo.png?doublequotes\"",
                "/auraFW/resources/qa/images/auralogo.png?myvar", "/auraFW/resources/qa/images/auralogo.png?myurl",
                "/auraFW/resources/aura/bootstrap.css"), style.getImageURLs());
    }

    /**
     * StyleDef must have a dependency on a NamespaceDef.
     */
    public void testAppendDependenciesHasNamespaceDef() throws Exception {
        String name = String.format("%s.someStyle", auraTestingUtil.getNonce(getName()));
        DefDescriptor<StyleDef> styleDesc = Aura.getDefinitionService().getDefDescriptor(name, StyleDef.class);
        auraTestingUtil.addSourceAutoCleanup(styleDesc, ".THIS {}");

        DefDescriptor<NamespaceDef> namespaceDesc = Aura.getDefinitionService().getDefDescriptor(
                String.format("%s://%s", DefDescriptor.MARKUP_PREFIX, styleDesc.getNamespace()), NamespaceDef.class);
        auraTestingUtil.addSourceAutoCleanup(namespaceDesc, "<aura:namespace></aura:namespace>");

        // need to restart context because old context will not have the new
        // namespace registered
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED);

        StyleDef styleDef = styleDesc.getDef();
        Set<DefDescriptor<?>> deps = Sets.newHashSet();
        styleDef.appendDependencies(deps);

        DefDescriptor<NamespaceDef> nsDesc = Aura.getDefinitionService().getDefDescriptor(styleDesc.getNamespace(),
                NamespaceDef.class);
        assertTrue("NamespaceDef missing from StyleDef dependencies", deps.contains(nsDesc));
    }
}
