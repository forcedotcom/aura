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
package org.auraframework.integration.test.adapter.format.html;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.adapter.format.html.BaseComponentDefHTMLFormatAdapterTest;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.test.adapter.MockConfigAdapter;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Test;

import javax.inject.Inject;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Tests for BaseComponentDefHTMLFormatAdapter, as it relates to ApplicationDef
 *
 * @since 0.0.224
 */
public class ApplicationDefHTMLFormatAdapterTest extends BaseComponentDefHTMLFormatAdapterTest<ApplicationDef> {
    @Inject
    MockConfigAdapter mockConfigAdapter;

    @Inject
    DefinitionService definitionService;

    @Override
    public Class<ApplicationDef> getDefClass() {
        return ApplicationDef.class;
    }

    /**
     * Manifest is not appended to <html> if system config is set to disable appcache (aura.noappcache = true).
     */
    @ThreadHostileTest("disables AppCache")
    @Test
    public void testWriteManifestWithConfigDisabled() throws Exception {
        AuraContext context = contextService.getCurrentContext();
        mockConfigAdapter.setIsClientAppcacheEnabled(false);
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application useAppcache='true' render='client'></aura:application>");
        context.setApplicationDescriptor(desc);
        context.addLoaded(desc, definitionService.getUid(null, desc));
        String body = doWrite(definitionService.getDefinition(desc));
        int start = body.indexOf("<html");
        String tag = body.substring(start, body.indexOf('>', start) + 1);
        if (tag.contains("manifest=")) {
            fail("Should not have included a manifest attribute with config disabled:\n" + body);
        }
    }

    /**
     * Manifest is not appended to <html> if useAppcache is false.
     */
    @Test
    public void testWriteManifestWithUseAppCacheFalse() throws Exception {
        AuraContext context = contextService.getCurrentContext();
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application render='client' useAppcache='false'></aura:application>");
        context.setApplicationDescriptor(desc);
        context.addLoaded(desc, definitionService.getUid(null, desc));
        String body = doWrite(definitionService.getDefinition(desc));
        int start = body.indexOf("<html");
        String tag = body.substring(start, body.indexOf('>', start) + 1);
        if (tag.contains(" manifest=")) {
            fail("Should not have included a manifest attribute useAppCache = false:\n" + body);
        }
    }

    /**
     * Manifest is not appended to <html> if useAppcache is missing (inherits false from aura:application).
     */
    @Test
    public void testWriteManifestWithUseAppCacheInherited() throws Exception {
        AuraContext context = contextService.getCurrentContext();
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application render='client'></aura:application>");
        context.setApplicationDescriptor(desc);
        context.addLoaded(desc, definitionService.getUid(null, desc));
        String body = doWrite(definitionService.getDefinition(desc));
        int start = body.indexOf("<html");
        String tag = body.substring(start, body.indexOf('>', start) + 1);
        if (tag.contains(" manifest=")) {
            fail("Should not have included a manifest attribute with inherited useAppCache = false:\n" + body);
        }
    }

    /**
     * Manifest is appended to <html> if current app has useAppCache.
     */
    @Test
    public void testWriteManifest() throws Exception {
        AuraContext context = contextService.getCurrentContext();
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application render='client' useAppcache='true'></aura:application>");
        context.setApplicationDescriptor(desc);
        final String uid = definitionService.getUid(null, desc);
        context.addLoaded(desc, uid);
        String body = doWrite(definitionService.getDefinition(desc));
        int start = body.indexOf("<html");
        String tag = body.substring(start, body.indexOf('>', start) + 1);
        String cacheBuster = configAdapter.getLockerServiceCacheBuster();
        String lockerServiceEnabled = cacheBuster != null ? ",\"ls\":\"" + cacheBuster + "\"" : "";
        String expectedSubPath = AuraTextUtil.urlencode(String.format(
                "{\"mode\":\"UTEST\",\"app\":\"%s\",\"pathPrefix\":\"\",\"test\":\"org.auraframework.integration.test.adapter.format.html.ApplicationDefHTMLFormatAdapterTest.testWriteManifest\"%s}",
                desc.getDescriptorName(), lockerServiceEnabled));
        String expectedAttribute = " manifest=\"/l/" + expectedSubPath + "/app.manifest";
        if (!tag.contains(expectedAttribute)) {
            fail("Did not find expected manifest attribute <" + expectedAttribute + "> in:" + tag);
        }
    }

    /**
     * Context path should be prepended to urls
     */
    @Test
    public void testUrlContextPath() throws Exception {
        AuraContext context = contextService.getCurrentContext();
        String coolContext = "/cool";
        context.setContextPath(coolContext);
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application render='client' useAppcache='true'></aura:application>");
        context.setApplicationDescriptor(desc);
        final String uid = definitionService.getUid(null, desc);
        context.addLoaded(desc, uid);
        String body = doWrite(definitionService.getDefinition(desc));
        Pattern pattern = Pattern.compile("/auraFW|/l/");
        Matcher matcher = pattern.matcher(body);
        while(matcher.find()) {
            int start =  matcher.start();
            String cool = body.substring(start - 5, start);
            if (!cool.equals(coolContext)) {
                fail("Context path was not prepended to Aura urls");
            }
        }
    }

    /**
     * Verify that comments in Template CSS are stripped out before sending it to client.
     *
     * @throws Exception
     */
    @ThreadHostileTest("NamespaceDef modification affects namespace")
    @Test
    public void testCommentsInTemplateCssNotInjectedToPage() throws Exception {
        String css = "/*" + "*Multi line comment" + "*/\n" + "body{" + "background-color: #ededed;"
                + "font-size: 13px;" + "/**Inline comment*/\n" + "line-height: 1.3" + "}";
        DefDescriptor<StyleDef> styleDef = definitionService.getDefDescriptor(
                "templateCss://string.thing" + System.currentTimeMillis() + "template", StyleDef.class);
        addSourceAutoCleanup(styleDef, css);
        String templateCss = String.format("%s://%s.%s", DefDescriptor.TEMPLATE_CSS_PREFIX, styleDef.getNamespace(),
                styleDef.getName());
        String templateMarkup = String.format(baseComponentTag, "style='" + templateCss
                + "'  isTemplate='true'  extends='aura:template' ", "");
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateMarkup);

        DefDescriptor<ApplicationDef> testApp = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application render='client' template='" + template.getQualifiedName() + "'></aura:application>");

        String body = doWrite(definitionService.getDefinition(testApp));
        assertNotNull(body);
        assertFalse("Comments were not stripped out from template CSS", body.contains("Multi line comment"));
        assertFalse("Inline comments were not stripped our from template CSS", body.contains("Inline comment"));
        assertTrue("Expected template css not found in serialized response.",
                body.contains("body {background-color:#ededed; font-size:13px; line-height:1.3}</style>"));
    }
}
