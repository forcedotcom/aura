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
package org.auraframework.integration.test.adapter;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.inject.Inject;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.adapter.ConfigAdapterImpl;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.system.AuraContext;
import org.auraframework.util.IOUtil;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.auraframework.util.test.util.AuraPrivateAccessor;
import org.junit.Test;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Tests for ConfigAdapterImpl requiring Aura services to be available
 */
public class ConfigAdapterIntegrationTest extends AuraImplTestCase {
    @Inject
    LocalizationAdapter localizationAdapter;


    @Test
    public void testGetEquivalentTimezoneSamples() throws Exception {
        ConfigAdapterImpl impl = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), localizationAdapter, instanceService, contextService, fileMonitor);
        String tz = impl.getAvailableTimezone("US/Pacific");
        assertEquals("US/Pacific should return America/Los_Angeles as available equivalent",
                "America/Los_Angeles", tz);
        tz = impl.getAvailableTimezone("Zulu");
        assertEquals("Zulu should return Etc/UTC as available equivalent",
                "Etc/UTC", tz);
        tz = impl.getAvailableTimezone("US/Central");
        assertEquals("US/Central should return America/Chicago as available equivalent",
                "America/Chicago", tz);
        tz = impl.getAvailableTimezone("Canada/Newfoundland");
        assertEquals("Canada/Newfoundland should return America/St_Johns as available equivalent",
                "America/St_Johns", tz);
        tz = impl.getAvailableTimezone("Cuba");
        assertEquals("Cuba should return America/Havana as available equivalent",
                "America/Havana", tz);
        tz = impl.getAvailableTimezone("America/Los_Angeles");
        assertEquals("America/Los_Angeles should be the same",
                "America/Los_Angeles", tz);
        tz = impl.getAvailableTimezone("GMT");
        assertEquals("GMT should be the same",
                "GMT", tz);
        tz = impl.getAvailableTimezone("Unknown");
        assertEquals("Default GMT timezone should be return if no matches",
                "GMT", tz);
        tz = impl.getAvailableTimezone("America/Unknown");
        assertEquals("Default GMT timezone should be return if no matches",
                "GMT", tz);
    }

    @UnAdaptableTest("filesystem access")
    @Test
    public void testAllWalltimeMapped() throws Exception {
        Set<String> timezones = Sets.newHashSet();
        Map<String, String> timezonesMap = AuraPrivateAccessor.<Map<String, String>>invoke(new ConfigAdapterImpl(IOUtil.newTempDir(getName()), localizationAdapter, instanceService, contextService, fileMonitor), "readEquivalentTimezones");
        for (String equivalent : timezonesMap.values()) {
            timezones.add(equivalent.replace("/", "-"));
        }
        File resDir = new File(AuraImplFiles.AuraResourcesClassDirectory.getPath());
        List<String> unmappedTimezones = Lists.newLinkedList();
        for (File file : resDir.listFiles()) {
            String filename = file.getName();
            if (filename.startsWith("libs_") && filename.endsWith(".min.js")) {
                String tz = filename.substring(5, filename.length() - 7);
                if (!timezones.contains(tz)) {
                    unmappedTimezones.add(filename);
                }
            }
        }
        if (!unmappedTimezones.isEmpty()) {
            fail("The following resource files are not mapped as equivalent timezones: " + unmappedTimezones);
        }
    }

    @Test
    public void testGetResetCssUrlDefaultsToReset(){
        String expected="resetCSS.css";

        startAppContext("<aura:application></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS should default to resetCSS.css. Found: "+resetCssUrl, actual);
    }

    @Test
    public void testGetResetCssUrlShouldContainFwUid() throws Exception {
        String expected="#FAKEUID#";

        startAppContext("<aura:application></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should contain fake fwUid for long cache headers. Found: "+resetCssUrl, actual);
    }

    @Test
    public void testGetResetCssUrlShouldDefaultToResetForExtendedTemplate() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application template='"+template.getDescriptorName()+"'></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should default to resetCSS.css for extended template. Found: "+resetCssUrl, actual);
    }

    @Test
    public void testGetResetCssUrlShouldBeOverriddenToNormalizeByExtendedTemplate() throws Exception {
        String expected="normalize.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'><aura:set attribute='auraResetStyle' value='normalize'/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should be overridden to resetCss.css for extended template. Found: "+resetCssUrl,actual);
    }

    @Test
    public void testGetResetCssUrlShouldReturnNullForExtendedTemplate() throws Exception {
        String expected=null;
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value=''/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String actual = configAdapter.getResetCssURL();

        assertEquals("Reset CSS url should be null for extended template.", expected, actual);
    }

    @Test
    public void testGetResetCssUrlShouldBeOverriddenToResetByExtendedTemplate() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should be overridden to normalize.css for extended template. Found: " + resetCssUrl, actual);
    }

    @Test
    public void testGetResetCssUrlShouldBeSetToResetByLastExtendedTemplate() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='normalize'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should be overridden to normalize.css for last extended template. Found: " + resetCssUrl, actual);
    }

    @Test
    public void testGetResetCssUrlShouldBeSetToNormalizeByLastExtendedTemplate() throws Exception {
        String expected="normalize.css";
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='normalize'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should be overridden to resetCSS.css for last extended template. Found: "+resetCssUrl,actual);
    }

    @Test
    public void testGetResetCssUrlShouldReturnNullForLastExtendedTemplate() throws Exception {
        String expected=null;
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'><aura:set attribute='auraResetStyle' value=''/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value=''/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String actual = configAdapter.getResetCssURL();

        assertEquals("Reset CSS url should be null for last extended template.", expected, actual);
    }

    @Test
    public void testGetResetCssUrlShouldRemainResetForLastExtendedTemplate() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'><aura:set attribute='auraResetStyle' value='normalize'/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should remain resetCSS.css for last extended template. Found: " + resetCssUrl, actual);
    }


    @Test
    public void testGetResetCssUrlShouldRemainNormalizeForLastExtendedTemplate() throws Exception {
        String expected="normalize.css";
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'><aura:set attribute='auraResetStyle' value='normalize'/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should remain normalize.css for last extended template. Found: " + resetCssUrl, actual);
    }


    @Test
    public void testGetResetCssUrlShouldRemainNullForLastExtendedTemplate() throws Exception {
        String expected=null;
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'><aura:set attribute='auraResetStyle' value=''/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String actual = configAdapter.getResetCssURL();

        assertEquals("Reset CSS url should remain null for last extended template.", expected, actual);
    }

    @Test
    public void testGetResetCssUrlShouldDefaultToResetFromAncestorsTemplateForExtendedApplication() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true' template='"+template.getDescriptorName()+"'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"'></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should default to normalize.css for extended application. Found: " + resetCssUrl, actual);
    }

    @Test
    public void testGetResetCssUrlShouldBeSetToResetFromAncestorsTemplateForExtendedApplication() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true' template='"+template.getDescriptorName()+"'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"'></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should default to resetCSS.css for extended application. Found: " + resetCssUrl, actual);
    }

    @Test
    public void testGetResetCssUrlShouldBeNullFromAncestorsTemplateForExtendedApplication() throws Exception {
        String expected=null;
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'><aura:set attribute='auraResetStyle' value=''/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true' template='"+template.getDescriptorName()+"'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"'></aura:application>");
        String actual = configAdapter.getResetCssURL();

        assertEquals("Reset CSS url should default to normalize.css for extended application.", expected, actual);
    }

    @Test
    public void testGetResetCssUrlShouldDefaultToResetForExtendedApplication() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"' template='"+template.getDescriptorName()+"'></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should default to normalize.css for extended application. Found: " + resetCssUrl, actual);
    }

    @Test
    public void testGetResetCssUrlShouldBeSetToResetForExtendedApplication() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"' template='"+template.getDescriptorName()+"'></aura:application>");
        String resetCssUrl = configAdapter.getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should default to resetCSS.css for extended application. Found: " + resetCssUrl, actual);
    }

    @Test
    public void testGetResetCssUrlShouldBeNullForExtendedApplication() throws Exception {
        String expected=null;
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'><aura:set attribute='auraResetStyle' value=''/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"' template='"+template.getDescriptorName()+"'></aura:application>");
        String actual = configAdapter.getResetCssURL();

        assertEquals("Reset CSS url should default to normalize.css for extended application.", expected, actual);
    }

    private DefDescriptor<ApplicationDef> startAppContext(String markup){
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class, markup);
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        AuraContext ctx = contextService.startContext(
                AuraContext.Mode.UTEST,
                AuraContext.Format.JSON,
                AuraContext.Authentication.UNAUTHENTICATED,
                app
        );
        ctx.setFrameworkUID("#FAKEUID#");
        return app;
    }
}
