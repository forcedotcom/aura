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
package org.auraframework.impl.adapter.format.html;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.NamespaceDef;
import org.auraframework.def.StyleDef;
import org.auraframework.http.AuraServlet;
import org.auraframework.system.AuraContext;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.util.AuraTextUtil;

/**
 * Tests for BaseComponentDefHTMLFormatAdapter, as it relates to ApplicationDef
 * 
 * @since 0.0.224
 */
@ThreadHostileTest
public class ApplicationDefHTMLFormatAdapterTest extends BaseComponentDefHTMLFormatAdapterTest<ApplicationDef> {

    public ApplicationDefHTMLFormatAdapterTest(String name) {
        super(name);
    }

    @Override
    public Class<ApplicationDef> getDefClass() {
        return ApplicationDef.class;
    }

    /**
     * Manifest is not appended to <html> if system config is set to disable appcache (aura.noappcache = true).
     */
    public void testWriteManifestWithConfigDisabled() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        String oldConfig = System.setProperty(AuraServlet.DISABLE_APPCACHE_PROPERTY, "true");
        try {
            context.clearPreloads();
            context.addPreload("aura");
            DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                    "<aura:application useAppcache='true' render='client'></aura:application>");
            context.setApplicationDescriptor(desc);
            String body = doWrite(desc.getDef());
            int start = body.indexOf("<html ");
            String tag = body.substring(start, body.indexOf('>', start) + 1);
            if (tag.contains(" manifest=")) {
                fail("Should not have included a manifest attribute with config disabled:\n" + body);
            }
        } finally {
            if (oldConfig == null) {
                System.clearProperty(AuraServlet.DISABLE_APPCACHE_PROPERTY);
            } else {
                System.setProperty(AuraServlet.DISABLE_APPCACHE_PROPERTY, oldConfig);
            }
        }
    }

    /**
     * Manifest is not appended to <html> if current context has no preloads.
     */
    public void testWriteManifestWithoutPreloads() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.clearPreloads();
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application useAppcache='true' render='client'></aura:application>");
        context.setApplicationDescriptor(desc);
        String body = doWrite(desc.getDef());
        int start = body.indexOf("<html ");
        String tag = body.substring(start, body.indexOf('>', start) + 1);
        if (tag.contains(" manifest=")) {
            fail("Should not have included a manifest attribute without preloads in the context:\n" + body);
        }
    }

    /**
     * Manifest is not appended to <html> if useAppcache is false.
     */
    public void testWriteManifestWithUseAppCacheFalse() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.clearPreloads();
        context.addPreload("aura");
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application render='client' useAppcache='false'></aura:application>");
        context.setApplicationDescriptor(desc);
        String body = doWrite(desc.getDef());
        int start = body.indexOf("<html ");
        String tag = body.substring(start, body.indexOf('>', start) + 1);
        if (tag.contains(" manifest=")) {
            fail("Should not have included a manifest attribute without preloads in the context:\n" + body);
        }
    }

    /**
     * Manifest is not appended to <html> if useAppcache is missing (inherits false from aura:application).
     */
    public void testWriteManifestWithUseAppCacheInherited() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.clearPreloads();
        context.addPreload("aura");
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application render='client'></aura:application>");
        context.setApplicationDescriptor(desc);
        String body = doWrite(desc.getDef());
        int start = body.indexOf("<html ");
        String tag = body.substring(start, body.indexOf('>', start) + 1);
        if (tag.contains(" manifest=")) {
            fail("Should not have included a manifest attribute without preloads in the context:\n" + body);
        }
    }

    /**
     * Manifest is appended to <html> if current context has preloads.
     */
    public void testWriteManifestWithPreloads() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.clearPreloads();
        context.addPreload("aura");
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application render='client' preload='aura' useAppcache='true'></aura:application>");
        context.setApplicationDescriptor(desc);
        String body = doWrite(desc.getDef());
        int start = body.indexOf("<html ");
        String tag = body.substring(start, body.indexOf('>', start) + 1);
        String expectedSubPath = AuraTextUtil.urlencode(String.format(
                "{\"mode\":\"UTEST\",\"app\":\"%s\",\"preloads\":[\"aura\"],\"test\":\"%s\"}",
                desc.getDescriptorName(), getQualifiedName()));
        String expectedAttribute = " manifest=\"/l/" + expectedSubPath + "/app.manifest\"";
        if (!tag.contains(expectedAttribute)) {
            fail("Did not find expected manifest attribute <" + expectedAttribute + "> in:" + tag);
        }
    }

    /**
     * Verify that comments in Template CSS are stripped out before sending it to client.
     * 
     * @throws Exception
     */
    public void testCommentsInTemplateCssNotInjectedToPage() throws Exception {
        String css = "/*" + "*Multi line comment" + "*/\n" + "body{" + "background-color: #ededed;"
                + "font-size: 13px;" + "/**Inline comment*/\n" + "line-height: 1.3" + "}";
        DefDescriptor<StyleDef> styleDef = Aura.getDefinitionService().getDefDescriptor(
                "templateCss://string.thing" + System.currentTimeMillis() + "template", StyleDef.class);
        auraTestingUtil.addSourceAutoCleanup(styleDef, css);
        DefDescriptor<NamespaceDef> namespaceDesc = Aura.getDefinitionService().getDefDescriptor(
                String.format("%s://%s", DefDescriptor.MARKUP_PREFIX, styleDef.getNamespace()), NamespaceDef.class);
        auraTestingUtil.addSourceAutoCleanup(namespaceDesc, "<aura:namespace></aura:namespace>");
        String templateCss = String.format("%s://%s.%s", DefDescriptor.TEMPLATE_CSS_PREFIX, styleDef.getNamespace(),
                styleDef.getName());
        String templateMarkup = String.format(baseComponentTag, "style='" + templateCss
                + "'  isTemplate='false'  extends='aura:template' ", "");
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateMarkup);

        DefDescriptor<ApplicationDef> testApp = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application render='client' template='" + template.getQualifiedName() + "'></aura:application>");

        String body = doWrite(testApp.getDef());
        assertNotNull(body);
        assertFalse("Comments were not stripped out from template CSS", body.contains("Multi line comment"));
        assertFalse("Inline comments were not stripped our from template CSS", body.contains("Inline comment"));
        assertTrue("Expected template css not found in serialized response.",
                body.contains("<style>body{background-color:#ededed;font-size:13px;line-height:1.3}</style>"));
    }
}