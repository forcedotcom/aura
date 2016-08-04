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

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.impl.java.type.LocalizedConverter;
import org.auraframework.service.LocalizationService;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.type.converter.IntegerToStringConverter;
import org.springframework.context.annotation.Lazy;

import javax.inject.Inject;
import java.util.Locale;

/**
 * Used by aura.impl.java.type.JavaLocalizedTypeUtil;
 */
@Lazy
@ServiceComponent
public class LocalizedIntegerToStringConverter extends IntegerToStringConverter implements
        LocalizedConverter<Integer, String> {

    @Inject
    LocalizationAdapter localizationAdapter;

    @Inject
    LocalizationService localizationService;

    @Override
    public String convert(Integer value, AuraLocale locale) {

        if (value == null) {
            return null;
        }

        if (locale == null) {
            locale = localizationAdapter.getAuraLocale();
        }

        try {
            Locale loc = locale.getNumberLocale();
            return localizationService.formatNumber(value, loc);
        } catch (Exception e) {
            return super.convert(value);
        }
    }

}
