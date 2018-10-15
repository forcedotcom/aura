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
import java.util.Set;

import javax.inject.Inject;

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

    @Inject
    private ContextService contextService;

    /**
     * Temporary workaround for localized labels
     */
    private final static Map<String, Map<String, String>> labels = new HashMap<>();

    private final Map<String, String> testLabels = new HashMap<>();

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

        // TODO: Only used in Tests, No Use in OSS & core. Remove or move to test labels.
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
        // In OSS, there's no section (namespace) for label
        Map<String, String> label = labels.get(name);
        if (label == null) {
            return this.getTestLabel(section, name);
        }

        String userLangLocale = this.getAuraLocale().getLanguageLocale().toString();
        return label.get(userLangLocale);
    }

    @Override
    public Map<String, Map<String, String>> getLabels(Map<String, Set<String>> keys) {
        Map<String, Map<String, String>> result = new HashMap<>();

        String userLangLocale = this.getAuraLocale().getLanguageLocale().toString();
        for (Map.Entry<String, Set<String>> entry : keys.entrySet()) {
            String section = entry.getKey();
            Map<String, String> pairs = new HashMap<>();
            result.put(section, pairs);

            Set<String> names = entry.getValue();
            for (String name : names) {
                String value;
                Map<String, String> localizedLabels = labels.get(name);
                if (localizedLabels == null) {
                    value = this.getTestLabel(section, name);
                } else {
                    value = localizedLabels.get(userLangLocale);
                }

                if (value != null) {
                    pairs.put(name, value);
                }
            }
        }

        return result;
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
        // use requested locales from context
        // check for nulls - this happens when AuraContextFilter has not been run
        final AuraContext context = contextService.getCurrentContext();
        if (context == null) {
        	throw new IllegalStateException("The AuraContext needs to be initialized before you can retreive the current locale.");
        }
        final List<Locale> locales = context.getRequestedLocales();
        if (locales != null && !locales.isEmpty()) {
            return new AuraLocaleImpl(locales.get(0));
        }

        // none available create a default locale
        return new AuraLocaleImpl();
    }

    @Override
    public void setTestLabel(String section, String name, String value) {
        testLabels.put(getTestLabelKey(section, name), value);
    }

    @Override
    public String getTestLabel(String section, String name) {
        return testLabels.get(getTestLabelKey(section, name));
    }

    @Override
    public String removeTestLabel(String section, String name) {
        return testLabels.remove(getTestLabelKey(section, name));
    }

    private String getTestLabelKey(String section, String name) {
        return section + "." + name;
    }

    @Override
    public Boolean showJapaneseImperialYear() {
        return false;
    }

    @Override
    public String getHtmlTextDirection(Locale locale) {
        switch (locale.getLanguage()) {
            case "ar": // Arabic
            case "fa": // Persian
            case "he": // Hebrew
            case "iw": // Hebrew
            case "ji": // Yiddish
            case "ur": // Urdu
            case "yi": // Yiddish
                return "rtl";
            // special case for en_IL for pseudo-localization.
            case "en":
            case "eo":
                if ("IL".equals(locale.getCountry())) {
                    return "rtl";
                }
        }

        return "ltr";
    }

    @Override
    public String getHtmlLanguage(Locale locale) {
        switch (locale.getLanguage()) {
            case "sh":
                return "sr-Latn";
            case "zh":
                // Handle simplified VS traditional Chinese
                String country = locale.getCountry();
                switch (country) {
                    case "TW":
                    case "HK":
                        return "zh-Hant-" + country;
                    case "SG":
                    case "CN":
                        return "zh-Hans-" + country;
                }
        }

        return locale.toLanguageTag();
    }

    @Override
    public boolean isEasternNameStyle(Locale locale) {
        return false;
    }

}
