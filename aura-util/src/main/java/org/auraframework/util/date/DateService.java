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
package org.auraframework.util.date;

import java.text.DateFormat;
import java.util.Locale;

public interface DateService {

    public static final int SHORT = DateFormat.SHORT;
    public static final int MEDIUM = DateFormat.MEDIUM;
    public static final int LONG = DateFormat.LONG;
    public static final int FULL = DateFormat.FULL;
    public static final int NONE = -1; // no formatting

    /**
     * An ISO8601 converter for date/time.
     */
    public DateConverter getDateTimeISO8601Converter();

    /**
     * An ISO8601 converter for dates.
     */
    public DateConverter getDateISO8601Converter();

    /**
     * An ISO8601 converter which will try multiple conversion types against passed in values until
     * one works.
     */
    public DateConverter getGenericISO8601Converter();

    /**
     * Both dateStyle and timeStyle are based on Java's DateFormat.SHORT, MEDIUM, LONG, and FULL values.  An
     * additional value should also be supported - DateService,NONE (or -1).
     */
    public DateConverter getDateTimeStyleConverter(Locale locale, int dateStyle, int timeStyle);

    /**
     * Both dateType and timeType are based on Java's DateFormat.SHORT, MEDIUM, LONG, and FULL values.  An
     * additional value should also be supported - DateService,NONE (or -1).
     */
    public DateConverter getDateStyleConverter(Locale locale, int dateStyle);

    /**
     * Both dateType and timeType are based on Java's DateFormat.SMALL, MEDIUM, LONG, and FULL values.  An
     * additional value should also be supported - DateService,NONE (or -1).
     */
    public DateConverter getTimeStyleConverter(Locale locale, int timeStyle);

    /**
     * Pattern is normally based on java.date.SimpleDateFormat syntax.  Implementation may differ.
     *
     * @see <a href="http://docs.oracle.com/javase/6/docs/api/java/text/SimpleDateFormat.html">SimpleDateFormat</a>
     */
    public DateConverter getPatternConverter(Locale locale, String pattern);

    /**
     * Converts the words small, medium, large, or full to a DateFormat style integer.
     */
    public int getStyle(String style);

}
