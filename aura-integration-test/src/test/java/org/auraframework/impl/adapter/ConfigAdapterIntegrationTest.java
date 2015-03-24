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
package org.auraframework.impl.adapter;

import java.io.File;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TimeZone;

import org.auraframework.Aura;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.impl.util.AuraLocaleImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.test.ServiceLocatorMocker;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.ServiceLoader;
import org.auraframework.util.resource.ResourceLoader;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
        for (String equivalent : new ConfigAdapterImpl().readEquivalentTimezones().values()) {
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

    public void testNormalizeCssUrl() throws Exception {
        getAppWithNestedTemplates(true);
        String url = Aura.getConfigAdapter().getResetCssURL();
        assertTrue("Reset CSS should be normalize.css when normalizeCss attribute set",
                url.contains("normalize.css"));
        assertTrue("Should contain fake fwUid for long cache headers",
                url.contains("#FAKEUID#"));
    }

    public void testResetCssUrl() throws Exception {
        getAppWithNestedTemplates();
        assertTrue("Reset CSS should be default resetCSS.css",
                Aura.getConfigAdapter().getResetCssURL().contains("resetCSS.css"));
    }

    public void testResetCssNestedTemplate() throws Exception {
        getAppWithNestedTemplates(true, false);
        assertTrue("Reset CSS should be resetCSS.css for nested template with normalizeCss false",
                Aura.getConfigAdapter().getResetCssURL().contains("resetCSS.css"));
    }

    public void testNormalizeCssNestedTemplate() throws Exception {
        getAppWithNestedTemplates(false, true);
        assertTrue("Reset CSS should be normalize.css for nested template with normalizeCss true",
                Aura.getConfigAdapter().getResetCssURL().contains("normalize.css"));
    }

    public void testNormalizeCssNestedTemplateWithSuper() throws Exception {
        getAppWithNestedTemplates(true, true);
        assertTrue("Reset CSS should be normalize.css for nested template with normalizeCss true",
                Aura.getConfigAdapter().getResetCssURL().contains("normalize.css"));
    }

    public void testResetCssThirdNestedTemplate() throws Exception {
        getAppWithNestedTemplates(true, true, false);
        assertTrue("Reset CSS should be resetCSS.css for third nested template with normalizeCss false",
                Aura.getConfigAdapter().getResetCssURL().contains("resetCSS.css"));
    }

    public void testNormalizeCssThirdNestedTemplate() throws Exception {
        getAppWithNestedTemplates(true, false, true);
        assertTrue("Reset CSS should be normalize.css for third nested template with normalizeCss true",
                Aura.getConfigAdapter().getResetCssURL().contains("normalize.css"));
    }

    /**
     * Last boolean value is actual used by active template of app
     *
     * @param normalizes normalizeCss boolean varargs
     * @return
     */
    private DefDescriptor<ApplicationDef> getAppWithNestedTemplates(boolean... normalizes) {
        String templateMarkup = "<aura:component isTemplate='true' extensible='true' extends='%s'><aura:set attribute='normalizeCss' value='%s'/></aura:component>";
        String extendsTemplate = "aura:template";
        if (normalizes.length == 0) {
            normalizes = new boolean[]{ false };
        }
        DefDescriptor<ComponentDef> template = null;
        for (boolean normalize : normalizes) {
            String nString = normalize ? "true" : "false";
            String templateSrc = String.format(templateMarkup, extendsTemplate, nString);
            template = addSourceAutoCleanup(ComponentDef.class, templateSrc);
            extendsTemplate = template.getDescriptorName();
        }

        String markup = "<aura:application access='unauthenticated' template='%s:%s'></aura:application>";
        String appSrc = String.format(markup, template.getNamespace(), template.getName());
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class, appSrc);
        setupContext(app);
        return app;
    }

    public void testJSLibsEqualivalentTimezone() throws Exception {
        try {
            AuraLocale auraLocale = new AuraLocaleImpl(Locale.US, TimeZone.getTimeZone("US/Pacific"));

            LocalizationAdapter mockAdapter = mock(LocalizationAdapter.class);
            when(mockAdapter.getAuraLocale()).thenReturn(auraLocale);

            ServiceLoader locator = ServiceLocatorMocker.spyOnServiceLocator();
            when(locator.get(LocalizationAdapter.class)).thenReturn(mockAdapter);

            String markup = "<aura:application></aura:application>";
            DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class, markup);
            setupContext(app);
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

            String markup = "<aura:application></aura:application>";
            DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class, markup);
            setupContext(app);
            assertTrue("JS libs file should be the default libs_GMT.js for invalid timezones",
                    Aura.getConfigAdapter().getJSLibsURL().contains("libs_GMT.js"));
        } finally {
            ServiceLocatorMocker.unmockServiceLocator();
        }
    }

    private AuraContext setupContext(DefDescriptor<ApplicationDef> app) {
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }

        AuraContext ctx;
        ctx = Aura.getContextService().startContext(AuraContext.Mode.UTEST, AuraContext.Format.JSON,
                AuraContext.Authentication.UNAUTHENTICATED, app);
        ctx.setFrameworkUID("#FAKEUID#");
        return ctx;
    }
}
