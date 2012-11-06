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

public class AuraDateUtil {

    public static Long isoToLong(String isoDateString) {
        Date date = isoToDate(isoDateString);
        return (date != null) ? date.getTime() : null;
    }

    public static Date isoToDate(String isoDateString) {
        if (isoDateString==null || isoDateString.isEmpty()) {
            return null;
        } else {
            return DateServiceImpl.get().getGenericISO8601Converter().parse(isoDateString);
        }
    }

}
