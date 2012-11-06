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
package org.auraframework.util.type.converter;

import org.auraframework.util.date.DateOnly;
import org.auraframework.util.date.DateService;
import org.auraframework.util.date.DateServiceImpl;
import org.auraframework.util.type.Converter;

public class DateOnlyToStringConverter implements Converter<DateOnly, String> {
    @Override
    public String convert(DateOnly value) {
        if(value == null){
            return null;
        }
        DateService dateService = DateServiceImpl.get();
        return dateService.getDateISO8601Converter().format(value);
    }

    @Override
    public Class<DateOnly> getFrom() {
        return DateOnly.class;
    }

    @Override
    public Class<String> getTo() {
        return String.class;
    }

    @Override
    public Class<?>[] getToParameters() {
        return null;
    }
}
