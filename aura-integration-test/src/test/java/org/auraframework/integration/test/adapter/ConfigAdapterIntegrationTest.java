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

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.File;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;

import org.auraframework.Aura;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.adapter.ConfigAdapterImpl;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.impl.util.AuraLocaleImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.ServiceLoader;
import org.auraframework.util.resource.ResourceLoader;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.auraframework.util.test.util.AuraPrivateAccessor;
import org.auraframework.util.test.util.ServiceLocatorMocker;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Tests for ConfigAdapterImpl requiring Aura services to be available
 */
public class ConfigAdapterIntegrationTest extends AuraImplTestCase {

    public ConfigAdapterIntegrationTest(String name) {
        super(name);
    }

    private void validateTimezoneIds(String[] timezonesToCheck) throws Exception {
        ConfigAdapterImpl configAdapter = new ConfigAdapterImpl();
        ResourceLoader loader = Aura.getConfigAdapter().getResourceLoader();
        List<String> failures = Lists.newLinkedList();
        for (String timezone : timezonesToCheck) {
            String equivalent = configAdapter.getAvailableTimezone(timezone);
            if (loader.getResource(String.format("/aura/resources/libs_%s.js", equivalent.replace("/", "-"))) == null) {
                failures.add(equivalent);
            }
        }
        if (!failures.isEmpty()) {
            Collections.sort(failures);
            fail(String.format("The following timezone IDs failed to map to a valid resource (%s out of %s): %s",
                    failures.size(), timezonesToCheck.length, failures));
        }
    }

    public void testIcuTimezones() throws Exception {
        validateTimezoneIds(com.ibm.icu.util.TimeZone.getAvailableIDs());
    }

    public void testJavaTimezones() throws Exception {
        validateTimezoneIds(TimeZone.getAvailableIDs());
    }

    public void testGetEquivalentTimezoneSamples() throws Exception {
        ConfigAdapterImpl impl = new ConfigAdapterImpl();
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
    public void testAllWalltimeMapped() throws Exception {
        Set<String> timezones = Sets.newHashSet();
        Map<String, String> timezonesMap = AuraPrivateAccessor.<Map<String, String>>invoke(new ConfigAdapterImpl(), "readEquivalentTimezones");
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

    public void testGetResetCssUrlDefaultsToReset(){
        String expected="resetCSS.css";

        startAppContext("<aura:application></aura:application>");
        String resetCssUrl=Aura.getConfigAdapter().getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS should default to resetCSS.css. Found: "+resetCssUrl, actual);
    }

    public void testGetResetCssUrlShouldContainFwUid() throws Exception {
        String expected="#FAKEUID#";

        startAppContext("<aura:application></aura:application>");
        String resetCssUrl=Aura.getConfigAdapter().getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should contain fake fwUid for long cache headers. Found: "+resetCssUrl, actual);
    }

    public void testGetResetCssUrlShouldDefaultToResetForExtendedTemplate() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application template='"+template.getDescriptorName()+"'></aura:application>");
        String resetCssUrl=Aura.getConfigAdapter().getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should default to resetCSS.css for extended template. Found: "+resetCssUrl, actual);
    }

    public void testGetResetCssUrlShouldBeOverriddenToNormalizeByExtendedTemplate() throws Exception {
        String expected="normalize.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'><aura:set attribute='auraResetStyle' value='normalize'/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String resetCssUrl=Aura.getConfigAdapter().getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should be overridden to resetCss.css for extended template. Found: "+resetCssUrl,actual);
    }

    public void testGetResetCssUrlShouldReturnNullForExtendedTemplate() throws Exception {
        String expected=null;
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value=''/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String actual=Aura.getConfigAdapter().getResetCssURL();

        assertEquals("Reset CSS url should be null for extended template.", expected, actual);
    }

