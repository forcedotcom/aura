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
package org.auraframework.http.resource;

import org.apache.commons.io.IOUtils;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.system.AuraContext;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.resource.ResourceLoader;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ServiceComponent
public class LocaleDataJsAppender implements InlineJSAppender{

    Map<String, String> localeData;
    LocalizationAdapter localizationAdapter;
    ConfigAdapter configAdapter;
    ExceptionAdapter exceptionAdapter;

    @Inject
    public void setLocalizationAdapter(LocalizationAdapter localizationAdapter){this.localizationAdapter = localizationAdapter;}

    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter){this.configAdapter = configAdapter;}

    @Inject
    public void setExceptionAdapter(ExceptionAdapter exceptionAdapter){this.exceptionAdapter  = exceptionAdapter;}

    @PostConstruct
    public void initialize() {
        localeData = readLocaleData();
    }

    @Override
    public void append(BaseComponentDef def, AuraContext context, Appendable out) throws IOException {
        AuraLocale auraLocale = localizationAdapter.getAuraLocale();

        // Refer to the locale in LocaleValueProvider
        Locale langLocale = auraLocale.getLanguageLocale();
        Locale userLocale = auraLocale.getLocale();

        // This is for backward compatibility. At this moment, there are three locales
        // in Locale Value Provider. Keep them all available for now to avoid breaking consumers.
        String langMomentLocale = this.getMomentLocale(langLocale.toString());
        String userMomentLocale = this.getMomentLocale(userLocale.toString());
        String ltngMomentLocale = this.getMomentLocale(langLocale.getLanguage() + "_" + userLocale.getCountry());

        StringBuilder defineLocaleJs = new StringBuilder();
        // "en" data has been included in moment lib, no need to load locale data
        if (!"en".equals(langMomentLocale)) {
            String content = this.localeData.get(langMomentLocale);
            defineLocaleJs.append(content).append("\n");
        }

        // if user locale is same as language locale, not need to load again
        if (!"en".equals(userMomentLocale) && userMomentLocale != null && !userMomentLocale.equals(langMomentLocale)) {
            String content = this.localeData.get(userMomentLocale);
            defineLocaleJs.append(content);
        }

        if (!"en".equals(ltngMomentLocale) && ltngMomentLocale != null && !ltngMomentLocale.equals(langMomentLocale) && !ltngMomentLocale.equals(userMomentLocale)) {
            String content = this.localeData.get(ltngMomentLocale);
            defineLocaleJs.append(content);
        }

        if (defineLocaleJs.length() > 0) {
            String loadLocaleDataJs = String.format(
                    "\n(function(){\n" +
                    "    function loadLocaleData(){\n%s}\n" +
                    "    window.moment? loadLocaleData() : (window.Aura || (window.Aura = {}), window.Aura.loadLocaleData=loadLocaleData);\n" +
                    "})();\n", defineLocaleJs.toString());

            out.append(loadLocaleDataJs);
        }
    }

    private Map<String, String> readLocaleData() {
        String localeDataPath = "aura/resources/moment/locales.js";

        ResourceLoader resourceLoader = configAdapter.getResourceLoader();
        Map<String, String> localeData = new HashMap<>();
        try (InputStream is = resourceLoader.getResourceAsStream(localeDataPath)) {
            if (is == null) {
                throw new IOException("Locale file doesn't exist: " + localeDataPath);
            }

            Reader reader = new InputStreamReader(is);
            String content = IOUtils.toString(reader);
            // parse out all locale's code
            String[] blocks = content.split("(//! moment.js locale configuration)|(moment.locale\\(\\'en\\'\\);)");

            // ignore the first and the last code block
            for (int i = 1; i < blocks.length - 1; i++) {
                String block = blocks[i];
                // parse out the locale id from comment
                Pattern pattern = Pattern.compile("//! locale.*\\[([\\w-]*)\\]");
                Matcher matcher = pattern.matcher(block);
                if (matcher.find()) {
                    String locale = matcher.group(1).trim();
                    localeData.put(locale, block);
                }
            }
        } catch (Exception e) {
            exceptionAdapter.handleException(e);
        }

        return Collections.unmodifiableMap(localeData);
    }

    private String getMomentLocale(String locale) {
        if(locale == null) {
            return "en";
        }

        // normalize Java locale string to moment locale
        String normalized = locale.toLowerCase().replace("_", "-");
        String[] tokens = normalized.split("-");

        String momentLocale = null;
        if (tokens.length > 1) {
            momentLocale = tokens[0] + "-" + tokens[1];
            if (localeData.containsKey(momentLocale)) {
                return momentLocale;
            }
        }

        momentLocale = tokens[0];
        if (localeData.containsKey(momentLocale)) {
            return momentLocale;
        }

        return "en";
    }

    public Set<String> getMomentLocales() {
        return localeData.keySet();
    }

}
