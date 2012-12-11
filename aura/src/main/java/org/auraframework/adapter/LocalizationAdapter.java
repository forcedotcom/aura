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
/*
* Copyright, 1999-2011, salesforce.com All Rights Reserved Company Confidential
 */
package org.auraframework.adapter;

import java.util.Locale;
import java.util.TimeZone;

import org.auraframework.util.AuraLocale;

/**
 * Provides access to AuraLocale instances.
 */
public interface LocalizationAdapter extends AuraAdapter {

    String getLabel(String section, String name, Object...params);

    boolean labelExists(String section, String name);


    /**
     * Gets a default AuraLocale instance for this context.
     *
     * @return a AuraLocale
     */
    AuraLocale getAuraLocale();


    /**
     * Gets an instance of AuraLocale based on the given defaultLocale for this context.
     *
     * @param defaultLocal a Locale
     *
     * @return a AuraLocale based on the defaultLocale value
     */
    AuraLocale getAuraLocale(Locale defaultLocal);


    /**
     * Gets an instance of AuraLocale based on the given parameters for this context.
     *
     * @param defaultLocale a Locale
     * @param timeZone a TimeZone
     * @return a AuraLocale based on the defaultLocale and timeZone values
     */
    AuraLocale getAuraLocale(Locale defaultLocale, TimeZone timeZone);


    /**
     * Gets an instance of AuraLocale based on the given parameters for this context.  Locales
     * can be specified for each type of localization. If null is given for any argument, an appropriate
     * default value may be calculated and used as needed.
     *
     * @param defaultLocale a Locale to use by default. If null is given a default may be assumed.
     * @param currencyLocale a Locale to use for currency amounts if different than the default
     * @param dateLocale a Locale to use for dates and times if different than the default
     * @param languageLocale a Locale to use for Strings if different than the default
     * @param numberLocale a Locale to use for numbers including percentages, if different than the default
     * @param systemLocale the Locale to use as the system default
     * @param timeZone a TimeZone to use
     *
     * @return a AuraLocale based on the given values
     */
    AuraLocale getAuraLocale(Locale defaultLocale, Locale currencyLocale, Locale dateLocale, Locale languageLocale,
            Locale numberLocale, Locale systemLocale, TimeZone timeZone);



}
