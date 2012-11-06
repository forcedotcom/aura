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
package org.auraframework.impl.java.type.converter;

import java.util.Locale;

import org.auraframework.Aura;
import org.auraframework.impl.java.type.LocalizedConverter;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.type.converter.IntegerToStringConverter;

/**
 * Used by aura.impl.java.type.JavaLocalizedTypeUtil;
 *
 *
 *
 */
public class LocalizedIntegerToStringConverter
    extends IntegerToStringConverter
    implements LocalizedConverter<Integer, String> {

    @Override
    public String convert(Integer value, AuraLocale locale) {

        if (value == null) {
            return null;
        }

        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale();
        }

        try {
            Locale loc = locale.getNumberLocale();
            return Aura.getLocalizationService().formatNumber(value,loc);
        } catch (Exception e) {
            return super.convert(value);
        }
    }


}
