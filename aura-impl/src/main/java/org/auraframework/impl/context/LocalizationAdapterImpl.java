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
package org.auraframework.impl.context;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

import javax.inject.Inject;

import org.apache.log4j.Logger;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.impl.util.AuraLocaleImpl;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.test.TestableLocalizationAdapter;
import org.auraframework.util.AuraLocale;
import org.springframework.context.annotation.Lazy;

@Lazy
@ServiceComponent
public class LocalizationAdapterImpl implements LocalizationAdapter, TestableLocalizationAdapter {
    Logger logger = Logger.getLogger(LocalizationAdapterImpl.class);

    @Inject
    private ContextService contextService;

    private List<Locale> requestedLocales;

    /**
     * Temporary workaround for localized labels
     */
    private static Map<String, Map<String, String>> labels = new HashMap<>();

    private final static Map<String, String> testLabels = new HashMap<>();

    // THIS SHOULD DIE.
    static {
        Map<String, String> todayLabels = new HashMap<>();
        todayLabels.put("ar", "اليوم");
        todayLabels.put("cs", "Dnes");
        todayLabels.put("de", "Heute");
        todayLabels.put("en", "Today");
        todayLabels.put("en_US", "Today");
        todayLabels.put("es", "Hoy");
        todayLabels.put("fr", "aujourd'hui");
        todayLabels.put("ja", "今日");
        todayLabels.put("ko", "오늘");
        todayLabels.put("zh_CN", "今天");
        todayLabels.put("zh_TW", "今天");
        labels.put("task_mode_today", todayLabels);

        todayLabels = new HashMap<>();
        todayLabels.put("ar", "اليوم + المتأخرة");
        todayLabels.put("cs", "Dnes + splatnosti");
        todayLabels.put("de", "Heute + Überfällig");
        todayLabels.put("en", "Today + Overdue");
        todayLabels.put("en_US", "Today + Overdue");
        todayLabels.put("es", "Hoy + Atrasado");
        todayLabels.put("fr", "aujourd'hui1 + retard");
        todayLabels.put("ja", "今日+延滞");
        todayLabels.put("ko", "오늘 + 연체");
        todayLabels.put("zh_CN", "今天+逾期");
        todayLabels.put("zh_TW", "今天+逾期");
        labels.put("task_mode_today_overdue", todayLabels);

        Map<String, String> tomorrowLabels = new HashMap<>();
        tomorrowLabels.put("en_US", "Tomorrow");
        labels.put("task_mode_tomorrow", tomorrowLabels);
    }

    @Override
    public String getLabel(String section, String name, Object... params) {
        Map<String, String> label = labels.get(name);
        if (label == null) {
            if(testLabels.containsKey(getLabelKey(section, name))) {
                return testLabels.get(getLabelKey(section, name));
            }
            return null;
        }
        return label.get(this.getAuraLocale().getLanguageLocale().toString());
    }

    @Override
    public boolean labelExists(String section, String name) {
        return true;
    }

    /**
     * Creates a AuraLocale using the first Locale specified in the Http Request
     * based on the Accept-Language header values when available, otherwise the
     * default is used.
     */
    @Override
    public AuraLocale getAuraLocale() {
        //
        // use requested locales from context
        // check for nulls - this happens when AuraContextFilter has not been
        // run
        AuraContext context = contextService.getCurrentContext();
        if (context != null) {
            List<Locale> locales = context.getRequestedLocales();
            if (locales != null && locales.size() > 0) {
                return new AuraLocaleImpl(locales.get(0));
            }
        }

        // use any explicitly set requested locales if available
        if (requestedLocales != null && !requestedLocales.isEmpty()) {
            return new AuraLocaleImpl(requestedLocales.get(0));
        }

        // none available create a default locale
        return new AuraLocaleImpl();
    }

    @Override
    public AuraLocale getAuraLocale(Locale defaultLocale) {
        return new AuraLocaleImpl(defaultLocale);
    }

    @Override
    public AuraLocale getAuraLocale(Locale defaultLocale, TimeZone timeZone) {
        return new AuraLocaleImpl(defaultLocale, timeZone);
    }

    @Override
    public AuraLocale getAuraLocale(Locale defaultLocale, Locale currencyLocale, Locale dateLocale,
            Locale languageLocale, Locale numberLocale, Locale systemLocale, TimeZone timeZone) {
        return new AuraLocaleImpl(defaultLocale, currencyLocale, dateLocale, languageLocale, numberLocale,
                systemLocale, timeZone);
    }

    @Override
    public void setRequestedLocales(List<Locale> requestedLocales) {
        this.requestedLocales = requestedLocales;
    }

   @Override
    public void setTestLabel(String section, String name, String value) {
        testLabels.put(getLabelKey(section, name), value);
    }

    @Override
    public String getTestLabel(String section, String name) {
        return testLabels.get(getLabelKey(section, name));
    }

    @Override
    public String removeTestLabel(String section, String name) {
        return testLabels.remove(getLabelKey(section, name));
    }

    private String getLabelKey(String section, String name) {
        return section + "." + name;
    }

}
