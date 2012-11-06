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

import java.util.Date;
import java.util.TimeZone;

public interface DateConverter {
    /**
     * This will format dates based on the JDK's default timezone. For ISO8601 formatting, this is not a problem.
     */
    public String format(Date date);

    /**
     * This will format dates based on the timeZone passed in.
     */
    public String format(Date date, TimeZone timeZone);

    /**
     * This will parse dates based on the JDK's default timezone. For ISO8601 parsing, this works well as the timezone
     * is built into the format.
     */
    public Date parse(String date);

    /**
     * This will parse dates based on the timeZone passed in. Use this, and you'll predictable dates come out the
     * parsing.
     */
    public Date parse(String date, TimeZone timeZone);
}
