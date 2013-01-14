/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import org.auraframework.Aura;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.impl.util.AuraLocaleImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.util.AuraLocale;

/**
 */
public class LocalizationAdapterImpl implements LocalizationAdapter {

    public LocalizationAdapterImpl() {
    }

    @Override
    public String getLabel(String section, String name, Object... params) {
        return "FIXME - LocalizationAdapter.getLabel() needs implemenation!";
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
