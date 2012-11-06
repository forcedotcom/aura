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
package org.auraframework.util;

import java.io.Serializable;
import java.util.*;

/**
 * Encapsulates all the metadata to construct any localization related objects for a given view.
 *
 *
 *
 */
public interface AuraLocale extends Serializable {



    /**
     * A convenience method that returns the same value as getDefaultLocale().
     *
     * @return a non-null Locale object for the current context
     */
    public Locale getLocale();


    /**
     * Returns the current Locale, which can be used for any localization purpose. This is typically per user
     * or per request.
     *
     * @return a non-null Locale object for the current context
     */
    public Locale getDefaultLocale();


    /**
     * Returns the default locale for the system. This is typically per app or per server.
     *
     * @return the system default locale
     */
    public Locale getSystemLocale();


    /**
     * Returns the language Locale, which may differ from the default, for example, if used to generate
     * labels in a UI and translated resource bundles for the user's default Locale are not available.
     *
     * @return a Locale to use for String lookups
     */
    public Locale getLanguageLocale();


    /**
     * Returns a date and time appropriate Locale, which may differ from the default, for example, if
     * used to generate a calendar component with date selection and the component has only been
     * localized into a certain list of languages.
     *
     * @return a Locale to use for Date, Time, and Calendar related lookups
     */
    public Locale getDateLocale();


    /**
     * Returns a Locale to use when parsing and formatting numbers, including percentages.
     *
     * @return a Locale to use for numbers
     */
    public Locale getNumberLocale();


    /**
     * Returns a Locale to use when parsing and formatting currency amounts, if that currency amount
     * does not have a specified currency type (unusual), and if the default Locale is not appropriate.
     *
     * @return a Locale to use for default currency amounts
     */
    public Locale getCurrencyLocale();


    /**
     * Returns a TimeZone definition for use when displaying times to a user, so they can view times in
     * their local reference time, rather than in UTC/GMT.
     *
     * @return a non-null TimeZone
     */
    public TimeZone getTimeZone();


    /**
     * Returns a Calendar based on the Locale and TimeZone of this instance.
     *
     * @return a Calendar
     */
    public Calendar getCalendar();

}
