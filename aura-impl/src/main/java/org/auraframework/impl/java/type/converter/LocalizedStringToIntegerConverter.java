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
package org.auraframework.impl.java.type.converter;

import java.util.Locale;

import javax.inject.Inject;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.impl.java.type.LocalizedConverter;
import org.auraframework.service.LocalizationService;
import org.auraframework.util.AuraLocale;
import org.springframework.context.annotation.Lazy;

/**
 * Used by aura.impl.java.type.JavaLocalizedTypeUtil;
 */
@ServiceComponent
public class LocalizedStringToIntegerConverter implements LocalizedConverter<String, Integer> {

    @Inject
    @Lazy
    LocalizationAdapter localizationAdapter;

    @Inject
    @Lazy
    LocalizationService localizationService;

    @Override
    public Integer convert(String value, AuraLocale locale) {
        if (value == null || value.isEmpty()) {
            return null;
        }

        if (locale == null) {
            locale = localizationAdapter.getAuraLocale();
        }

        try {
            Locale loc = locale.getNumberLocale();
            return new Integer(localizationService.parseInt(value, loc));
        } catch (Exception e) {
            return convert(value);
        }
    }

    @Override
    public Integer convert(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException ex) {
            // Value had decimal precision probably. Try parsing it as a float and returning
            // only the integer portion.
            return convertAsFloat(value);
        }
    }

    private Integer convertAsFloat(String value) {
        try {
            return Float.valueOf(value).intValue();
        } catch (NumberFormatException ex) {
            // fail gracefully, we don't want to bubble an exception here
            return null;
        }
    }

    @Override
    public Class<String> getFrom() {
        return String.class;
    }

    @Override
    public Class<Integer> getTo() {
        return Integer.class;
    }

    @Override
    public Class<?>[] getToParameters() {
        return null;
    }

}
