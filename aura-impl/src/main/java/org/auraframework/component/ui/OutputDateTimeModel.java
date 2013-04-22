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
package org.auraframework.component.ui;

import java.util.Calendar;
import java.util.Locale;
import java.util.TimeZone;

import org.auraframework.Aura;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.LocalizationService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.date.DateService;
import org.auraframework.util.date.DateServiceImpl;

/**
 * A Aura model that backs the ui:outputDateTime Aura component.
 */
@Model
public class OutputDateTimeModel {

    @AuraEnabled
    public String getText() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();

        Calendar cal;
        try {
            Object valueObj = component.getAttributes().getValue("value");
            if (valueObj == null) {
                return "";
            }
            cal = (Calendar) valueObj;
        } catch (NumberFormatException e) {
            // Handles the case where converting a literal "value" attribute
            // long (milliseconds) value fails
            return "Value must be a value in milliseconds or bound to a java.util.Calendar model value";
        } catch (ClassCastException e) {
            return "Value must be bound to a model value that resolves to a java.util.Calendar";
        }

        TimeZone tz = null;
        String timezoneAttr = (String) component.getAttributes().getValue("timezone");
        if (timezoneAttr != null) {
            tz = TimeZone.getTimeZone(timezoneAttr);
        }
        // should this be made accessible in the component?
        Locale loc = null;

        String format = (String) component.getAttributes().getValue("format");
        LocalizationService lclService = Aura.getLocalizationService();

        if (format == null) {
            String dateStyle = (String) component.getAttributes().getValue("dateStyle");
            String timeStyle = (String) component.getAttributes().getValue("timeStyle");
            DateService dateService = DateServiceImpl.get();
            int intDateStyle = dateService.getStyle(dateStyle);
            int intTimeStyle = dateService.getStyle(timeStyle);
            return lclService.formatDateTime(cal.getTime(), loc, tz, intDateStyle, intTimeStyle);
        } else {
            // no pattern, no result
            if (AuraTextUtil.isEmptyOrWhitespace(format)) {
                return "";
            } else {
                try {
                    return lclService.formatDateTime(cal.getTime(), loc, tz, format);
                } catch (IllegalArgumentException e) {
                    return "You must provide a valid format: " + e.getMessage();
                }
            }

        }
    }
}