    public void testGetResetCssUrlShouldBeOverriddenToResetByExtendedTemplate() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String resetCssUrl=Aura.getConfigAdapter().getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should be overridden to normalize.css for extended template. Found: " + resetCssUrl, actual);
    }

    public void testGetResetCssUrlShouldBeSetToResetByLastExtendedTemplate() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='normalize'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String resetCssUrl=Aura.getConfigAdapter().getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should be overridden to normalize.css for last extended template. Found: " + resetCssUrl, actual);
    }

    public void testGetResetCssUrlShouldBeSetToNormalizeByLastExtendedTemplate() throws Exception {
        String expected="normalize.css";
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='normalize'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String resetCssUrl=Aura.getConfigAdapter().getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should be overridden to resetCSS.css for last extended template. Found: "+resetCssUrl,actual);
    }

    public void testGetResetCssUrlShouldReturnNullForLastExtendedTemplate() throws Exception {
        String expected=null;
        String templateSrc = "<aura:component isTemplate='true' extensible='true' extends='aura:template'><aura:set attribute='auraResetStyle' value=''/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        templateSrc = "<aura:component isTemplate='true' extensible='true' extends='"+template.getDescriptorName()+"'><aura:set attribute='auraResetStyle' value=''/></aura:component>";
        template = addSourceAutoCleanup(ComponentDef.class, templateSrc);

        startAppContext("<aura:application access='unauthenticated' template='" + template.getDescriptorName() + "'></aura:application>");
        String actual=Aura.getConfigAdapter().getResetCssURL();

        assertEquals("Reset CSS url should be null for last extended template.", expected, actual);
    }

    public void testGetResetCssUrlShouldDefaultToResetFromAncestorsTemplateForExtendedApplication() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true' template='"+template.getDescriptorName()+"'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"'></aura:application>");
        String resetCssUrl=Aura.getConfigAdapter().getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should default to normalize.css for extended application. Found: " + resetCssUrl, actual);
    }

    public void testGetResetCssUrlShouldBeSetToResetFromAncestorsTemplateForExtendedApplication() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true' template='"+template.getDescriptorName()+"'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"'></aura:application>");
        String resetCssUrl=Aura.getConfigAdapter().getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should default to resetCSS.css for extended application. Found: " + resetCssUrl, actual);
    }

    public void testGetResetCssUrlShouldBeNullFromAncestorsTemplateForExtendedApplication() throws Exception {
        String expected=null;
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'><aura:set attribute='auraResetStyle' value=''/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true' template='"+template.getDescriptorName()+"'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"'></aura:application>");
        String actual=Aura.getConfigAdapter().getResetCssURL();

        assertEquals("Reset CSS url should default to normalize.css for extended application.", expected, actual);
    }

    public void testGetResetCssUrlShouldDefaultToResetForExtendedApplication() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"' template='"+template.getDescriptorName()+"'></aura:application>");
        String resetCssUrl=Aura.getConfigAdapter().getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should default to normalize.css for extended application. Found: " + resetCssUrl, actual);
    }

    public void testGetResetCssUrlShouldBeSetToResetForExtendedApplication() throws Exception {
        String expected="resetCSS.css";
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'><aura:set attribute='auraResetStyle' value='reset'/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"' template='"+template.getDescriptorName()+"'></aura:application>");
        String resetCssUrl=Aura.getConfigAdapter().getResetCssURL();
        boolean actual=resetCssUrl.contains(expected);

        assertTrue("Reset CSS url should default to resetCSS.css for extended application. Found: " + resetCssUrl, actual);
    }

    public void testGetResetCssUrlShouldBeNullForExtendedApplication() throws Exception {
        String expected=null;
        String templateSrc = "<aura:component isTemplate='true' extends='aura:template'><aura:set attribute='auraResetStyle' value=''/></aura:component>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
        String parentAppSrc="<aura:application access='unauthenticated' extensible='true'></aura:application>";
        DefDescriptor<ApplicationDef> parentApp = addSourceAutoCleanup(ApplicationDef.class, parentAppSrc);

        startAppContext("<aura:application access='unauthenticated' extends='"+parentApp.getDescriptorName()+"' template='"+template.getDescriptorName()+"'></aura:application>");
        String actual=Aura.getConfigAdapter().getResetCssURL();

        assertEquals("Reset CSS url should default to normalize.css for extended application.", expected, actual);
    }

    private DefDescriptor<ApplicationDef> startAppContext(String markup){
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class, markup);
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }
        AuraContext ctx = Aura.getContextService().startContext(
                AuraContext.Mode.UTEST,
                AuraContext.Format.JSON,
                AuraContext.Authentication.UNAUTHENTICATED,
                app
        );
        ctx.setFrameworkUID("#FAKEUID#");
        return app;
    }

    public void testJSLibsEqualivalentTimezone() throws Exception {
        try {
            AuraLocale auraLocale = new AuraLocaleImpl(Locale.US, TimeZone.getTimeZone("US/Pacific"));
            LocalizationAdapter mockAdapter = mock(LocalizationAdapter.class);
            when(mockAdapter.getAuraLocale()).thenReturn(auraLocale);
            ServiceLoader locator = ServiceLocatorMocker.spyOnServiceLocator();
            when(locator.get(LocalizationAdapter.class)).thenReturn(mockAdapter);

            startAppContext("<aura:application></aura:application>");

            assertTrue("JS libs file should be libs_America-Los-Angeles.js",
                    Aura.getConfigAdapter().getJSLibsURL().contains("libs_America-Los_Angeles.js"));
        } finally {
            ServiceLocatorMocker.unmockServiceLocator();
        }
    }

    public void testJSLibsInvalidTimezone() throws Exception {
        try {
            AuraLocale auraLocale = new AuraLocaleImpl(Locale.US, TimeZone.getTimeZone("HammerTime"));
            LocalizationAdapter mockAdapter = mock(LocalizationAdapter.class);
            when(mockAdapter.getAuraLocale()).thenReturn(auraLocale);
            ServiceLoader locator = ServiceLocatorMocker.spyOnServiceLocator();
            when(locator.get(LocalizationAdapter.class)).thenReturn(mockAdapter);

            startAppContext("<aura:application></aura:application>");

            assertTrue("JS libs file should be the default libs_GMT.js for invalid timezones",
                    Aura.getConfigAdapter().getJSLibsURL().contains("libs_GMT.js"));
        } finally {
            ServiceLocatorMocker.unmockServiceLocator();
        }
    }
}
