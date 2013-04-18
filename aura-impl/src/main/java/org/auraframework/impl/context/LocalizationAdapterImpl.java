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

import java.util.*;

import org.auraframework.Aura;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.impl.util.AuraLocaleImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.util.AuraLocale;

/**
 */
public class LocalizationAdapterImpl implements LocalizationAdapter {
    
    /**
     * Temporary workaround for localized labels for Auara Standalone
     */
    private static Map<String, Map<String, String>> labels = new HashMap<String, Map<String, String>>();
    static {
        Map<String, String> todayLabels = new HashMap<String, String>();
        todayLabels.put("ar", "اليوم");
        todayLabels.put("cs", "Dnes");
        todayLabels.put("de", "Heute");
        todayLabels.put("en", "Today");
        todayLabels.put("es", "Hoy");
        todayLabels.put("fr", "aujourd'hui");
        todayLabels.put("ja", "今日");
        todayLabels.put("ko", "오늘");
        todayLabels.put("zh_CN", "今天");
        todayLabels.put("zh_TW", "今天");
        labels.put("task_mode_today", todayLabels);
    }
    
    public LocalizationAdapterImpl() {
    }

    @Override
    public String getLabel(String section, String name, Object... params) {
        Map<String, String> label = labels.get(name);
        if (label == null) {
            return "FIXME - LocalizationAdapter.getLabel() needs implemenation!";
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
        AuraContext context = Aura.getContextService().getCurrentContext();
        // check for nulls - this happens when AuraContextFilter has not been
        // run
        if (context != null) {
            List<Locale> locales = context.getRequestedLocales();
            if (locales != null && locales.size() > 0) {
                return new AuraLocaleImpl(locales.get(0));
            }
        }
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

}
