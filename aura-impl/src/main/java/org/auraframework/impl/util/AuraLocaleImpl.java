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
* Copyright, 1999-2012, salesforce.com All Rights Reserved Company Confidential
 */
package org.auraframework.impl.util;

import java.io.Serializable;
import java.text.DateFormat;
import java.util.*;

import org.auraframework.util.AuraLocale;


/**
 * Encapsulates all the metadata to construct any localization related objects for a given view.
 *
 *
 *
 */
public class AuraLocaleImpl implements AuraLocale, Serializable {

    /**
     * Used for Serialization to ensure class consistency.
     */
    private static final long serialVersionUID = -6304227771656336193L;

    private final Locale systemLocale;

    private final Locale defaultLocale;

    private final Locale currencyLocale;

    private final Locale dateLocale;

    private final Locale languageLocale;

    private final Locale numberLocale;

    private final TimeZone timeZone;



    /**
     * Creates a a default instance.
     */
    public AuraLocaleImpl() {
        this(null,null,null,null,null,null,null);
    }

    /**
     * Creates an instance with the given Locale and that Locale's default TimeZone. Defaults will
     * be chosen for any undefined or null values.
     *
     * @param defaultLocale the Locale to use
     */
    public AuraLocaleImpl(Locale defaultLocale) {
        this(defaultLocale,null,null,null,null,null,null);
    }

    /**
     * Creates an instance with the given Locale and TimeZone. Defaults will be chosen for any
     * undefined or null values.
     *
     * @param defaultLocale the Locale to use
     * @param timeZone the TimeZone to use
     */
    public AuraLocaleImpl(Locale defaultLocale, TimeZone timeZone) {
        this(defaultLocale,null,null,null,null,null,timeZone);
    }

    /**
     * Creates an instance with the given values. Defaults will be chosen for any null values passed in.
     *
     * @param defaultLocale the Locale to use unless otherwise overridden
     * @param currencyLocale the Locale to use for currency amounts if any
     * @param dateLocale the Locale to use for dates and times if any
     * @param languageLocale the Locale to use for Strings if any
     * @param numberLocale the Locale to use for numbers, including percentages if any
     * @param systemLocale the Locale to specify as the system default if any
     * @param timeZone the TimeZone to use
     */
    public AuraLocaleImpl(Locale defaultLocale,
            Locale currencyLocale,
            Locale dateLocale,
            Locale languageLocale,
            Locale numberLocale,
            Locale systemLocale,
            TimeZone timeZone) {

        this.defaultLocale = (defaultLocale!=null) ? defaultLocale : (Locale.getDefault()!=null) ? Locale.getDefault() : Locale.ENGLISH;
        this.currencyLocale = (currencyLocale!=null) ? currencyLocale: this.defaultLocale;
        this.dateLocale =  (dateLocale!=null) ? dateLocale: this.defaultLocale;
        this.languageLocale =  (languageLocale!=null) ? languageLocale: this.defaultLocale;
        this.numberLocale =  (numberLocale!=null) ? numberLocale: this.defaultLocale;
        this.systemLocale =  (systemLocale!=null) ? systemLocale:  (Locale.getDefault()!=null) ? Locale.getDefault() : Locale.ENGLISH;

        if (timeZone==null) {
            try {
                timeZone = DateFormat.getTimeInstance(DateFormat.DEFAULT, getDefaultLocale()).getTimeZone();
            } catch (Exception e) {
                timeZone = TimeZone.getDefault();
            } finally {
                if (timeZone==null) {
                    timeZone = TimeZone.getTimeZone("GMT");
                }
            }
        }
        this.timeZone = timeZone;

    }

    @Override
    public Locale getLocale() {
        return this.getDefaultLocale();
    }

    @Override
    public Locale getDefaultLocale() {
        return this.defaultLocale;
    }

    @Override
    public Locale getCurrencyLocale() {
        return this.currencyLocale;
    }

    @Override
    public Locale getDateLocale() {
        return this.dateLocale;
    }

    @Override
    public Locale getLanguageLocale() {
        return this.languageLocale;
    }

    @Override
    public Locale getNumberLocale() {
        return this.numberLocale;
    }

    @Override
    public Locale getSystemLocale() {
        return this.systemLocale;
    }

    @Override
    public TimeZone getTimeZone() {
        return this.timeZone;
    }

    @Override
    public Calendar getCalendar() {
        return Calendar.getInstance(getTimeZone(), getDateLocale());
    }



}
